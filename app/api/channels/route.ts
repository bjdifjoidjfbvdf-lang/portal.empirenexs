import { NextRequest, NextResponse } from 'next/server';
import { ChannelRecord } from '@/types';
import { getCloudDatabase, saveCloudDatabase } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getCloudDatabase();
  return NextResponse.json({ success: true, channels: db.channels || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = await getCloudDatabase();
    let channels = [...(db.channels || [])];

    // 1. ADD CHANNEL
    if (action === 'add') {
      const { channel } = body;
      const newChannel: ChannelRecord = {
        ...channel,
        id: `ch-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      channels.unshift(newChannel);
      await saveCloudDatabase({ channels });
      return NextResponse.json({ success: true, channel: newChannel, message: 'Channel added successfully!' });
    }

    // 2. UPDATE CHANNEL (Status change, Monetized, Sold, Demonetized)
    if (action === 'update') {
      const { id, updates } = body;
      channels = channels.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      );
      await saveCloudDatabase({ channels });
      return NextResponse.json({ success: true, message: 'Channel updated successfully!' });
    }

    // 3. DELETE CHANNEL
    if (action === 'delete') {
      const { id } = body;
      channels = channels.filter((c) => c.id !== id);
      await saveCloudDatabase({ channels });
      return NextResponse.json({ success: true, message: 'Channel deleted successfully!' });
    }

    // 4. BULK SYNC (FROM GOOGLE SHEETS)
    if (action === 'bulkSync') {
      const { newChannels, userId } = body;
      if (Array.isArray(newChannels)) {
        // If regular user syncing: replace/update their channels only
        if (userId) {
          channels = channels.filter((c) => c.userId !== userId);
          channels = [...newChannels, ...channels];
        } else {
          channels = newChannels;
        }
        await saveCloudDatabase({ channels });
        return NextResponse.json({ success: true, count: newChannels.length, message: 'Channels synced successfully!' });
      }
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
