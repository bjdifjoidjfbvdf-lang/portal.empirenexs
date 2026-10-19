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
      message: 'Proxy6 API Key not configured in Settings. Running in test preview mode.',
    });
  }

  try {
    // Proxy6 official API endpoint: https://proxy6.net/api/{apiKey}/{action}
    const apiUrl = `https://proxy6.net/api/${apiKey}/getproxy`;
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
      message: data.error || 'Failed to authenticate with Proxy6.net API',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      message: 'Network error connecting to proxy6.net',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, apiKey: rawKey, country = 'us', period = 30, count = 1, version = '4', type = 'http', ids } = body;
    const apiKey = (rawKey || process.env.PROXY6_API_KEY || '').trim();

    // 1. Buy Proxy on Proxy6
    if (action === 'buy') {
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
            country: country.toUpperCase(),
            version: 'ipv4',
            costUsd: 1.77,
            expiresAt: new Date(Date.now() + period * 86400000).toISOString(),
          },
        });
      }

      // Live buy on proxy6.net
      // https://proxy6.net/api/{api_key}/buy?count={count}&period={period}&country={country}&version={version}&type={type}
      const buyUrl = `https://proxy6.net/api/${apiKey}/buy?count=${count}&period=${period}&country=${country.toLowerCase()}&version=${version}&type=${type}`;
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
            country: item.country || country.toUpperCase(),
            version: 'ipv4',
            costUsd: parseFloat(data.price || '1.77'),
            expiresAt: item.date_end || new Date(Date.now() + period * 86400000).toISOString(),
          },
        });
      }

      return NextResponse.json({
        success: false,
        error: data.error_id,
        message: data.error || 'Proxy6 purchase declined. Please check your Proxy6 account balance.',
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

      const prolongUrl = `https://proxy6.net/api/${apiKey}/prolong?period=${period}&ids=${ids}`;
      const res = await fetch(prolongUrl, { cache: 'no-store' });
      const data = await res.json();

      if (data.status === 'yes') {
        return NextResponse.json({
          success: true,
          balance: parseFloat(data.balance || '0'),
          data,
        });
      }

      return NextResponse.json({
        success: false,
        error: data.error_id,
        message: data.error || 'Failed to prolong proxy on Proxy6.',
      }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
