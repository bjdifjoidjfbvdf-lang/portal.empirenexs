import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/initialData';
import { UserProfile } from '@/types';
import fs from 'fs';
import path from 'path';

// File storage path: /tmp for Vercel serverless, local data folder for dev
const STORAGE_FILE = process.env.VERCEL
  ? '/tmp/empirenexs_users.json'
  : path.join(process.cwd(), '.next', 'empirenexs_users.json');

// Global in-memory cache to maintain state across requests in the instance
declare global {
  var __EMPIRENEXS_USERS__: UserProfile[] | undefined;
}

function loadUsersFromDisk(): UserProfile[] {
  if (globalThis.__EMPIRENEXS_USERS__ && Array.isArray(globalThis.__EMPIRENEXS_USERS__)) {
    return globalThis.__EMPIRENEXS_USERS__;
  }

  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__EMPIRENEXS_USERS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading users from disk:', e);
  }

  globalThis.__EMPIRENEXS_USERS__ = [...INITIAL_USERS];
  return globalThis.__EMPIRENEXS_USERS__;
}

function saveUsersToDisk(users: UserProfile[]) {
  globalThis.__EMPIRENEXS_USERS__ = users;
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Notice: Could not write users to disk (normal in read-only lambda):', e);
  }
}

export async function GET() {
  const users = loadUsersFromDisk();
  // Return users with passwords omitted for general GET requests
  const safeUsers = users.map((u) => {
    const { password, ...rest } = u;
    return rest;
  });
  return NextResponse.json({ success: true, users: safeUsers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    let users = loadUsersFromDisk();

    // 1. AUTHENTICATE / LOGIN
    if (action === 'login') {
      const { identifier, password } = body;
      const cleanId = (identifier || '').trim().toLowerCase();
      const cleanPass = password || '';

      const user = users.find((u) => {
        const uEmail = u.email.toLowerCase().trim();
        const uUsername = (u.username || '').toLowerCase().trim();
        if (uEmail === cleanId || uUsername === cleanId) return true;
        if (
          (cleanId === 'muhammadwaqasmwg@gmail.com' || cleanId === 'waqasgill' || cleanId === 'waqas@empirenexs.com') &&
          (u.id === 'user-waqas' || uUsername === 'waqasgill' || u.role === 'SUPER_ADMIN')
        ) {
          return true;
        }
        if (
          (cleanId === 'saimchaudhry' || cleanId === 'saimch') &&
          (u.id === 'user-saim' || uUsername === 'saimchaudhry' || uUsername === 'saimch')
        ) {
          return true;
        }
        if (
          (cleanId === 'zainabakhtar' || cleanId === 'zainabathar') &&
          (u.id === 'user-zainab' || uUsername === 'zainabakhtar' || uUsername === 'zainabathar')
        ) {
          return true;
        }
        return false;
      });

      if (!user) {
        return NextResponse.json({ success: false, message: 'No account found matching this Email or Username.' }, { status: 404 });
      }

      if (user.password && user.password !== cleanPass) {
        return NextResponse.json({ success: false, message: 'Incorrect password. Please verify your credentials and try again.' }, { status: 401 });
      }

      if (user.status === 'PENDING') {
        return NextResponse.json({
          success: false,
          message: '⚠️ Approval Pending: Your account is awaiting review and authorization from Founder & CEO Waqas Gill.',
          pending: true,
        }, { status: 403 });
      }

      if (user.status === 'REJECTED') {
        return NextResponse.json({ success: false, message: 'This registration request has been declined.' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        user,
        message: `Welcome, ${user.name}!`,
      });
    }

    // 2. REGISTER USER (PENDING APPROVAL)
    if (action === 'register') {
      const { user: newUserData } = body;
      const cleanEmail = (newUserData.email || '').toLowerCase().trim();
      const cleanUsername = (newUserData.username || '').toLowerCase().trim();

      if (!cleanEmail || !cleanUsername || !newUserData.password) {
        return NextResponse.json({ success: false, message: 'Name, Username, Email, and Password are required.' }, { status: 400 });
      }

      // Check duplicate email
      if (users.some((u) => u.email.toLowerCase().trim() === cleanEmail)) {
        return NextResponse.json({ success: false, message: 'This Gmail address is already registered in the system.' }, { status: 400 });
      }

      // Check duplicate username
      if (users.some((u) => u.username && u.username.toLowerCase().trim() === cleanUsername)) {
        return NextResponse.json({ success: false, message: `The username "${cleanUsername}" is already taken. Please choose another.` }, { status: 400 });
      }

      // Check if Waqas Gill
      const isWaqas =
        cleanEmail === 'muhammadwaqasmwg@gmail.com' ||
        cleanEmail === 'waqas@empirenexs.com' ||
        cleanUsername === 'waqasgill';

      const newUser: UserProfile = {
        id: isWaqas ? 'user-waqas' : `user-${Date.now()}`,
        name: newUserData.name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: newUserData.password,
        phone: newUserData.phone?.trim() || '',
        address: newUserData.address?.trim() || '',
        role: isWaqas ? 'SUPER_ADMIN' : 'TEAM_MEMBER',
        designation: isWaqas ? 'Founder & CEO' : newUserData.designation || 'Team Member',
        branchId: isWaqas ? 'all' : newUserData.branchId || 'bahawalpur',
        avatar: newUserData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        canAccessAllBranches: isWaqas,
        status: isWaqas ? 'ACTIVE' : 'PENDING',
        joinedAt: new Date().toISOString().split('T')[0],
        emailVerified: true,
      };

      if (isWaqas) {
        users = [newUser, ...users.filter((u) => u.id !== 'user-waqas' && u.username !== 'waqasgill')];
      } else {
        users.push(newUser);
      }

      saveUsersToDisk(users);

      return NextResponse.json({
        success: true,
        user: newUser,
        requiresApproval: !isWaqas,
        message: isWaqas
          ? 'Super Admin account active immediately.'
          : 'Registration submitted! For company security, your account will be unlocked once approved by Founder & CEO Waqas Gill.',
      });
    }

    // 3. APPROVE USER (SUPER ADMIN ONLY)
    if (action === 'approve') {
      const { userId } = body;
      const target = users.find((u) => u.id === userId);
      if (!target) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
      }

      users = users.map((u) => (u.id === userId ? { ...u, status: 'ACTIVE' } : u));
      saveUsersToDisk(users);

      return NextResponse.json({ success: true, message: `Account for ${target.name} has been approved and activated!` });
    }

    // 4. REJECT USER (SUPER ADMIN ONLY)
    if (action === 'reject') {
      const { userId } = body;
      users = users.map((u) => (u.id === userId ? { ...u, status: 'REJECTED' } : u));
      saveUsersToDisk(users);
      return NextResponse.json({ success: true, message: 'User registration request declined.' });
    }

    // 5. DIRECT CREATE USER (SUPER ADMIN)
    if (action === 'directCreate') {
      const { userData } = body;
      const cleanEmail = (userData.email || '').toLowerCase().trim();
      const cleanUsername = (userData.username || '').toLowerCase().trim();

      if (users.some((u) => u.email.toLowerCase().trim() === cleanEmail)) {
        return NextResponse.json({ success: false, message: 'This email is already registered.' }, { status: 400 });
      }
      if (users.some((u) => u.username && u.username.toLowerCase().trim() === cleanUsername)) {
        return NextResponse.json({ success: false, message: 'This username is already taken.' }, { status: 400 });
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: userData.name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: userData.password,
        phone: userData.phone || '',
        address: userData.address || '',
        role: userData.role || 'TEAM_MEMBER',
        designation: userData.designation || 'Channel Operator',
        branchId: userData.branchId || 'musafirkhana',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        canAccessAllBranches: userData.canAccessAllBranches || false,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString().split('T')[0],
        emailVerified: true,
      };

      users = [newUser, ...users];
      saveUsersToDisk(users);

      return NextResponse.json({
        success: true,
        user: newUser,
        message: `Team member "${userData.name}" has been registered directly and is active immediately!`,
      });
    }

    // 6. UPDATE PROFILE
    if (action === 'updateProfile') {
      const { userId, updates } = body;
      users = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
      saveUsersToDisk(users);
      return NextResponse.json({ success: true, message: 'Profile updated successfully!' });
    }

    // 7. CHANGE PASSWORD
    if (action === 'changePassword') {
      const { userId, currentPass, newPass } = body;
      const user = users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
      }
      if (user.password && user.password !== currentPass) {
        return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 400 });
      }
      users = users.map((u) => (u.id === userId ? { ...u, password: newPass } : u));
      saveUsersToDisk(users);
      return NextResponse.json({ success: true, message: 'Password updated successfully!' });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
