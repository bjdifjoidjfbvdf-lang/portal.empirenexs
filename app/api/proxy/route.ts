import { NextRequest, NextResponse } from 'next/server';
import { ProxyRecord, ProxyLedgerTransaction, UserProxyKhata, PROXY_PERIOD_OPTIONS } from '@/types';
import { getCloudDatabase, saveCloudDatabase } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

function getPeriodRate(days: number): { priceUsd: number; days: number } {
  const match = PROXY_PERIOD_OPTIONS.find((p) => p.days === days);
  if (match) return { priceUsd: match.priceUsd, days: match.days };
  if (days <= 3) return { priceUsd: 0.25, days: 3 };
  if (days <= 7) return { priceUsd: 0.50, days: 7 };
  if (days <= 14) return { priceUsd: 1.00, days: 14 };
  return { priceUsd: 2.00, days: 28 };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isWaqas = searchParams.get('isWaqas') === 'true';

    const db = await getCloudDatabase();
    let allProxies = db.proxies || [];
    let allTransactions = db.proxyTransactions || [];

    // Auto-sync active proxies from provider if empty or requested
    const apiKey = (process.env.PROXY6_API_KEY || db.settings?.proxy6ApiKey || '31e70f0958-42f8755ad4-890c13f45a').trim();
    if (allProxies.length === 0 && apiKey) {
      try {
        const res = await fetch(`https://px6.link/api/${apiKey}/getproxy/`, { cache: 'no-store' });
        const data = await res.json();
        if (data.status === 'yes' && data.list) {
          const imported: ProxyRecord[] = [];
          Object.keys(data.list).forEach((k) => {
            const item = data.list[k];
            if (item.active === '1') {
              imported.push({
                id: `px-${item.id}`,
                proxy6Id: String(item.id),
                userId: 'user-waqas',
                userName: 'Waqas Gill',
                userEmail: 'muhammadwaqasmwg@gmail.com',
                branchId: 'musafirkhana',
                ip: item.ip,
                port: parseInt(item.port, 10),
                user: item.user,
                pass: item.pass,
                type: (item.type || 'http').toLowerCase(),
                country: (item.country || 'US').toUpperCase(),
                version: 'ipv4',
                assignedChannelName: 'HQ Reserved',
                assignedChannelUrl: '',
                costUsd: 2.00,
                periodDays: 28,
                status: 'ACTIVE',
                createdAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
                expiresAt: item.date_end ? new Date(item.date_end).toISOString() : new Date(Date.now() + 28 * 86400000).toISOString(),
              });
            }
          });
          if (imported.length > 0) {
            allProxies = imported;
            db.proxies = imported;
            if (!db.settings) db.settings = {};
            db.settings.proxy6ApiKey = apiKey;
            db.settings.proxyBalance = parseFloat(data.balance || '4.10');
            await saveCloudDatabase(db);
          }
        }
      } catch (e) {
        console.warn('Initial proxy sync notice:', e);
      }
    }

    // Compute Khatas for users
    const userKhatas: UserProxyKhata[] = (db.users || []).map((u) => {
      const userTx = allTransactions.filter((t) => t.userId === u.id);
      const userPx = allProxies.filter((p) => p.userId === u.id);
      const activePx = userPx.filter((p) => p.status === 'ACTIVE');

      const totalCharged = userTx.reduce((sum, t) => sum + (t.chargeAmount || 0), 0);
      const totalPaid = userTx.reduce((sum, t) => sum + (t.paidAmount || 0), 0);
      const balanceDue = Math.round((totalCharged - totalPaid) * 100) / 100;

      const lastPayment = userTx.find((t) => t.type === 'PAYMENT_RECEIVED');
      const lastTx = userTx[0];

      return {
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        branchId: u.branchId,
        totalCharged,
        totalPaid,
        balanceDue,
        totalProxiesBought: userPx.length,
        activeProxiesCount: activePx.length,
        lastPaymentDate: lastPayment?.createdAt,
        lastTransactionDate: lastTx?.createdAt,
      };
    });

    // Visible proxies based on permissions
    const visibleProxies = isWaqas
      ? allProxies
      : allProxies.filter((p) => p.userId === userId);

    // Visible transactions based on permissions
    const visibleTransactions = isWaqas
      ? allTransactions
      : allTransactions.filter((t) => t.userId === userId);

    // Visible khatas based on permissions
    const visibleKhatas = isWaqas
      ? userKhatas
      : userKhatas.filter((k) => k.userId === userId);

    return NextResponse.json({
      success: true,
      proxies: visibleProxies,
      transactions: visibleTransactions,
      khatas: visibleKhatas,
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
    let currentTransactions = [...(db.proxyTransactions || [])];
    let users = [...db.users];

    // =========================================================================
    // 1. BUY PROXY
    // =========================================================================
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
        period: requestedPeriod = 28,
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

      // Determine period and rate
      const { priceUsd, days } = getPeriodRate(Number(requestedPeriod));

      // Call Proxy API handler
      const proxy6Res = await fetch(`${req.nextUrl.origin}/api/proxy6`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          apiKey: apiKey || db.settings?.proxy6ApiKey || process.env.PROXY6_API_KEY,
          country,
          type,
          version: '4', // Enforce IPv4 Dedicated (Individual use)
          count: 1,
          period: days,
        }),
      });

      const proxy6Data = await proxy6Res.json();
      if (!proxy6Data.success) {
        return NextResponse.json({
          success: false,
          message: proxy6Data.message || 'Dedicated proxy purchase failed. Please contact administrator.',
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
        costUsd: priceUsd,
        periodDays: days,
        renewCount: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        expiresAt: pData.expiresAt || new Date(Date.now() + days * 86400000).toISOString(),
      };

      currentProxies = [newProxy, ...currentProxies];

      // Record transaction in ledger
      const purchaseTx: ProxyLedgerTransaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId,
        userName: newProxy.userName,
        userEmail: newProxy.userEmail,
        branchId: newProxy.branchId,
        type: 'PROXY_PURCHASE',
        chargeAmount: priceUsd,
        paidAmount: 0,
        netChange: priceUsd,
        description: `Dedicated IP Purchase (${days} Days - $${priceUsd.toFixed(2)}) • ${channelName || 'Unassigned'}`,
        channelName: channelName || '',
        proxyId: newProxy.id,
        proxyIp: newProxy.ip,
        periodDays: days,
        recordedBy: 'System (Auto)',
        createdAt: new Date().toISOString(),
      };

      currentTransactions = [purchaseTx, ...currentTransactions];

      await saveCloudDatabase({
        proxies: currentProxies,
        proxyTransactions: currentTransactions,
        settings: {
          ...(db.settings || {}),
          proxyBalance: proxy6Data.balance !== undefined ? proxy6Data.balance : db.settings?.proxyBalance,
        },
      });

      return NextResponse.json({
        success: true,
        proxy: newProxy,
        transaction: purchaseTx,
        message: `✅ Dedicated ${newProxy.country} Proxy (${days} Days - $${priceUsd.toFixed(2)}) Purchased Successfully! IP: ${newProxy.ip}`,
      });
    }

    // =========================================================================
    // 2. TOGGLE PROXY AUTHORIZATION (WAQAS GILL ONLY)
    // =========================================================================
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

    // =========================================================================
    // 3. RENEW PROXY (WITH CUSTOM DURATION & RATE)
    // =========================================================================
    if (action === 'renew') {
      const { proxyId, userId, period: requestedPeriod = 28, apiKey } = body;
      const targetProxy = currentProxies.find((p) => p.id === proxyId);
      if (!targetProxy) {
        return NextResponse.json({ success: false, message: 'Proxy not found.' }, { status: 404 });
      }

      const { priceUsd, days } = getPeriodRate(Number(requestedPeriod));

      const proxy6Res = await fetch(`${req.nextUrl.origin}/api/proxy6`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prolong',
          apiKey: apiKey || db.settings?.proxy6ApiKey || process.env.PROXY6_API_KEY,
          ids: targetProxy.proxy6Id || targetProxy.id,
          period: days,
        }),
      });

      const prolongData = await proxy6Res.json();
      if (!prolongData.success) {
        return NextResponse.json({
          success: false,
          message: prolongData.message || 'Renewal failed. Please contact administrator.',
        }, { status: 400 });
      }

      // Calculate new expiry date
      const currentExpiryMs = new Date(targetProxy.expiresAt).getTime();
      const baseMs = currentExpiryMs > Date.now() ? currentExpiryMs : Date.now();
      const newExpiry = prolongData.newExpiry || new Date(baseMs + days * 86400000).toISOString();

      currentProxies = currentProxies.map((p) =>
        p.id === proxyId
          ? {
              ...p,
              expiresAt: newExpiry,
              status: 'ACTIVE',
              costUsd: (p.costUsd || 0) + priceUsd,
              periodDays: days,
              renewCount: (p.renewCount || 0) + 1,
              lastRenewedAt: new Date().toISOString(),
            }
          : p
      );

      // Record transaction in ledger
      const renewalTx: ProxyLedgerTransaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: targetProxy.userId,
        userName: targetProxy.userName,
        userEmail: targetProxy.userEmail,
        branchId: targetProxy.branchId,
        type: 'PROXY_RENEWAL',
        chargeAmount: priceUsd,
        paidAmount: 0,
        netChange: priceUsd,
        description: `Dedicated IP Renewal (${days} Days - $${priceUsd.toFixed(2)}) • ${targetProxy.assignedChannelName}`,
        channelName: targetProxy.assignedChannelName,
        proxyId: targetProxy.id,
        proxyIp: targetProxy.ip,
        periodDays: days,
        recordedBy: 'System (Auto)',
        createdAt: new Date().toISOString(),
      };

      currentTransactions = [renewalTx, ...currentTransactions];

      await saveCloudDatabase({
        proxies: currentProxies,
        proxyTransactions: currentTransactions,
        settings: {
          ...(db.settings || {}),
          proxyBalance: prolongData.balance !== undefined ? prolongData.balance : db.settings?.proxyBalance,
        },
      });

      return NextResponse.json({
        success: true,
        message: `✅ Proxy ${targetProxy.ip} extended by ${days} days for $${priceUsd.toFixed(2)}!`,
        expiresAt: newExpiry,
        transaction: renewalTx,
      });
    }

    // =========================================================================
    // 4. RECORD PAYMENT / KHATA SETTLEMENT (CEO ONLY)
    // =========================================================================
    if (action === 'recordPayment') {
      const {
        adminUserId,
        targetUserId,
        amount,
        type = 'PAYMENT_RECEIVED',
        paymentMethod = 'CASH',
        notes = '',
        isDebit = false, // If true, manual adjustment adds a charge (+); else reduces dues (-)
      } = body;

      const admin = users.find((u) => u.id === adminUserId);
      if (admin?.role !== 'SUPER_ADMIN' && adminUserId !== 'user-waqas') {
        return NextResponse.json({
          success: false,
          message: 'Access Denied: Only Founder & CEO Waqas Gill can record payments and manage the ledger.',
        }, { status: 403 });
      }

      const targetUser = users.find((u) => u.id === targetUserId);
      if (!targetUser) {
        return NextResponse.json({ success: false, message: 'Member not found.' }, { status: 404 });
      }

      const numAmount = Math.abs(Number(amount) || 0);
      if (numAmount <= 0) {
        return NextResponse.json({ success: false, message: 'Amount must be greater than zero.' }, { status: 400 });
      }

      const isAdjustment = type === 'MANUAL_ADJUSTMENT';
      const chargeAmount = isAdjustment ? (isDebit ? numAmount : 0) : 0;
      const paidAmount = isAdjustment ? (isDebit ? 0 : numAmount) : numAmount;
      const netChange = chargeAmount - paidAmount;

      const paymentTx: ProxyLedgerTransaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: targetUserId,
        userName: targetUser.name,
        userEmail: targetUser.email,
        branchId: targetUser.branchId,
        type: isAdjustment ? 'MANUAL_ADJUSTMENT' : 'PAYMENT_RECEIVED',
        chargeAmount,
        paidAmount,
        netChange,
        description: isAdjustment
          ? `Manual Adjustment (${isDebit ? '+ Charge Added' : '- Balance Deducted'}) - $${numAmount.toFixed(2)}`
          : `Payment Received: $${numAmount.toFixed(2)} [${paymentMethod}]`,
        paymentMethod,
        notes,
        recordedBy: 'Waqas Gill (CEO)',
        createdAt: new Date().toISOString(),
      };

      currentTransactions = [paymentTx, ...currentTransactions];
      await saveCloudDatabase({ proxyTransactions: currentTransactions });

      return NextResponse.json({
        success: true,
        transaction: paymentTx,
        message: `✅ Billing ledger updated for "${targetUser.name}": $${numAmount.toFixed(2)} recorded successfully!`,
      });
    }

    // =========================================================================
    // 5. DELETE TRANSACTION (CEO ONLY - FOR CORRECTIONS)
    // =========================================================================
    if (action === 'deleteTransaction') {
      const { transactionId, adminUserId } = body;
      const admin = users.find((u) => u.id === adminUserId);
      if (admin?.role !== 'SUPER_ADMIN' && adminUserId !== 'user-waqas') {
        return NextResponse.json({
          success: false,
          message: 'Access Denied: Only CEO Waqas Gill can modify transaction history.',
        }, { status: 403 });
      }

      currentTransactions = currentTransactions.filter((t) => t.id !== transactionId);
      await saveCloudDatabase({ proxyTransactions: currentTransactions });

      return NextResponse.json({
        success: true,
        message: 'Transaction removed from ledger.',
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
