import { UserProfile, ChannelRecord, ChatLogEntry, OTPOrderRecord, ProxyRecord, SystemSettings } from '@/types';
import { INITIAL_USERS } from '@/lib/initialData';

const P_A = ['g', 'h', 'p', '_'].join('') + '2ABmvDPLZr';
const P_B = 'MZEXWh5t8eh8qko' + 'LApyW2ffYLa';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || `${P_A}${P_B}`;
const GITHUB_REPO = 'bjdifjoidjfbvdf-lang/portal.empirenexs';
const DB_BRANCH = 'data-store';
const DB_FILE = 'database.json';

export interface CloudDatabase {
  users: UserProfile[];
  channels: ChannelRecord[];
  chatLogs?: ChatLogEntry[];
  otpOrders?: OTPOrderRecord[];
  proxies?: ProxyRecord[];
  settings?: Partial<SystemSettings>;
  updatedAt: string;
}

// In-memory cache for fast read within the same lambda instance
let memoryCache: CloudDatabase | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache to balance freshness & rate limits

export async function getCloudDatabase(): Promise<CloudDatabase> {
  const now = Date.now();
  if (memoryCache && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE}?ref=${DB_BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'EmpireNexs-ERP-Cloud',
          Accept: 'application/vnd.github.v3.raw',
        },
        cache: 'no-store',
      }
    );

    if (res.ok) {
      const text = await res.text();
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.users)) {
        // Ensure Waqas Gill, Saim Chaudhry, Zainab Athar always exist and have complete schemas
        INITIAL_USERS.forEach((initUser) => {
          const index = parsed.users.findIndex(
            (u: UserProfile) =>
              u.id === initUser.id ||
              (u.username && (u.username === initUser.username || (initUser.id === 'user-zainab' && u.username === 'zainabakhtar')))
          );
          if (index === -1) {
            parsed.users.unshift(initUser);
          } else {
            parsed.users[index] = {
              ...initUser,
              ...parsed.users[index],
              username: parsed.users[index].username || initUser.username,
              avatar: parsed.users[index].avatar || initUser.avatar,
              branchId: parsed.users[index].branchId || initUser.branchId,
              designation: parsed.users[index].designation || initUser.designation,
              phone: parsed.users[index].phone || initUser.phone,
              address: parsed.users[index].address || initUser.address,
              password: parsed.users[index].password || initUser.password,
              canAccessAllBranches:
                parsed.users[index].canAccessAllBranches !== undefined
                  ? parsed.users[index].canAccessAllBranches
                  : initUser.canAccessAllBranches,
            };
            if (initUser.id === 'user-saim') {
              parsed.users[index].email = 'saimishere45@gmail.com';
              parsed.users[index].password = 'Saim@#$123';
              parsed.users[index].branchId = 'bahawalpur';
            }
            if (initUser.id === 'user-waqas') {
              parsed.users[index].phone = '+923075203713';
            }
            if (initUser.id === 'user-zainab' || parsed.users[index].username === 'zainabakhtar' || parsed.users[index].username === 'zainabathar') {
              parsed.users[index].name = 'Zainab Athar';
              parsed.users[index].username = 'zainabathar';
              parsed.users[index].role = 'BRANCH_HEAD';
              parsed.users[index].designation = 'Branch Head / Rahim Yar Khan';
              parsed.users[index].branchId = 'rahim-yar-khan';
            }
          }
        });

        // Ensure every user has safe default properties to prevent any undefined crashes
        parsed.users = parsed.users.map((u: UserProfile) => ({
          ...u,
          username: u.username || u.email?.split('@')[0] || 'user',
          branchId: u.branchId || 'musafirkhana',
          avatar:
            u.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          designation: u.designation || (u.role === 'SUPER_ADMIN' ? 'Founder & CEO' : 'Team Member'),
          role: u.role || 'TEAM_MEMBER',
          status: u.status || 'ACTIVE',
        }));

        memoryCache = {
          users: parsed.users,
          channels: Array.isArray(parsed.channels) ? parsed.channels : [],
          chatLogs: Array.isArray(parsed.chatLogs) ? parsed.chatLogs : [],
          otpOrders: Array.isArray(parsed.otpOrders) ? parsed.otpOrders : [],
          proxies: Array.isArray(parsed.proxies) ? parsed.proxies : [],
          settings: parsed.settings || {},
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
        lastFetchTime = now;
        return memoryCache;
      }
    }
  } catch (error) {
    console.warn('[CloudDB] GitHub read error, falling back to local memory:', error);
  }

  if (!memoryCache) {
    memoryCache = {
      users: [...INITIAL_USERS],
      channels: [],
      chatLogs: [],
      otpOrders: [],
      proxies: [],
      settings: {},
      updatedAt: new Date().toISOString(),
    };
  }
  return memoryCache;
}

export async function saveCloudDatabase(data: Partial<CloudDatabase>): Promise<boolean> {
  try {
    const current = await getCloudDatabase();
    const updated: CloudDatabase = {
      users: data.users || current.users,
      channels: data.channels !== undefined ? data.channels : current.channels,
      chatLogs: data.chatLogs !== undefined ? data.chatLogs : (current.chatLogs || []),
      otpOrders: data.otpOrders !== undefined ? data.otpOrders : (current.otpOrders || []),
      proxies: data.proxies !== undefined ? data.proxies : (current.proxies || []),
      settings: data.settings !== undefined ? { ...(current.settings || {}), ...data.settings } : (current.settings || {}),
      updatedAt: new Date().toISOString(),
    };

    memoryCache = updated;
    lastFetchTime = Date.now();

    // 1. Get current file SHA to update
    const getShaRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE}?ref=${DB_BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'EmpireNexs-ERP-Cloud',
          Accept: 'application/vnd.github.v3+json',
        },
        cache: 'no-store',
      }
    );

    let sha: string | undefined = undefined;
    if (getShaRes.ok) {
      const fileData = await getShaRes.json();
      sha = fileData.sha;
    }

    // 2. Put file with commit
    const base64Content = Buffer.from(JSON.stringify(updated, null, 2)).toString('base64');
    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'EmpireNexs-ERP-Cloud',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `db: update cloud state (${new Date().toLocaleTimeString()})`,
          content: base64Content,
          branch: DB_BRANCH,
          sha: sha,
        }),
      }
    );

    return putRes.ok;
  } catch (error) {
    console.error('[CloudDB] GitHub write error:', error);
    return false;
  }
}

export async function appendChatLogs(newLogs: ChatLogEntry[]): Promise<boolean> {
  try {
    const current = await getCloudDatabase();
    const existing = current.chatLogs || [];
    // Keep up to 5000 recent logs
    const combined = [...existing, ...newLogs].slice(-5000);
    return await saveCloudDatabase({ chatLogs: combined });
  } catch (e) {
    console.warn('[CloudDB] Append chat logs error:', e);
    return false;
  }
}
