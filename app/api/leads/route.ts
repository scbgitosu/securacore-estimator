import { NextResponse } from 'next/server';
import type { LeadPayload } from '@/types';

const WIX_CONTACTS_URL = 'https://www.wixapis.com/contacts/v4/contacts';
const WIX_DATA_URL     = 'https://www.wixapis.com/wix-data/v2/items';

export async function POST(request: Request) {
  const body: LeadPayload = await request.json();
  const { name, email, phone, address, systemConfig, estimateLow, estimateHigh } = body;

  const apiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID;

  if (!apiKey || !siteId) {
    console.warn('[leads] WIX_API_KEY or WIX_SITE_ID not set — lead not saved:', { name, email });
    return NextResponse.json({ success: true, dev: true });
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: apiKey,
    'wix-site-id': siteId,
  };

  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ');

  // ── 1. Save to Wix CRM Contacts ───────────────────────────────────────────
  const contactPayload = {
    info: {
      name: { first: firstName, last: lastName },
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
        windows:     systemConfig.windows,
        estimateLow,
        estimateHigh,
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
