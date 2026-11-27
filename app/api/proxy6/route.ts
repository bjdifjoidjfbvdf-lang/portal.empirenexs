import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'getBalance';
  const apiKey = (searchParams.get('apiKey') || process.env.PROXY6_API_KEY || '').trim();

  if (!apiKey) {
    // If no API key configured yet, return a safe simulated state
    return NextResponse.json({
      success: true,
      simulated: true,
      balance: 24.50,
      currency: 'USD',
      message: 'Dedicated proxy API Key not configured. Running in preview mode.',
    });
  }

  try {
    // Check available stock for a specific country
    if (action === 'checkStock') {
      const countryParam = (searchParams.get('country') || 'de').toLowerCase().trim();
      const countRes = await fetch(`https://px6.link/api/${apiKey}/getcount/?country=${countryParam}&version=4`, { cache: 'no-store' });
      const countData = await countRes.json();
      return NextResponse.json({
        success: true,
        country: countryParam.toUpperCase(),
        count: typeof countData.count === 'number' ? countData.count : 0,
      });
    }

    // Official Proxy6 API endpoint: https://px6.link/api/{apiKey}/{method}/?{params}
    const apiUrl = `https://px6.link/api/${apiKey}/getproxy/`;
    const res = await fetch(apiUrl, { cache: 'no-store' });
    const data = await res.json();

    if (data.status === 'yes') {
      return NextResponse.json({
        success: true,
        balance: parseFloat(data.balance || '0'),
        currency: data.currency || 'USD',
        count: data.count || 0,
        list: data.list || {},
      });
    }

    return NextResponse.json({
      success: false,
      error: data.error_id || 'UNKNOWN_ERROR',
      message: data.error || 'Failed to authenticate with proxy provider API',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      message: 'Network error connecting to proxy service',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Strictly enforce version '4' (Proxy6 IPv4 Dedicated - Individual use. In one hand. Suitable for all sites)
    const { action, apiKey: rawKey, country = 'de', period = 28, count = 1, type = 'http', ids } = body;
    const version = '4'; // STRICT: Always IPv4 Proxy (Individual use / In one hand)
    const apiKey = (rawKey || process.env.PROXY6_API_KEY || '31e70f0958-42f8755ad4-890c13f45a').trim();

    // 1. Buy Proxy on Proxy6
    if (action === 'buy') {
      const cleanCountry = (country || 'de').toLowerCase().trim();
      // Proxy6 requires a minimum period of 7 days for IPv4
      const safePeriod = Math.max(7, Number(period) || 7);

      if (!apiKey) {
        // Simulated instant purchase for preview if API key not provided yet
        const simId = `sim-px-${Date.now()}`;
        const randomIp = `194.26.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 2)}`;
        const randomPort = Math.floor(Math.random() * 8000 + 1000);
        return NextResponse.json({
          success: true,
          simulated: true,
          proxy: {
            proxy6Id: simId,
            ip: randomIp,
            port: randomPort,
            user: `px_user_${Math.floor(Math.random() * 90000 + 10000)}`,
            pass: `pX@${Math.floor(Math.random() * 900000 + 100000)}`,
            type: type || 'http',
            country: cleanCountry.toUpperCase(),
            version: 'ipv4',
            costUsd: 1.77,
            expiresAt: new Date(Date.now() + safePeriod * 86400000).toISOString(),
          },
        });
      }

      // Step A: Pre-check available stock on Proxy6 to prevent "Error active proxy allow"
      try {
        const countUrl = `https://px6.link/api/${apiKey}/getcount/?country=${cleanCountry}&version=${version}`;
        const countRes = await fetch(countUrl, { cache: 'no-store' });
        const countData = await countRes.json();
        if (countData.status === 'yes' && typeof countData.count === 'number' && countData.count <= 0) {
          return NextResponse.json({
            success: false,
            error_id: 300,
            error: 'OUT_OF_STOCK',
            message: `Stock Alert: Currently 0 proxies are in stock for "${cleanCountry.toUpperCase()}" on Proxy6. Please select an in-stock country (such as Germany DE, Canada CA, Netherlands NL, France FR, or Spain ES) and try again.`,
          }, { status: 400 });
        }
      } catch (countErr) {
        console.warn('Proxy6 stock check error:', countErr);
      }

      // Step B: Live buy on Proxy6
      // https://px6.link/api/{api_key}/buy/?count={count}&period={period}&country={country}&version={version}&type={type}
      const buyUrl = `https://px6.link/api/${apiKey}/buy/?count=${count}&period=${safePeriod}&country=${cleanCountry}&version=${version}&type=${type}`;
      const res = await fetch(buyUrl, { cache: 'no-store' });
      const data = await res.json();

      if (data.status === 'yes' && data.list) {
        const firstKey = Object.keys(data.list)[0];
        const item = data.list[firstKey];
        return NextResponse.json({
          success: true,
          balance: parseFloat(data.balance || '0'),
          proxy: {
            proxy6Id: String(item.id || firstKey),
            ip: item.ip,
            port: item.port,
            user: item.user,
            pass: item.pass,
            type: item.type || type,
            country: item.country || cleanCountry.toUpperCase(),
            version: 'ipv4',
            costUsd: parseFloat(data.price || '1.40'),
            expiresAt: item.date_end || new Date(Date.now() + safePeriod * 86400000).toISOString(),
          },
        });
      }

      // Friendly interpretation of Proxy6 errors
      let friendlyError = data.error || 'Proxy purchase declined.';
      if (data.error_id === 300 || data.error?.toLowerCase().includes('active proxy allow')) {
        friendlyError = `Stock Alert (Error active proxy allow): Currently there are 0 available proxies in stock for "${cleanCountry.toUpperCase()}" on Proxy6. Please select another country (such as Germany DE, Canada CA, Netherlands NL, France FR, or Spain ES).`;
      } else if (data.error_id === 210 || data.error?.toLowerCase().includes('period')) {
        friendlyError = `Rental Period Error: Proxy6 requires a minimum rental period of 7 days for dedicated IPv4 proxies.`;
      } else if (data.error_id === 110 || data.error?.toLowerCase().includes('balance')) {
        friendlyError = `Insufficient Proxy6 account balance. Please contact Founder & CEO Waqas Gill to top up the provider balance.`;
      }

      return NextResponse.json({
        success: false,
        error: data.error_id,
        message: friendlyError,
      }, { status: 400 });
    }

    // 2. Prolong / Renew Proxy
    if (action === 'prolong') {
      if (!apiKey) {
        return NextResponse.json({
          success: true,
          simulated: true,
          newExpiry: new Date(Date.now() + period * 86400000).toISOString(),
          message: 'Proxy extended by 30 days (Test Simulation)',
        });
      }

      const prolongUrl = `https://px6.link/api/${apiKey}/prolong/?period=${period}&ids=${ids}`;
      const res = await fetch(prolongUrl, { cache: 'no-store' });
      const data = await res.json();

      if (data.status === 'yes') {
        let newExpiry = new Date(Date.now() + period * 86400000).toISOString();
        if (data.list && typeof data.list === 'object') {
          const firstId = Object.keys(data.list)[0];
          if (firstId && data.list[firstId]?.date_end) {
            newExpiry = new Date(data.list[firstId].date_end).toISOString();
          }
        }
        return NextResponse.json({
          success: true,
          balance: parseFloat(data.balance || '0'),
          newExpiry,
          price: parseFloat(data.price || '0'),
          data,
        });
      }

      return NextResponse.json({
        success: false,
        error: data.error_id,
        message: data.error || 'Failed to prolong proxy.',
      }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
