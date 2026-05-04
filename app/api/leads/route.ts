import { NextResponse } from 'next/server';
import type { LeadPayload } from '@/types';

// Wix Contacts API v4
// Docs: https://dev.wix.com/docs/rest/api-reference/crm/contacts/contacts/create-contact
const WIX_CONTACTS_URL = 'https://www.wixapis.com/contacts/v4/contacts';

export async function POST(request: Request) {
  const body: LeadPayload = await request.json();
  const { name, email, phone, address, systemConfig, estimateLow, estimateHigh } = body;

  const apiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID;

  if (!apiKey || !siteId) {
    // In development without Wix credentials, log and return success
    console.warn('[leads] WIX_API_KEY or WIX_SITE_ID not set — lead not saved to CRM:', { name, email });
    return NextResponse.json({ success: true, dev: true });
  }

  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ');

  const configSummary = [
    `Home Type: ${systemConfig.homeType ?? 'n/a'}`,
    `Doors: ${systemConfig.doors} | Windows: ${systemConfig.windows}`,
    `Camera Scope: ${systemConfig.cameraScope ?? 'n/a'}`,
    `Tier: ${systemConfig.tier ?? 'n/a'}`,
    `Estimate: $${estimateLow.toLocaleString()} – $${estimateHigh.toLocaleString()}`,
  ].join('\n');

  const contactPayload = {
    info: {
      name: { first: firstName, last: lastName },
      emails: {
        items: [{ tag: 'MAIN', email }],
      },
      phones: {
        items: [{ tag: 'MOBILE', phone }],
      },
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
          'custom.systemConfigJson': JSON.stringify(systemConfig),
          'custom.source':           'estimator-calculator',
        },
      },
    },
  };

  try {
    const res = await fetch(WIX_CONTACTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
        'wix-site-id': siteId,
      },
      body: JSON.stringify(contactPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[leads] Wix API error:', res.status, errText);
      return NextResponse.json({ error: 'CRM save failed' }, { status: 502 });
    }

    const data = await res.json();
    console.info('[leads] Created Wix contact:', data.contact?.id, '|', configSummary);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[leads] Network error calling Wix API:', err);
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}
