import { NextResponse } from 'next/server';
import type { LeadPayload, SystemConfig } from '@/types';

const WIX_CONTACTS_URL = 'https://www.wixapis.com/contacts/v4/contacts';
const WIX_DATA_URL     = 'https://www.wixapis.com/wix-data/v2/items';

const HOME_SIZE_LABELS: Record<string, string> = {
  small:  'Small (1500–2500 sq ft)',
  medium: 'Medium (2500–3500 sq ft)',
  large:  'Large (exceeds 3500 sq ft)',
};

const MAX_NAME_LEN          = 120;
const MAX_EMAIL_LEN         = 254;
const MAX_PHONE_LEN         = 40;
const MAX_ADDRESS_LEN       = 300;
const MAX_EQUIPMENT_LEN     = 2000;
const MAX_DOORS             = 50;   // server-side ceiling (UI caps at 15)
const MAX_ESTIMATE          = 1_000_000;

// Permissive but bounded email check; full RFC validation isn't worth it here.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationOk  { ok: true;  payload: LeadPayload; }
interface ValidationErr { ok: false; message: string; }
type ValidationResult = ValidationOk | ValidationErr;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function validateLead(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, message: 'Invalid request body.' };
  }
  const b = raw as Record<string, unknown>;

  const name    = isString(b.name)    ? b.name.trim()    : '';
  const email   = isString(b.email)   ? b.email.trim()   : '';
  const phone   = isString(b.phone)   ? b.phone.trim()   : '';
  const address = isString(b.address) ? b.address.trim() : '';
  const equipmentList = isString(b.equipmentList) ? b.equipmentList : '';

  if (!name  || name.length  > MAX_NAME_LEN)  return { ok: false, message: 'Invalid name.' };
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email))
    return { ok: false, message: 'Invalid email.' };
  if (!phone || phone.length > MAX_PHONE_LEN) return { ok: false, message: 'Invalid phone.' };
  if (address.length > MAX_ADDRESS_LEN)        return { ok: false, message: 'Invalid address.' };
  if (equipmentList.length > MAX_EQUIPMENT_LEN)
    return { ok: false, message: 'Invalid equipment list.' };

  const sc = b.systemConfig;
  if (!sc || typeof sc !== 'object') return { ok: false, message: 'Invalid systemConfig.' };
  const s = sc as Record<string, unknown>;

  const allowedHomeTypes    = ['single-family', 'condo', 'townhouse', 'business'];
  const allowedHomeSizes    = ['small', 'medium', 'large'];
  const allowedCameraScopes = ['front-only', 'perimeter', 'full-coverage', 'no-surveillance'];
  const allowedTiers        = ['Essential', 'Complete', 'Ultimate'];

  const homeType    = s.homeType    == null ? null : String(s.homeType);
  const homeSize    = s.homeSize    == null ? null : String(s.homeSize);
  const cameraScope = s.cameraScope == null ? null : String(s.cameraScope);
  const tier        = s.tier        == null ? null : String(s.tier);

  if (homeType    !== null && !allowedHomeTypes.includes(homeType))       return { ok: false, message: 'Invalid homeType.' };
  if (homeSize    !== null && !allowedHomeSizes.includes(homeSize))       return { ok: false, message: 'Invalid homeSize.' };
  if (cameraScope !== null && !allowedCameraScopes.includes(cameraScope)) return { ok: false, message: 'Invalid cameraScope.' };
  if (tier        !== null && !allowedTiers.includes(tier))               return { ok: false, message: 'Invalid tier.' };

  const doors = isFiniteNumber(s.doors) ? Math.floor(s.doors) : 1;
  if (doors < 0 || doors > MAX_DOORS) return { ok: false, message: 'Invalid doors.' };

  const estimateLow  = isFiniteNumber(b.estimateLow)  ? b.estimateLow  : 0;
  const estimateHigh = isFiniteNumber(b.estimateHigh) ? b.estimateHigh : 0;
  if (estimateLow  < 0 || estimateLow  > MAX_ESTIMATE) return { ok: false, message: 'Invalid estimateLow.' };
  if (estimateHigh < 0 || estimateHigh > MAX_ESTIMATE) return { ok: false, message: 'Invalid estimateHigh.' };

  const systemConfig: SystemConfig = {
    homeType:    homeType    as SystemConfig['homeType'],
    homeSize:    homeSize    as SystemConfig['homeSize'],
    cameraScope: cameraScope as SystemConfig['cameraScope'],
    tier:        tier        as SystemConfig['tier'],
    doors,
  };

  return {
    ok: true,
    payload: { name, email, phone, address, systemConfig, estimateLow, estimateHigh, equipmentList },
  };
}

function splitName(name: string): { first: string; last: string | undefined } {
  // Collapse arbitrary whitespace; treat the first token as first name and
  // everything after as last name. Single-word names get an undefined last so
  // we don't send an empty string to Wix.
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: undefined };
  if (parts.length === 1) return { first: parts[0], last: undefined };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body.' }, { status: 400 });
  }

  const result = validateLead(raw);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  const { name, email, phone, address, systemConfig, estimateLow, estimateHigh, equipmentList } = result.payload;

  const apiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID;

  if (!apiKey || !siteId) {
    console.warn('[leads] WIX_API_KEY or WIX_SITE_ID not set — lead not saved:', { name, email });
    return NextResponse.json({ success: true, dev: true });
  }

  const headers = {
    'Content-Type': 'application/json',
    // Wix site-scoped API keys are sent as the raw token (no "Bearer" prefix).
    Authorization: apiKey,
    'wix-site-id': siteId,
  };

  const { first: firstName, last: lastName } = splitName(name);

  // ── 1. Save to Wix CRM Contacts ───────────────────────────────────────────
  const contactPayload = {
    info: {
      name: { first: firstName, ...(lastName ? { last: lastName } : {}) },
      emails:    { items: [{ tag: 'MAIN',   email }] },
      phones:    { items: [{ tag: 'MOBILE', phone }] },
      addresses: address
        ? { items: [{ tag: 'HOME', address: { addressLine: address } }] }
        : undefined,
      extendedFields: {
        items: {
          'custom.projectAddress':   address,
          'custom.securityTier':     systemConfig.tier ?? '',
          'custom.cameraScope':      systemConfig.cameraScope ?? '',
          'custom.homeType':         systemConfig.homeType ?? '',
          'custom.homeSize':
            systemConfig.homeSize ? HOME_SIZE_LABELS[systemConfig.homeSize] ?? systemConfig.homeSize : '',
          'custom.estimateRange':    `$${estimateLow.toLocaleString()} – $${estimateHigh.toLocaleString()}`,
          'custom.source':           'estimator-calculator',
        },
      },
    },
  };

  try {
    const contactRes = await fetch(WIX_CONTACTS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactPayload),
    });

    if (!contactRes.ok) {
      const err = await contactRes.text();
      console.error('[leads] Wix Contacts error:', contactRes.status, err);
    } else {
      const data = await contactRes.json();
      console.info('[leads] Created Wix contact:', data.contact?.id);
    }
  } catch (err) {
    console.error('[leads] Network error (Contacts):', err);
  }

  // ── 2. Save to EstimatorLeads Data Collection ─────────────────────────────
  const dataPayload = {
    dataCollectionId: 'SecurityEstimatorLeads',
    dataItem: {
      data: {
        name,
        email,
        phone,
        address,
        homeType:    systemConfig.homeType    ?? '',
        cameraScope: systemConfig.cameraScope ?? '',
        tier:        systemConfig.tier        ?? '',
        doors:       systemConfig.doors,
        homeSize:    systemConfig.homeSize ?? '',
        estimateLow,
        estimateHigh,
        equipmentList: equipmentList ?? '',
      },
    },
  };

  try {
    const dataRes = await fetch(WIX_DATA_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(dataPayload),
    });

    if (!dataRes.ok) {
      const err = await dataRes.text();
      console.error('[leads] Wix Data error:', dataRes.status, err);
      return NextResponse.json({ error: 'Database save failed' }, { status: 502 });
    }

    const data = await dataRes.json();
    console.info('[leads] Saved to EstimatorLeads:', data.dataItem?.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[leads] Network error (Data):', err);
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}
