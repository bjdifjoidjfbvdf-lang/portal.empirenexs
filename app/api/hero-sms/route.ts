import { NextRequest, NextResponse } from 'next/server';

// Official Hero-SMS live endpoint
const HERO_SMS_API = 'https://hero-sms.com/stubs/handler_api.php';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const rawApiKey = searchParams.get('apiKey') || process.env.HERO_SMS_API_KEY || '';
  const apiKey = rawApiKey.replace(/^ApiKey\s+/i, '').trim();
  const orderId = searchParams.get('orderId');

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API_KEY_REQUIRED',
      message: 'Hero-SMS API Key is missing. Please provide your Hero-SMS API Key in Settings.',
    }, { status: 400 });
  }

  // 1. Check Real Account Balance on Hero-SMS
  if (action === 'getBalance') {
    try {
      const res = await fetch(`${HERO_SMS_API}?api_key=${apiKey}&action=getBalance`, {
        cache: 'no-store',
      });
      const text = await res.text();

      if (text.includes('ACCESS_BALANCE:')) {
        const balance = parseFloat(text.split(':')[1]);
        return NextResponse.json({ success: true, balance });
      }

      return NextResponse.json({ success: false, error: text });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  // 2. Check Order Status / Fetch Real OTP from Hero-SMS
  if (action === 'getStatus') {
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    try {
      const res = await fetch(`${HERO_SMS_API}?api_key=${apiKey}&action=getStatus&id=${orderId}`, {
        cache: 'no-store',
      });
      const text = await res.text();

      // STATUS_OK:123456
      if (text.includes('STATUS_OK:')) {
        const code = text.split(':')[1].trim();
        return NextResponse.json({ success: true, status: 'STATUS_OK', code });
      }

      if (text.includes('STATUS_WAIT_CODE')) {
        return NextResponse.json({ success: true, status: 'STATUS_WAIT_CODE' });
      }

      if (text.includes('STATUS_CANCEL')) {
        return NextResponse.json({ success: true, status: 'STATUS_CANCEL' });
      }

      return NextResponse.json({ success: false, status: text, error: text });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  // 3. Check Current Live Rate for Indonesia (service: go)
  if (action === 'getPrice') {
    try {
      const res = await fetch(`${HERO_SMS_API}?api_key=${apiKey}&action=getPrices&service=go&country=6`, {
        cache: 'no-store',
      });
      const data = await res.json();
      const cost = data?.['6']?.['go']?.cost || 0.036;
      const count = data?.['6']?.['go']?.count || 0;
      return NextResponse.json({ success: true, country: 'Indonesia (+62)', countryId: 6, service: 'go', cost, count });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, apiKey: rawApiKey, orderId } = body;
    const apiKey = (rawApiKey || process.env.HERO_SMS_API_KEY || '').replace(/^ApiKey\s+/i, '').trim();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API_KEY_REQUIRED',
        message: 'Hero-SMS API Key is missing. Please configure your Hero-SMS API Key in Settings.',
      }, { status: 400 });
    }

    // Action 1: Buy Real Google/YouTube Indonesia number (Always Indonesia, Budget Cap: $0.040)
    if (action === 'buyNumber') {
      const service = 'go'; // Google / YouTube / Gmail
      const country = '6';  // Indonesia ID in Hero-SMS (Country code +62)
      const MAX_ALLOWED_PRICE = 0.040; // Strict budget limit: $0.03 - $0.04 (Reject purchase if rate is higher)

      // Step A: Real-time price check for Indonesia
      let currentRate = 0.036;
      try {
        const priceCheckUrl = `${HERO_SMS_API}?api_key=${apiKey}&action=getPrices&service=${service}&country=${country}`;
        const pRes = await fetch(priceCheckUrl, { cache: 'no-store' });
        const pText = await pRes.text();
        const pData = JSON.parse(pText);
        const fetchedCost = pData?.[country]?.[service]?.cost;
        if (typeof fetchedCost === 'number') {
          currentRate = fetchedCost;
          if (fetchedCost > MAX_ALLOWED_PRICE) {
            return NextResponse.json({
              success: false,
              error: 'PRICE_EXCEEDED',
              message: `Price Limit Exceeded: Indonesia number rate is currently $${fetchedCost.toFixed(3)}, which exceeds the maximum allowed budget limit ($0.03 - $0.04). Purchase stopped to prevent extra charges.`,
            }, { status: 400 });
          }
        }
      } catch (priceErr) {
        console.warn('Hero-SMS price check warning:', priceErr);
      }

      // Step B: Purchase number with maxPrice safeguard
      const buyUrl = `${HERO_SMS_API}?api_key=${apiKey}&action=getNumber&service=${service}&country=${country}&maxPrice=${MAX_ALLOWED_PRICE}`;
      const res = await fetch(buyUrl, { cache: 'no-store' });
      const text = await res.text();

      // Successful purchase response: ACCESS_NUMBER:orderId:phoneNumber
      if (text.includes('ACCESS_NUMBER:')) {
        const parts = text.split(':');
        const heroOrderId = parts[1].trim();
        let number = parts[2].trim();
        if (!number.startsWith('+')) {
          number = '+' + number;
        }

        return NextResponse.json({
          success: true,
          orderId: heroOrderId,
          phoneNumber: number,
          service: 'Google / YouTube / Gmail',
          country: 'Indonesia (+62)',
          cost: `$${currentRate.toFixed(3)}`,
          costNum: currentRate,
          provider: 'Hero-SMS (hero-sms.com)',
          expiresInSeconds: 300, // 5 minutes
        });
      }

      // Handle standard Hero-SMS error codes
      let friendlyError = text;
      if (text.includes('NO_BALANCE')) {
        friendlyError = 'Hero-SMS account has insufficient balance. Please top up your account at hero-sms.com.';
      } else if (text.includes('NO_NUMBERS')) {
        friendlyError = `No Indonesia numbers are currently available at the budget rate ($0.036) on Hero-SMS. Please try again shortly.`;
      } else if (text.includes('BAD_KEY')) {
        friendlyError = 'Hero-SMS API Key is invalid. Please copy the correct API Key from hero-sms.com and update Settings.';
      }

      return NextResponse.json({ success: false, error: text, message: friendlyError });
    }

    // Action 2: Cancel Order & Refund on Hero-SMS
    if (action === 'cancelOrder') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
      }

      // Status 8 = Cancel activation and refund money on Hero-SMS
      const cancelUrl = `${HERO_SMS_API}?api_key=${apiKey}&action=setStatus&status=8&id=${orderId}`;
      const res = await fetch(cancelUrl, { cache: 'no-store' });
      const text = await res.text();

      return NextResponse.json({
        success: true,
        response: text,
        message: 'Order cancelled on Hero-SMS and refunded to your Hero-SMS balance.',
      });
    }

    // Action 3: Complete Activation on Hero-SMS
    if (action === 'completeOrder') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
      }

      // Status 6 = Complete activation
      const completeUrl = `${HERO_SMS_API}?api_key=${apiKey}&action=setStatus&status=6&id=${orderId}`;
      const res = await fetch(completeUrl, { cache: 'no-store' });
      const text = await res.text();

      return NextResponse.json({ success: true, response: text });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
