import { NextResponse } from 'next/server';
import { getCloudDatabase, appendChatLogs } from '@/lib/cloudDb';
import { ChatLogEntry } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    const db = await getCloudDatabase();
    let logs: ChatLogEntry[] = db.chatLogs || [];

    if (userId && userId !== 'all') {
      logs = logs.filter((l) => l.userId === userId);
    }

    if (month && month !== 'all') {
      logs = logs.filter((l) => l.month === month || l.createdAt?.startsWith(month));
    }

    if (search) {
      logs = logs.filter(
        (l) =>
          l.text.toLowerCase().includes(search) ||
          l.userName.toLowerCase().includes(search) ||
          l.userEmail.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      chatLogs: logs,
      totalCount: logs.length,
    });
  } catch (error: any) {
    console.error('Chat logs GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch chat logs', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let logsToAdd: ChatLogEntry[] = [];

    if (Array.isArray(body.logs)) {
      logsToAdd = body.logs;
    } else if (body.log) {
      logsToAdd = [body.log];
    } else if (body.userId && body.text) {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      logsToAdd = [
        {
          id: body.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId: body.userId,
          userName: body.userName || 'User',
          userEmail: body.userEmail || '',
          userRole: body.userRole || 'TEAM_MEMBER',
          branchId: body.branchId || 'musafirkhana',
          sender: body.sender || 'user',
          text: body.text,
          timestamp: body.timestamp || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now.toISOString(),
          month,
        },
      ];
    }

    if (logsToAdd.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid logs to add' }, { status: 400 });
    }

    // Save logs to cloud database
    await appendChatLogs(logsToAdd);

    return NextResponse.json({
      success: true,
      message: `${logsToAdd.length} log(s) recorded successfully`,
    });
  } catch (error: any) {
    console.error('Chat logs POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record chat logs', error: error.message },
      { status: 500 }
    );
  }
}
