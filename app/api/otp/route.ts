import { NextRequest, NextResponse } from 'next/server';
import { OTPOrderRecord } from '@/types';
import { getCloudDatabase, saveCloudDatabase } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getCloudDatabase();
    return NextResponse.json({
      success: true,
      otpOrders: db.otpOrders || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = await getCloudDatabase();
    let currentOrders = [...(db.otpOrders || [])];

    if (action === 'saveOrder') {
      const { order } = body;
      if (!order || !order.id) {
        return NextResponse.json({ success: false, message: 'Invalid order' }, { status: 400 });
      }

      const index = currentOrders.findIndex((o) => o.id === order.id);
      if (index >= 0) {
        currentOrders[index] = { ...currentOrders[index], ...order };
      } else {
        currentOrders = [order, ...currentOrders];
      }

      await saveCloudDatabase({ otpOrders: currentOrders });
      return NextResponse.json({ success: true, otpOrders: currentOrders });
    }

    if (action === 'cancelOrder') {
      const { orderId } = body;
      currentOrders = currentOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'CANCELLED' } : o
      );
      await saveCloudDatabase({ otpOrders: currentOrders });
      return NextResponse.json({ success: true, otpOrders: currentOrders });
    }

    if (action === 'sync') {
      const { orders } = body;
      if (Array.isArray(orders)) {
        // Merge without losing existing server orders
        const map = new Map<string, OTPOrderRecord>();
        currentOrders.forEach((o) => map.set(o.id, o));
        orders.forEach((o) => {
          if (!map.has(o.id)) {
            map.set(o.id, o);
          } else {
            // Prefer completed status
            const existing = map.get(o.id)!;
            if (o.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
              map.set(o.id, o);
            }
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        await saveCloudDatabase({ otpOrders: merged });
        return NextResponse.json({ success: true, otpOrders: merged });
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
