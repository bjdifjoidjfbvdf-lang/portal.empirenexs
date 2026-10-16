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

      // Automatically push row into member's personal Google Sheet cells
      let autoPushed = false;
      const targetUser = db.users.find(
        (u) => u.id === newChannel.userId || u.name === newChannel.managedBy || u.email === newChannel.managerMail
      );
      const webhook = targetUser?.personalGoogleSheetWebhookUrl || (db as any).settings?.googleSheetsDispatcherWebhookUrl;

      if (webhook) {
        try {
          await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'appendRow',
              sheetUrl: targetUser?.personalGoogleSheetUrl || '',
              channelName: newChannel.channelName,
              channelUrl: newChannel.channelUrl,
              niche: newChannel.niche,
              status: newChannel.status,
              managedBy: newChannel.managedBy,
              branchId: newChannel.branchId,
              email: newChannel.email,
              createdNumber: newChannel.createdNumber,
              notes: newChannel.notes,
              timestamp: new Date().toISOString(),
            }),
          });
          autoPushed = true;
        } catch (e) {
          console.warn('Auto-push to Google Sheet error:', e);
        }
      }

      return NextResponse.json({
        success: true,
        channel: newChannel,
        autoPushed,
        message: autoPushed
          ? `Channel added to EmpireNexs & row auto-written to ${targetUser?.name}'s Google Sheet cells!`
          : 'Channel added successfully to EmpireNexs Portal!',
      });
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

    // 5. SYNC USER GOOGLE SHEET (OPTION 1)
    if (action === 'syncUserSheet') {
      const { userId, sheetUrl } = body;
      let users = [...(db.users || [])];
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) {
        return NextResponse.json({ success: false, message: 'User not found in system.' }, { status: 404 });
      }

      const activeUrl = (sheetUrl || targetUser.personalGoogleSheetUrl || '').trim();
      if (!activeUrl) {
        return NextResponse.json({ success: false, message: 'No Google Sheet URL provided for this user.' }, { status: 400 });
      }

      // Extract sheetId and optional gid
      const sheetMatch = activeUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetMatch) {
        return NextResponse.json({
          success: false,
          message: 'Invalid Google Sheets URL format. Please provide a standard Google Sheets link (e.g., https://docs.google.com/spreadsheets/d/.../edit).',
        }, { status: 400 });
      }

      const sheetId = sheetMatch[1];
      const gidMatch = activeUrl.match(/[#&?]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';

      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
      const response = await fetch(csvUrl, { cache: 'no-store' });
      if (!response.ok) {
        return NextResponse.json({
          success: false,
          message: 'Could not fetch Google Sheet data. Please ensure Google Drive sharing is set to "Anyone with the link can view".',
        }, { status: 400 });
      }

      const csvText = await response.text();

      // Robust CSV parser respecting quotes
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const rows: string[][] = lines.map((line) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      });

      if (rows.length === 0) {
        return NextResponse.json({ success: false, message: 'The Google Sheet appears to be empty.' }, { status: 400 });
      }

      // Column mapping detection
      const firstRow = rows[0].map((h) => h.toLowerCase());
      const nameIdx = firstRow.findIndex((h) => h.includes('name') || h.includes('title') || h.includes('channel'));
      const urlIdx = firstRow.findIndex((h) => h.includes('url') || h.includes('link') || h.includes('youtube'));
      const statusIdx = firstRow.findIndex((h) => h.includes('status') || h.includes('state') || h.includes('condition'));
      const nicheIdx = firstRow.findIndex((h) => h.includes('niche') || h.includes('category') || h.includes('topic'));
      const emailIdx = firstRow.findIndex((h) => h.includes('email') || h.includes('mail') || h.includes('gmail'));
      const numberIdx = firstRow.findIndex((h) => h.includes('number') || h.includes('phone') || h.includes('otp'));
      const notesIdx = firstRow.findIndex((h) => h.includes('notes') || h.includes('details') || h.includes('remark'));

      const isHeaderRow = nameIdx !== -1 || urlIdx !== -1 || statusIdx !== -1;
      const dataRows = isHeaderRow ? rows.slice(1) : rows;

      const parsedChannels: ChannelRecord[] = [];
      dataRows.forEach((row, i) => {
        let chName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : '';
        let chUrl = urlIdx !== -1 && row[urlIdx] ? row[urlIdx] : '';

        // Fallback detection if headers did not match
        if (!chUrl) {
          const foundUrl = row.find((cell) => cell.includes('http') || cell.includes('youtube.com') || cell.includes('youtu.be'));
          if (foundUrl) chUrl = foundUrl;
        }
        if (!chName) {
          const nonUrl = row.find((cell) => cell && !cell.includes('http') && cell.length > 2);
          if (nonUrl) chName = nonUrl;
          else if (chUrl) chName = `Channel #${i + 1}`;
        }

        if (chName || chUrl) {
          const rawStatus = (statusIdx !== -1 && row[statusIdx] ? row[statusIdx] : '').toLowerCase();
          let status: ChannelRecord['status'] = 'Active';
          if (rawStatus.includes('monetiz')) status = 'Monetized';
          else if (rawStatus.includes('demonetiz')) status = 'Demonetized';
          else if (rawStatus.includes('sold')) status = 'Sold';
          else if (rawStatus.includes('review')) status = 'In Review';
          else if (rawStatus.includes('warm')) status = 'Warmup';
          else if (rawStatus.includes('suspend')) status = 'Suspended';

          parsedChannels.push({
            id: `ch-${targetUser.id}-${Date.now()}-${i}`,
            nameAndLink: `${chName} (${chUrl || 'No Link'})`,
            channelName: chName || 'Unnamed Channel',
            channelUrl: chUrl || 'https://youtube.com',
            status,
            email: emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : targetUser.email,
            password: '',
            twoFactor: '',
            backupCodes: '',
            createdNumber: numberIdx !== -1 && row[numberIdx] ? row[numberIdx] : '',
            pubId: '',
            ip: '',
            niche: nicheIdx !== -1 && row[nicheIdx] ? row[nicheIdx] : 'YouTube Automation',
            notes: notesIdx !== -1 && row[notesIdx] ? row[notesIdx] : `Synced from ${targetUser.name}'s Google Sheet`,
            managedBy: targetUser.name,
            managerMail: targetUser.email,
            owner: 'EmpireNexs',
            branchId: targetUser.branchId || 'musafirkhana',
            userId: targetUser.id,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      // Update channels list: remove previous channels of this user and prepend new ones
      channels = channels.filter((c) => c.userId !== targetUser.id);
      channels = [...parsedChannels, ...channels];

      // Update user metadata in DB
      users = users.map((u) =>
        u.id === targetUser.id
          ? {
              ...u,
              personalGoogleSheetUrl: activeUrl,
              lastSheetSync: new Date().toISOString(),
              syncedChannelsCount: parsedChannels.length,
            }
          : u
      );

      await saveCloudDatabase({ channels, users });

      return NextResponse.json({
        success: true,
        count: parsedChannels.length,
        channels: parsedChannels,
        message: `Successfully fetched and synced ${parsedChannels.length} channel(s) from ${targetUser.name}'s Google Sheet!`,
      });
    }

    // 6. PUSH ALL USER CHANNELS DIRECTLY INTO GOOGLE SHEET CELLS
    if (action === 'pushUserChannelsToSheet') {
      const { userId } = body;
      const targetUser = db.users.find((u) => u.id === userId);
      if (!targetUser) {
        return NextResponse.json({ success: false, message: 'User not found in system.' }, { status: 404 });
      }

      const webhook = targetUser.personalGoogleSheetWebhookUrl || (db as any).settings?.googleSheetsDispatcherWebhookUrl;
      if (!webhook) {
        return NextResponse.json({
          success: false,
          message: 'No Google Apps Script Webhook URL found. Please add the Webhook URL in user sheet settings so portal can write rows to cells.',
        }, { status: 400 });
      }

      const userChannels = channels.filter((c) => c.userId === userId || c.managedBy === targetUser.name);
      if (userChannels.length === 0) {
        return NextResponse.json({ success: false, message: `No channels found for ${targetUser.name} to push.` }, { status: 400 });
      }

      let pushedCount = 0;
      for (const ch of userChannels) {
        try {
          await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'appendRow',
              sheetUrl: targetUser.personalGoogleSheetUrl || '',
              channelName: ch.channelName,
              channelUrl: ch.channelUrl,
              niche: ch.niche,
              status: ch.status,
              managedBy: ch.managedBy,
              branchId: ch.branchId,
              email: ch.email,
              createdNumber: ch.createdNumber,
              notes: ch.notes,
              timestamp: new Date().toISOString(),
            }),
          });
          pushedCount++;
        } catch (e) {
          console.warn('Push channel error:', e);
        }
      }

      return NextResponse.json({
        success: true,
        count: pushedCount,
        message: `Successfully pushed ${pushedCount} channel(s) directly into ${targetUser.name}'s Google Sheet cells!`,
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
