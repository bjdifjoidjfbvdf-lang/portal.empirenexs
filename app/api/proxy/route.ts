import { NextRequest, NextResponse } from 'next/server';
import { ProxyRecord } from '@/types';
import { getCloudDatabase, saveCloudDatabase } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isWaqas = searchParams.get('isWaqas') === 'true';

    const db = await getCloudDatabase();
    const allProxies = db.proxies || [];

    // If Waqas (CEO), return ALL proxies across all branches & members
    // If regular team member, return ONLY their own purchased proxies
    const visibleProxies = isWaqas
      ? allProxies
      : allProxies.filter((p) => p.userId === userId);

    return NextResponse.json({
      success: true,
      proxies: visibleProxies,
      totalCount: allProxies.length,
      userCount: visibleProxies.length,
      settings: db.settings || {},
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
    let currentProxies = [...(db.proxies || [])];
    let users = [...db.users];

    // 1. BUY PROXY
    if (action === 'buy') {
      const {
        userId,
        userName,
        userEmail,
        branchId,
        channelName,
        channelUrl,
        country = 'us',
        type = 'http',
        apiKey,
      } = body;

      const user = users.find((u) => u.id === userId);
      const isPrivileged =
        user?.role === 'SUPER_ADMIN' ||
        userId === 'user-waqas' ||
        userEmail === 'muhammadwaqasmwg@gmail.com';

      // Strict Rule 1: Must be authorized by CEO Waqas Gill
      if (!isPrivileged && !user?.canBuyProxies) {
        return NextResponse.json({
          success: false,
          message: '⛔ Access Denied: You are not authorized to purchase proxies. Please contact CEO Waqas Gill for authorization.',
        }, { status: 403 });
      }

      // Strict Rule 2: Limit of 1 proxy per 24 hours per user
      if (!isPrivileged) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const boughtToday = currentProxies.filter(
          (p) => p.userId === userId && new Date(p.createdAt).getTime() > oneDayAgo
        );

        if (boughtToday.length >= 1) {
          return NextResponse.json({
            success: false,
            message: '⚠️ Daily Quota Reached: You are only allowed to purchase 1 proxy per day (24 hours). Please wait until tomorrow.',
          }, { status: 429 });
        }
      }

      // Call Proxy6 API handler
      const proxy6Res = await fetch(`${req.nextUrl.origin}/api/proxy6`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          apiKey: apiKey || db.settings?.proxy6ApiKey,
          country,
          type,
          count: 1,
          period: 30,
        }),
      });

      const proxy6Data = await proxy6Res.json();
      if (!proxy6Data.success) {
        return NextResponse.json({
          success: false,
          message: proxy6Data.message || 'Proxy purchase failed on Proxy6.',
        }, { status: 400 });
      }

      const pData = proxy6Data.proxy;
      const newProxy: ProxyRecord = {
        id: `px-${Date.now()}`,
        proxy6Id: pData.proxy6Id,
        userId,
        userName: userName || user?.name || 'Team Member',
        userEmail: userEmail || user?.email || '',
        branchId: branchId || user?.branchId || 'musafirkhana',
        ip: pData.ip,
        port: pData.port,
        user: pData.user,
        pass: pData.pass,
        type: pData.type || type,
        country: pData.country || country.toUpperCase(),
        version: pData.version || 'ipv4',
        assignedChannelName: channelName || 'Unassigned',
        assignedChannelUrl: channelUrl || '',
        costUsd: pData.costUsd || 1.77,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        expiresAt: pData.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
      };

      currentProxies = [newProxy, ...currentProxies];
      await saveCloudDatabase({ proxies: currentProxies });

      return NextResponse.json({
        success: true,
        proxy: newProxy,
        message: `✅ Dedicated ${newProxy.country} Proxy Purchased Successfully! IP: ${newProxy.ip}`,
      });
    }

    // 2. TOGGLE PROXY AUTHORIZATION (WAQAS GILL ONLY)
    if (action === 'toggleAuthorization') {
      const { targetUserId, authorized, adminUserId } = body;
      const admin = users.find((u) => u.id === adminUserId);

      if (admin?.role !== 'SUPER_ADMIN' && adminUserId !== 'user-waqas') {
        return NextResponse.json({
          success: false,
          message: 'Access Denied: Only Founder & CEO Waqas Gill can authorize proxy purchases.',
        }, { status: 403 });
      }

      users = users.map((u) =>
        u.id === targetUserId ? { ...u, canBuyProxies: !!authorized } : u
      );
      await saveCloudDatabase({ users });

      const target = users.find((u) => u.id === targetUserId);
      return NextResponse.json({
        success: true,
        targetUser: target,
        message: `Proxy authorization for "${target?.name}" has been ${authorized ? 'GRANTED' : 'REVOKED'}.`,
      });
    }

    // 3. RENEW PROXY
    if (action === 'renew') {
      const { proxyId, userId, apiKey } = body;
      const targetProxy = currentProxies.find((p) => p.id === proxyId);
      if (!targetProxy) {
        return NextResponse.json({ success: false, message: 'Proxy not found.' }, { status: 404 });
      }

      const proxy6Res = await fetch(`${req.nextUrl.origin}/api/proxy6`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prolong',
          apiKey: apiKey || db.settings?.proxy6ApiKey,
          ids: targetProxy.proxy6Id || targetProxy.id,
          period: 30,
        }),
      });

      const prolongData = await proxy6Res.json();
      if (!prolongData.success) {
        return NextResponse.json({
          success: false,
          message: prolongData.message || 'Renewal failed on Proxy6.',
        }, { status: 400 });
      }

      const newExpiry = new Date(Date.now() + 30 * 86400000).toISOString();
      currentProxies = currentProxies.map((p) =>
        p.id === proxyId
          ? { ...p, expiresAt: newExpiry, status: 'ACTIVE' }
          : p
      );
      await saveCloudDatabase({ proxies: currentProxies });

      return NextResponse.json({
        success: true,
        message: `✅ Proxy ${targetProxy.ip} extended by 30 days!`,
        expiresAt: newExpiry,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
