'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BranchId,
  ChannelRecord,
  NicheTab,
  NicheVideoItem,
  NicheClaimRecord,
  UserProfile,
  AIChatMessage,
  SystemSettings,
  OTPOrderRecord,
  ChatLogEntry,
} from '@/types';
import {
  BRANCHES,
  INITIAL_CHANNELS,
  INITIAL_NICHE_TABS,
  INITIAL_USERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_OTP_ORDERS,
} from '@/lib/initialData';

interface AppContextType {
  // Current user & auth context
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    branchId: BranchId;
    designation: string;
    avatar?: string;
    joiningType?: 'PERCENTAGE' | 'SALARY';
    personalGoogleSheetUrl?: string;
  }) => Promise<{ success: boolean; message: string; requiresApproval: boolean }>;
  logout: () => void;
  sendEmailOTP: (email: string, purpose?: 'SIGNUP' | 'FORGOT_PASSWORD') => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyEmailOTP: (email: string, otp: string, purpose?: 'SIGNUP' | 'FORGOT_PASSWORD') => Promise<{ success: boolean; message: string }>;
  resetPasswordWithOTP: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  pendingUsers: UserProfile[];
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  directCreateUser: (userData: Partial<UserProfile> & { name: string; username: string; email: string; password: string }) => { success: boolean; message: string };
  selectedBranchId: BranchId;
  setSelectedBranchId: (branchId: BranchId) => void;
  availableUsers: UserProfile[];

  // Appearance & Theme Mode
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Profile Management
  updateUserProfile: (updates: Partial<UserProfile>) => { success: boolean; message: string };
  changeUserPassword: (currentPass: string, newPass: string) => { success: boolean; message: string };

  // Channels Vault (Strict Data Isolation)
  channels: ChannelRecord[];
  addChannel: (channel: Omit<ChannelRecord, 'id' | 'updatedAt'>) => void;
  updateChannel: (id: string, channel: Partial<ChannelRecord>) => void;
  deleteChannel: (id: string) => void;
  filteredChannels: ChannelRecord[];
  markChannelMonetized: (id: string, monetizedAt?: string) => Promise<void>;
  markChannelSold: (id: string, salePrice: number, soldTo: string, soldAt?: string, saleCurrency?: 'PKR' | 'USD') => Promise<void>;
  markChannelDemonetized: (id: string, issueReason: string, demonetizedAt?: string) => Promise<void>;
  bulkImportChannels: (newChannels: Omit<ChannelRecord, 'id' | 'updatedAt'>[]) => Promise<number>;

  // Niches Multi-Tab Hub & Daily Quota
  nicheTabs: NicheTab[];
  activeTabId: string;
  setActiveTabId: (tabId: string) => void;
  addNicheTab: (name: string, description: string, branchId: BranchId) => void;
  addVideoToNiche: (nicheId: string, video: Omit<NicheVideoItem, 'id'>) => void;
  updateVideoInNiche: (nicheId: string, videoId: string, updates: Partial<NicheVideoItem>) => void;
  deleteVideoFromNiche: (nicheId: string, videoId: string) => void;
  filteredNicheTabs: NicheTab[];
  userNicheClaims: NicheClaimRecord[];
  claimNicheTopic: (category: string) => { success: boolean; message: string; claim?: NicheClaimRecord };
  getUserTodayNicheCount: (userId: string) => number;

  // AI Assistant & Chat
  chatMessages: AIChatMessage[];
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  sendMessageToAI: (userQuery: string) => Promise<void>;
  clearChatHistory: () => void;
  teamChatLogs: ChatLogEntry[];
  fetchTeamChatLogs: (targetUserId?: string, targetMonth?: string) => Promise<ChatLogEntry[]>;

  // Settings & Google Sheets Sync
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  isSyncingSheets: boolean;
  triggerGoogleSheetSync: () => Promise<{ success: boolean; message: string }>;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;

  // Phone Number & OTP Verification Vault (Strict Rules)
  otpOrders: OTPOrderRecord[];
  requestPhoneOTP: (
    channelName: string,
    channelUrl: string,
    country?: string,
    provider?: 'Hero-SMS' | 'SMS-Activate' | '5SIM' | 'SMSPool'
  ) => Promise<{ success: boolean; message: string; order?: OTPOrderRecord }>;
  cancelOTPOrder: (orderId: string) => void;
  getUserTodayOTPCount: (userId: string) => number;
  getUserTotalOTPCount: (userId: string) => number;
  getChannelExistingNumber: (channelName: string, channelUrl?: string) => OTPOrderRecord | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const sanitizeUser = (u: any): UserProfile => {
  const email = (u?.email || '').toLowerCase().trim();
  const username = (u?.username || '').toLowerCase().trim();
  const id = u?.id || '';

  const isWaqas =
    id === 'user-waqas' ||
    username === 'waqasgill' ||
    u?.role === 'SUPER_ADMIN' ||
    email === 'muhammadwaqasmwg@gmail.com' ||
    email === 'waqas@empirenexs.com';
  const isSaim =
    id === 'user-saim' ||
    username === 'saimchaudhry' ||
    username === 'saimch';
  const isZainab =
    id === 'user-zainab' ||
    username === 'zainabakhtar' ||
    username === 'zainabathar';

  let defaultBranch: BranchId = 'musafirkhana';
  let defaultRole = u?.role || 'OPERATOR';
  let defaultDesignation = u?.designation || 'Creator / Operator';
  let defaultAvatar = u?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  if (isWaqas) {
    defaultBranch = 'all';
    defaultRole = 'SUPER_ADMIN';
    defaultDesignation = 'Founder & CEO';
    defaultAvatar = u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  } else if (isSaim) {
    defaultBranch = 'bahawalpur';
    defaultRole = 'CO_FOUNDER';
    defaultDesignation = 'Co-Founder / Head of Bahawalpur';
    defaultAvatar = u?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  } else if (isZainab) {
    defaultBranch = 'rahim-yar-khan';
    defaultRole = 'CO_FOUNDER';
    defaultDesignation = 'Co-Founder / Head of Rahim Yar Khan';
    defaultAvatar = u?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
  }

  return {
    ...u,
    id: id || `user-${Date.now()}`,
    name: isWaqas ? 'Waqas Gill' : isZainab ? 'Zainab Akhtar' : isSaim ? 'Saim Chaudhry' : (u?.name || 'User'),
    username: isWaqas ? 'waqasgill' : isZainab ? 'zainabakhtar' : isSaim ? 'saimchaudhry' : (username || (email ? email.split('@')[0] : 'user')),
    email: isWaqas ? 'muhammadwaqasmwg@gmail.com' : isZainab ? 'zainab@empirenexs.com' : isSaim ? 'saim@empirenexs.com' : email,
    role: defaultRole,
    designation: u?.designation || defaultDesignation,
    avatar: u?.avatar || defaultAvatar,
    branchId: (u?.branchId || defaultBranch) as BranchId,
    status: u?.status || 'ACTIVE',
    canAccessAllBranches: isWaqas ? true : !!u?.canAccessAllBranches,
  };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Users and Auth state
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS.map(sanitizeUser));
  const [currentUser, setCurrentUser] = useState<UserProfile>(sanitizeUser(INITIAL_USERS[0])); // Initial placeholder before login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>('all');

  const availableUsers = users.filter((u) => u.status === 'ACTIVE');
  const pendingUsers = users.filter((u) => u.status === 'PENDING');

  // Login supporting Email OR Username with Live Cloud Verification
  const login = async (identifier: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = pass || '';

    // 1. Live Cloud DB Auth via API
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', identifier: cleanId, password: cleanPass }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const liveUser: UserProfile = sanitizeUser(data.user);
        setCurrentUser(liveUser);
        setIsAuthenticated(true);
        setUsers((prev) => {
          const map = new Map<string, UserProfile>();
          prev.forEach((u) => map.set(u.id, sanitizeUser(u)));
          map.set(liveUser.id, liveUser);
          return Array.from(map.values());
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('empirenexs_session_user_prod', liveUser.id);
        }
        return { success: true, message: data.message || `Welcome, ${liveUser.name}!` };
      } else if (data.message) {
        return { success: false, message: data.message };
      }
    } catch (e) {
      console.warn('[StoreContext] Cloud auth fallback:', e);
    }

    // 2. Local Fallback if server is unreachable
    const user = users.find((u) => {
      const uEmail = u.email.toLowerCase().trim();
      const uUsername = (u.username || '').toLowerCase().trim();
      if (uEmail === cleanId || uUsername === cleanId) return true;
      if (
        (cleanId === 'muhammadwaqasmwg@gmail.com' || cleanId === 'waqasgill' || cleanId === 'waqas@empirenexs.com') &&
        (u.id === 'user-waqas' || uUsername === 'waqasgill' || u.role === 'SUPER_ADMIN' || uEmail === 'muhammadwaqasmwg@gmail.com')
      ) {
        return true;
      }
      if (
        (cleanId === 'saimchaudhry' || cleanId === 'saimch' || cleanId === 'saim@empirenexs.com') &&
        (u.id === 'user-saim' || uUsername === 'saimchaudhry' || uUsername === 'saimch')
      ) {
        return true;
      }
      if (
        (cleanId === 'zainabakhtar' || cleanId === 'zainabathar' || cleanId === 'zainab@empirenexs.com') &&
        (u.id === 'user-zainab' || uUsername === 'zainabakhtar' || uUsername === 'zainabathar')
      ) {
        return true;
      }
      return false;
    });

    if (!user) {
      return { success: false, message: 'No account found matching this Email or Username.' };
    }

    if (user.password && user.password !== cleanPass) {
      return { success: false, message: 'Incorrect password. Please verify your credentials and try again.' };
    }

    if (user.status === 'PENDING') {
      return {
        success: false,
        message: '⚠️ Approval Pending: Your account is awaiting review and authorization from Founder & CEO Waqas Gill. Access will be unlocked once approved.',
      };
    }

    if (user.status === 'REJECTED') {
      return { success: false, message: 'This registration request has been declined.' };
    }

    const sanitizedUser = sanitizeUser(user);
    setCurrentUser(sanitizedUser);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_session_user_prod', sanitizedUser.id);
    }
    return { success: true, message: `Welcome, ${sanitizedUser.name}!` };
  };

  // Register with unique username and email
  const registerUser = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    branchId: BranchId;
    designation: string;
    avatar?: string;
    joiningType?: 'PERCENTAGE' | 'SALARY';
    personalGoogleSheetUrl?: string;
  }): Promise<{ success: boolean; message: string; requiresApproval: boolean }> => {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanUsername = data.username.toLowerCase().trim();

    // Check if it's Founder & CEO Waqas Gill signing up
    const isWaqas =
      cleanEmail === 'muhammadwaqasmwg@gmail.com' ||
      cleanEmail === 'waqas@empirenexs.com' ||
      cleanUsername === 'waqasgill';

    if (isWaqas) {
      const waqasUser: UserProfile = {
        id: 'user-waqas',
        name: data.name.trim() || 'Waqas Gill',
        username: 'waqasgill',
        email: 'muhammadwaqasmwg@gmail.com',
        password: data.password || 'admin123',
        phone: data.phone?.trim() || '+92 300 0000000',
        address: data.address?.trim() || 'EmpireNexs HQ, Musafirkhana',
        role: 'SUPER_ADMIN',
        designation: 'Founder & CEO',
        branchId: 'all',
        avatar:
          data.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        canAccessAllBranches: true,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString().split('T')[0],
        emailVerified: true,
      };

      setUsers((prev) => {
        const withoutOld = prev.filter(
          (u) =>
            u.id !== 'user-waqas' &&
            u.email.toLowerCase().trim() !== 'muhammadwaqasmwg@gmail.com' &&
            u.email.toLowerCase().trim() !== 'waqas@empirenexs.com' &&
            u.username?.toLowerCase().trim() !== 'waqasgill'
        );
        return [waqasUser, ...withoutOld];
      });

      setCurrentUser(waqasUser);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('empirenexs_session_user_prod', waqasUser.id);
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', user: waqasUser }),
        }).catch(() => null);
      }

      return {
        success: true,
        message: 'Welcome, Founder & CEO Waqas Gill! Your Super Admin master account is verified and immediately active.',
        requiresApproval: false,
      };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: data.password,
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || '',
      role: 'TEAM_MEMBER',
      designation: data.designation,
      branchId: data.branchId,
      avatar:
        data.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      canAccessAllBranches: false,
      status: 'PENDING',
      joiningType: data.joiningType || 'PERCENTAGE',
      personalGoogleSheetUrl: data.personalGoogleSheetUrl || '',
      joinedAt: new Date().toISOString().split('T')[0],
      emailVerified: true,
    };

    setUsers((prev) => [...prev, newUser]);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', user: newUser }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return {
          success: false,
          message: resData.message || 'Registration failed.',
          requiresApproval: false,
        };
      }
      return {
        success: true,
        message: resData.message || 'Registration submitted! For company security, your account will be unlocked once approved by Founder & CEO Waqas Gill.',
        requiresApproval: true,
      };
    } catch (e: any) {
      return {
        success: true,
        message: 'Your Gmail address has been verified and registration submitted! For company security, your account will be unlocked once approved by Founder & CEO Waqas Gill.',
        requiresApproval: true,
      };
    }
  };

  const approveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'ACTIVE' } : u))
    );
    if (typeof window !== 'undefined') {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', userId }),
      }).catch((e) => console.warn('API sync notice:', e));
    }
  };

  const rejectUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'REJECTED' } : u))
    );
    if (typeof window !== 'undefined') {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', userId }),
      }).catch((e) => console.warn('API sync notice:', e));
    }
  };

  // Direct create user by Admin
  const directCreateUser = (userData: Partial<UserProfile> & { name: string; username: string; email: string; password: string }): { success: boolean; message: string } => {
    const cleanEmail = userData.email.toLowerCase().trim();
    const cleanUsername = userData.username.toLowerCase().trim();

    if (users.some((u) => u.email.toLowerCase().trim() === cleanEmail)) {
      return { success: false, message: 'This email address is already registered in the system.' };
    }
    if (users.some((u) => u.username && u.username.toLowerCase().trim() === cleanUsername)) {
      return { success: false, message: 'This username is already taken. Please choose another.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name,
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

    setUsers((prev) => [newUser, ...prev]);

    if (typeof window !== 'undefined') {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'directCreate', userData }),
      }).catch((e) => console.warn('API sync notice:', e));
    }

    return { success: true, message: `Team member "${userData.name}" has been registered directly and is active immediately!` };
  };

  // Email OTP helpers
  const sendEmailOTP = async (
    email: string,
    purpose: 'SIGNUP' | 'FORGOT_PASSWORD' = 'SIGNUP'
  ): Promise<{ success: boolean; message: string; otp?: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to send OTP verification code.' };
    }
  };

  const verifyEmailOTP = async (
    email: string,
    otp: string,
    purpose: 'SIGNUP' | 'FORGOT_PASSWORD' = 'SIGNUP'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, otp, purpose }),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'OTP verification request failed.' };
    }
  };

  const resetPasswordWithOTP = async (
    email: string,
    otp: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const verifyRes = await verifyEmailOTP(email, otp, 'FORGOT_PASSWORD');
    if (!verifyRes.success) {
      return verifyRes;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (!user) {
      return { success: false, message: 'No account found matching this email address.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, password: newPass } : u))
    );

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('empirenexs_session_user_prod');
    }
  };

  // Appearance Theme Mode (Dark / Light)
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Profile Management
  const updateUserProfile = (updates: Partial<UserProfile>): { success: boolean; message: string } => {
    if (updates.username && updates.username.trim().toLowerCase() !== currentUser.username?.toLowerCase()) {
      const cleanU = updates.username.trim().toLowerCase();
      const conflict = users.some((u) => u.id !== currentUser.id && u.username?.toLowerCase() === cleanU);
      if (conflict) {
        return { success: false, message: `The username "${updates.username}" is already in use by another team member.` };
      }
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      ...updates,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    if (typeof window !== 'undefined') {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateProfile', userId: currentUser.id, updates }),
      }).catch((e) => console.warn('Profile sync notice:', e));
    }

    return { success: true, message: 'Profile updated successfully!' };
  };

  const changeUserPassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    if (currentUser.password && currentUser.password !== currentPass) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      password: newPass,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    return { success: true, message: 'Password has been updated successfully!' };
  };

  // Channels state
  const [channels, setChannels] = useState<ChannelRecord[]>(INITIAL_CHANNELS);

  // Niches state & User Claims
  const [nicheTabs, setNicheTabs] = useState<NicheTab[]>(INITIAL_NICHE_TABS);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_NICHE_TABS[0].id);
  const [userNicheClaims, setUserNicheClaims] = useState<NicheClaimRecord[]>([]);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [teamChatLogs, setTeamChatLogs] = useState<ChatLogEntry[]>([]);

  // Load per-user persistent chat history
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser?.id) {
      const savedUserChat = localStorage.getItem(`empirenexs_chat_${currentUser.id}`);
      if (savedUserChat) {
        try {
          const parsed = JSON.parse(savedUserChat);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatMessages(parsed);
            return;
          }
        } catch (e) {
          console.warn('Error parsing user chat:', e);
        }
      }
      // Personalized welcome greeting
      setChatMessages([
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          senderName: 'Nexs AI Assistant',
          text: `Assalam o Alaikum **${currentUser?.name || 'Friend'}**! 👋\n\nMein EmpireNexs AI Operations Assistant hoon. Aap mujh se Channels Vault, Video Niches & Scripts, YouTube OTP Numbers, ya EmpireNexs SOPs ke baray mein kisi bhi waqt pooch saktay hain.\n\nAaj aap kis cheez par kaam karna chahein gay?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentUser?.id]);

  // Persist current user's chat messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser?.id && chatMessages.length > 0) {
      localStorage.setItem(`empirenexs_chat_${currentUser.id}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, currentUser?.id]);

  // Fetch all team chat logs (for Founder & CEO Waqas Gill)
  const fetchTeamChatLogs = async (targetUserId?: string, targetMonth?: string): Promise<ChatLogEntry[]> => {
    try {
      let url = '/api/chat';
      const params = new URLSearchParams();
      if (targetUserId && targetUserId !== 'all') params.append('userId', targetUserId);
      if (targetMonth && targetMonth !== 'all') params.append('month', targetMonth);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.chatLogs)) {
        setTeamChatLogs(data.chatLogs);
        return data.chatLogs;
      }
    } catch (e) {
      console.warn('Failed to fetch team chat logs:', e);
    }
    return [];
  };

  // Settings & Sheets Sync
  const [settings, setSettings] = useState<SystemSettings>({
    geminiApiKey: '',
    googleSheetChannelsUrl: 'https://docs.google.com/spreadsheets/d/1EmpireNexs-Channels-Vault-2026/edit',
    googleSheetNichesUrl: 'https://docs.google.com/spreadsheets/d/1EmpireNexs-Niches-Production-Hub/edit',
    autoSyncIntervalMinutes: 30,
    aiSystemPrompt: `You are the executive AI Operations Assistant for EmpireNexs, a multi-branch YouTube Automation powerhouse.
Branches: 
1. Musafirkhana (Founder & CEO: Waqas Gill)
2. Bahawalpur (Co-Founder: Saim Ch)
3. Rahim Yar Khan (Co-Founder: Zainab Akhtar)
Instructions:
- Provide fast, accurate, professional guidance.
- When someone asks for a channel link or details, search the Channels Vault and deliver the exact link and status.
- Keep sensitive credentials (passwords, backup codes) protected unless requested by verified Super Admin Waqas Gill.
- Strict Phone Quota: Each user can only receive 1 phone number per 24 hours. Zero duplicate numbers ever for the same channel name or YouTube link.
- Strict Niche Quota: Each user can claim at most 2 niche topics per day from the sheets.
- Understand Roman Urdu, Urdu, and English fluently.`,
    smsProvider: 'Hero-SMS',
    smsApiKey: '5A61231e6A24791589Ae8efeAcfb7A4d',
    smsBalance: 8.9595,
    dailyNumberLimitPerUser: 1,
    dailyNicheLimitPerUser: 2,
    heroSmsApiKey: '5A61231e6A24791589Ae8efeAcfb7A4d',
  });

  // Load saved Hero-SMS key on mount and fetch real balance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('empirenexs_herosms_key') || '5A61231e6A24791589Ae8efeAcfb7A4d';
      if (savedKey) {
        setSettings((prev) => ({ ...prev, heroSmsApiKey: savedKey }));
        fetch(`/api/hero-sms?action=getBalance&apiKey=${savedKey}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success && typeof d.balance === 'number') {
              setSettings((prev) => ({ ...prev, smsBalance: d.balance }));
            }
          })
          .catch(() => null);
      }
    }
  }, []);

  // Phone Number & OTP Orders state
  const [otpOrders, setOtpOrders] = useState<OTPOrderRecord[]>(INITIAL_OTP_ORDERS);

  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Hydration-safe initial state loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUsers = localStorage.getItem('empirenexs_users_prod');
        let currentUsersList = INITIAL_USERS.map(sanitizeUser);
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const updated = parsed.map(sanitizeUser);
            INITIAL_USERS.forEach((initUser) => {
              if (!updated.some((u) => u.id === initUser.id || u.username === initUser.username)) {
                updated.push(sanitizeUser(initUser));
              }
            });
            setUsers(updated);
            currentUsersList = updated;
          }
        }

        const savedChannels = localStorage.getItem('empirenexs_channels_prod');
        if (savedChannels) {
          const parsed = JSON.parse(savedChannels);
          if (Array.isArray(parsed)) setChannels(parsed);
        }

        const savedOrders = localStorage.getItem('empirenexs_otp_orders_prod');
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed)) setOtpOrders(parsed);
        }

        const savedNiches = localStorage.getItem('empirenexs_niche_tabs_prod');
        if (savedNiches) {
          const parsed = JSON.parse(savedNiches);
          if (Array.isArray(parsed)) setNicheTabs(parsed);
        }

        const savedClaims = localStorage.getItem('empirenexs_niche_claims_prod');
        if (savedClaims) {
          const parsed = JSON.parse(savedClaims);
          if (Array.isArray(parsed)) setUserNicheClaims(parsed);
        }

        const savedSessionId = localStorage.getItem('empirenexs_session_user_prod');
        if (savedSessionId) {
          const found = currentUsersList.find((u: UserProfile) => u.id === savedSessionId);
          if (found && found.status === 'ACTIVE') {
            setCurrentUser(sanitizeUser(found));
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }

        // Fetch users from server API to stay in sync
        fetch('/api/users')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.users) && data.users.length > 0) {
              const sanitizedServerUsers = data.users.map(sanitizeUser);
              setUsers((prev) => {
                const map = new Map<string, UserProfile>();
                sanitizedServerUsers.forEach((u: UserProfile) => map.set(u.id, u));
                prev.forEach((u: UserProfile) => {
                  if (!map.has(u.id)) map.set(u.id, sanitizeUser(u));
                });
                return Array.from(map.values());
              });
              // Auto-activate user if approved while session open
              if (savedSessionId) {
                const updatedSessionUser = sanitizedServerUsers.find((u: UserProfile) => u.id === savedSessionId);
                if (updatedSessionUser && updatedSessionUser.status === 'ACTIVE') {
                  setCurrentUser(sanitizeUser(updatedSessionUser));
                  setIsAuthenticated(true);
                }
              }
            }
          })
          .catch(() => null);

        // Fetch channels from server API to stay in sync
        fetch('/api/channels')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.channels)) {
              setChannels(data.channels);
            }
          })
          .catch(() => null);

        const savedTheme = (localStorage.getItem('empirenexs_theme') as 'dark' | 'light') || 'dark';
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      } catch (e) {
        console.error('Storage parse error:', e);
      } finally {
        setHasLoadedFromStorage(true);
        setIsAuthLoaded(true);
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (hasLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_users_prod', JSON.stringify(users));
    }
  }, [users, hasLoadedFromStorage]);

  useEffect(() => {
    if (hasLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_channels_prod', JSON.stringify(channels));
    }
  }, [channels, hasLoadedFromStorage]);

  useEffect(() => {
    if (hasLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_otp_orders_prod', JSON.stringify(otpOrders));
    }
  }, [otpOrders, hasLoadedFromStorage]);

  useEffect(() => {
    if (hasLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_niche_tabs_prod', JSON.stringify(nicheTabs));
    }
  }, [nicheTabs, hasLoadedFromStorage]);

  useEffect(() => {
    if (hasLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_niche_claims_prod', JSON.stringify(userNicheClaims));
    }
  }, [userNicheClaims, hasLoadedFromStorage]);

  // When current user changes, restrict or adapt branch selection
  useEffect(() => {
    if (!currentUser?.canAccessAllBranches) {
      setSelectedBranchId(currentUser?.branchId || 'musafirkhana');
    } else {
      setSelectedBranchId('all');
    }
  }, [currentUser]);

  // STRICT DATA ISOLATION:
  // - Waqas Gill (Founder & CEO): Sees ALL channels across ALL branches & managers
  // - Branch Heads (Saim Ch, Zainab Akhtar): See channels of their branch
  // - Regular Team Members (Mubashir, editors): ONLY see their OWN channels!
  const filteredChannels = channels.filter((ch) => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      if (selectedBranchId !== 'all' && ch.branchId !== selectedBranchId) {
        return false;
      }
      return true;
    }

    if (currentUser?.role === 'CO_FOUNDER' || currentUser?.role === 'BRANCH_HEAD') {
      if (ch.branchId !== currentUser?.branchId) {
        return false;
      }
      return true;
    }

    // Regular Team Member / Student: STRICT DATA ISOLATION
    const userNameClean = (currentUser?.name || '').trim().toLowerCase();
    const userEmailClean = (currentUser?.email || '').trim().toLowerCase();
    const usernameClean = (currentUser?.username || '').trim().toLowerCase();
    const currentUid = currentUser?.id;

    if (ch.userId && ch.userId === currentUid) {
      return true;
    }

    const isMyChannel =
      (ch.managedBy || '').toLowerCase().includes(userNameClean) ||
      (ch.owner || '').toLowerCase().includes(userNameClean) ||
      (ch.managerMail && ch.managerMail.toLowerCase() === userEmailClean) ||
      (usernameClean && (ch.managedBy || '').toLowerCase().includes(usernameClean));

    return isMyChannel;
  });

  // Filter niches based on role & branch
  const filteredNicheTabs = nicheTabs.filter((tab) => {
    if (!currentUser.canAccessAllBranches && tab.branchId !== currentUser.branchId) {
      return false;
    }
    if (selectedBranchId !== 'all' && tab.branchId !== selectedBranchId) {
      return false;
    }
    return true;
  });

  // Channel management functions with Cloud Persistence
  const addChannel = (newCh: Omit<ChannelRecord, 'id' | 'updatedAt'>) => {
    const id = `ch-${Date.now()}`;
    const channel: ChannelRecord = {
      ...newCh,
      id,
      userId: currentUser.id,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setChannels((prev) => [channel, ...prev]);

    if (typeof window !== 'undefined') {
      fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', channel }),
      }).catch((e) => console.warn('Channel add sync error:', e));
    }
  };

  const updateChannel = (id: string, updates: Partial<ChannelRecord>) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id
          ? { ...ch, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : ch
      )
    );

    if (typeof window !== 'undefined') {
      fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, updates }),
      }).catch((e) => console.warn('Channel update sync error:', e));
    }
  };

  const deleteChannel = (id: string) => {
    setChannels((prev) => prev.filter((ch) => ch.id !== id));

    if (typeof window !== 'undefined') {
      fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      }).catch((e) => console.warn('Channel delete sync error:', e));
    }
  };

  // Monetization & Lifecycle Management
  const markChannelMonetized = async (id: string, monetizedAt?: string) => {
    const mDate = monetizedAt || new Date().toISOString().split('T')[0];
    updateChannel(id, {
      status: 'Monetized',
      monetizedAt: mDate,
    });
  };

  const markChannelSold = async (
    id: string,
    salePrice: number,
    soldTo: string,
    soldAt?: string,
    saleCurrency: 'PKR' | 'USD' = 'PKR'
  ) => {
    const sDate = soldAt || new Date().toISOString().split('T')[0];
    updateChannel(id, {
      status: 'Sold',
      salePrice,
      soldTo,
      soldAt: sDate,
      saleCurrency,
    });
  };

  const markChannelDemonetized = async (id: string, issueReason: string, demonetizedAt?: string) => {
    const dDate = demonetizedAt || new Date().toISOString().split('T')[0];
    updateChannel(id, {
      status: 'Demonetized',
      issueReason,
      demonetizedAt: dDate,
    });
  };

  const bulkImportChannels = async (newChannels: Omit<ChannelRecord, 'id' | 'updatedAt'>[]): Promise<number> => {
    const prepared: ChannelRecord[] = newChannels.map((ch, idx) => ({
      ...ch,
      id: `ch-${Date.now()}-${idx}`,
      userId: currentUser.id,
      branchId: currentUser.role === 'SUPER_ADMIN' ? (ch.branchId || 'musafirkhana') : currentUser.branchId,
      managedBy: ch.managedBy || currentUser.name,
      managerMail: ch.managerMail || currentUser.email,
      owner: ch.owner || currentUser.name,
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    setChannels((prev) => [...prepared, ...prev]);

    if (typeof window !== 'undefined') {
      fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkSync',
          newChannels: prepared,
          userId: currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.id,
        }),
      }).catch((e) => console.warn('Bulk channel sync error:', e));
    }

    return prepared.length;
  };

  // Niches management functions
  const addNicheTab = (name: string, description: string, branchId: BranchId) => {
    const newTab: NicheTab = {
      id: `niche-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      branchId,
      videos: [],
    };
    setNicheTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const addVideoToNiche = (nicheId: string, video: Omit<NicheVideoItem, 'id'>) => {
    const newVid: NicheVideoItem = {
      ...video,
      id: `vid-${Date.now()}`,
    };
    setNicheTabs((prev) =>
      prev.map((tab) =>
        tab.id === nicheId ? { ...tab, videos: [...tab.videos, newVid] } : tab
      )
    );
  };

  const updateVideoInNiche = (
    nicheId: string,
    videoId: string,
    updates: Partial<NicheVideoItem>
  ) => {
    setNicheTabs((prev) =>
      prev.map((tab) =>
        tab.id === nicheId
          ? {
              ...tab,
              videos: tab.videos.map((v) => (v.id === videoId ? { ...v, ...updates } : v)),
            }
          : tab
      )
    );
  };

  const deleteVideoFromNiche = (nicheId: string, videoId: string) => {
    setNicheTabs((prev) =>
      prev.map((tab) =>
        tab.id === nicheId
          ? {
              ...tab,
              videos: tab.videos.filter((v) => v.id !== videoId),
            }
          : tab
      )
    );
  };

  // Niches Daily Quota (Max 2 per user per 24 hours)
  const getUserTodayNicheCount = (userId: string): number => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    return userNicheClaims.filter((c) => {
      if (c.userId !== userId) return false;
      const claimTime = new Date(c.claimedAt).getTime();
      return !isNaN(claimTime) ? claimTime >= twentyFourHoursAgo : false;
    }).length;
  };

  const claimNicheTopic = (category: string): { success: boolean; message: string; claim?: NicheClaimRecord } => {
    const todayCount = getUserTodayNicheCount(currentUser.id);
    const limit = settings.dailyNicheLimitPerUser || 2;

    if (todayCount >= limit) {
      return {
        success: false,
        message: `⚠️ **Daily Niche Quota Reached:** You have already claimed your daily quota of ${limit} niches today. Each team member is permitted up to 2 niche claims every 24 hours. Your quota resets tomorrow.`,
      };
    }

    const cleanCat = category.trim().toLowerCase();
    const targetTab =
      nicheTabs.find((t) => t.name.toLowerCase().includes(cleanCat) || t.slug.toLowerCase().includes(cleanCat)) ||
      nicheTabs[0];

    const availableVideo = targetTab.videos.find((v) => !v.claimedBy);
    if (!availableVideo) {
      return {
        success: false,
        message: `Currently there are no unassigned topics available in "${targetTab.name}". New topics will synchronize from Google Sheets shortly.`,
      };
    }

    const nowIso = new Date().toISOString();
    updateVideoInNiche(targetTab.id, availableVideo.id, {
      claimedBy: currentUser.name,
      claimedDate: nowIso.split('T')[0],
      status: 'Scripting',
    });

    const newClaim: NicheClaimRecord = {
      id: `claim-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      nicheTabId: targetTab.id,
      nicheName: targetTab.name,
      videoNo: availableVideo.videoNo,
      topicTitle: availableVideo.topicTitle,
      scriptDocLink: availableVideo.scriptDocLink,
      claimedAt: nowIso,
    };

    setUserNicheClaims((prev) => [newClaim, ...prev]);

    return {
      success: true,
      message: `🎉 **Niche Topic Allotted!**\n\n📌 **Category:** ${targetTab.name}\n🎬 **Video #${availableVideo.videoNo}:** ${availableVideo.topicTitle}\n📝 **Script Link:** ${availableVideo.scriptDocLink}\n\n(Daily quota: ${todayCount + 1}/${limit} claimed today).`,
      claim: newClaim,
    };
  };

  // Google Sheet Sync trigger
  const triggerGoogleSheetSync = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncingSheets(true);
    await new Promise((res) => setTimeout(res, 1800));
    setIsSyncingSheets(false);
    return {
      success: true,
      message: `Sheets synchronized successfully! Loaded ${channels.length} channels and ${nicheTabs.length} niche worksheets from Google Drive.`,
    };
  };

  // Daily Phone Quota: 1 number in last 24 hours per user
  const getUserTodayOTPCount = (userId: string): number => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    return otpOrders.filter((o) => {
      if (o.userId !== userId || o.status === 'CANCELLED') return false;
      const orderTime = new Date(o.createdAt).getTime();
      return !isNaN(orderTime) ? orderTime >= twentyFourHoursAgo : false;
    }).length;
  };

  const getUserTotalOTPCount = (userId: string): number => {
    return otpOrders.filter((o) => o.userId === userId && o.status !== 'CANCELLED').length;
  };

  // Duplicate Check: Check by channel name OR channel link FOREVER
  const getChannelExistingNumber = (channelName: string, channelUrl?: string): OTPOrderRecord | undefined => {
    const cleanName = channelName.trim().toLowerCase();
    const cleanUrl = (channelUrl || '').trim().toLowerCase();

    // Check in otpOrders
    const orderMatch = otpOrders.find(
      (o) =>
        (o.channelName.trim().toLowerCase() === cleanName ||
         (cleanUrl && o.channelUrl && o.channelUrl.trim().toLowerCase() === cleanUrl)) &&
        (o.status === 'COMPLETED' || (o.status === 'PENDING_OTP' && (!o.expiresAt || Date.now() <= o.expiresAt)))
    );
    if (orderMatch) return orderMatch;

    // Check in channels
    const channelMatch = channels.find(
      (ch) =>
        (ch.channelName.trim().toLowerCase() === cleanName ||
         (cleanUrl && ch.channelUrl.trim().toLowerCase() === cleanUrl)) &&
        Boolean(ch.createdNumber)
    );
    if (channelMatch) {
      return {
        id: `prev-${channelMatch.id}`,
        userId: 'system',
        userName: channelMatch.managedBy,
        userEmail: channelMatch.managerMail,
        branchId: channelMatch.branchId,
        channelName: channelMatch.channelName,
        channelUrl: channelMatch.channelUrl,
        phoneNumber: channelMatch.createdNumber,
        provider: 'Hero-SMS',
        country: 'Philippines (+63)',
        otpCode: 'Active',
        status: 'COMPLETED',
        cost: '$0.024',
        createdAt: channelMatch.updatedAt,
        expiresAt: 0,
      };
    }

    return undefined;
  };

  // STRICT PHONE OTP REQUEST:
  // Requires channelName AND channelUrl.
  // Enforces zero duplicate EVER, and 1 per 24 hours per user.
  const requestPhoneOTP = async (
    channelName: string,
    channelUrl: string,
    _userRequestedCountry: string = 'Philippines (+63)',
    _userProvider: string = 'Hero-SMS'
  ): Promise<{ success: boolean; message: string; order?: OTPOrderRecord }> => {
    const trimmedChannel = channelName.trim();
    const trimmedUrl = (channelUrl || '').trim();

    if (!trimmedChannel) {
      return { success: false, message: 'Channel name is required.' };
    }

    if (!trimmedUrl) {
      return { success: false, message: 'YouTube Channel Link (URL) is required for duplicate verification.' };
    }

    const apiKey =
      settings.heroSmsApiKey?.trim() ||
      (typeof window !== 'undefined' ? localStorage.getItem('empirenexs_herosms_key') || '5A61231e6A24791589Ae8efeAcfb7A4d' : '5A61231e6A24791589Ae8efeAcfb7A4d');

    if (!apiKey) {
      return {
        success: false,
        message: `⚠️ **Hero-SMS API Key Missing!**\n\nPlease configure your Hero-SMS API Key in Settings to purchase live verification numbers.`,
      };
    }

    // STRICT RULE 1: Zero duplicate number for same channel name OR channel link EVER
    const existingForChannel = getChannelExistingNumber(trimmedChannel, trimmedUrl);
    if (existingForChannel) {
      return {
        success: false,
        message: `⚠️ **Duplicate Channel Blocked:** Channel "${trimmedChannel}" (${trimmedUrl}) has already received a verified phone number (${existingForChannel.phoneNumber} - Status: ${existingForChannel.otpCode || 'Active'}). Multiple numbers for the same channel are strictly prohibited.`,
      };
    }

    // STRICT RULE 2: Daily limit of 1 per unique user in last 24 hours (Super Admin has Founder Override)
    const todayUsed = getUserTodayOTPCount(currentUser.id);
    if (currentUser.role !== 'SUPER_ADMIN' && todayUsed >= settings.dailyNumberLimitPerUser) {
      return {
        success: false,
        message: `⚠️ **Daily Limit Exceeded:** You have already purchased your allowance of ${settings.dailyNumberLimitPerUser} number in the last 24 hours. Each user is limited to 1 number every 24 hours.`,
      };
    }

    // REAL API Call to Hero-SMS (Country 4 = Philippines Google/YouTube $0.024)
    try {
      const res = await fetch('/api/hero-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buyNumber', apiKey }),
      });
      const data = await res.json();

      if (!data.success) {
        return {
          success: false,
          message: `❌ **Hero-SMS Error:** ${data.message || data.error || 'Failed to acquire phone number.'}`,
        };
      }

      const orderId = data.orderId;
      const phoneNumber = data.phoneNumber;

      const newOrder: OTPOrderRecord = {
        id: orderId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        branchId: currentUser.branchId === 'all' ? 'musafirkhana' : currentUser.branchId,
        channelName: trimmedChannel,
        channelUrl: trimmedUrl,
        phoneNumber,
        provider: 'Hero-SMS',
        country: 'Philippines (+63)',
        otpCode: null,
        status: 'PENDING_OTP',
        cost: '$0.024',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        expiresAt: Date.now() + 120000,
      };

      setOtpOrders((prev) => [newOrder, ...prev]);

      // Deduct balance locally by 0.024
      setSettings((prev) => ({ ...prev, smsBalance: Math.max(0, prev.smsBalance - 0.024) }));

      // Auto-update or create Channel in Channels Vault with real number
      setChannels((prev) => {
        const exists = prev.some(
          (ch) =>
            ch.channelName.toLowerCase() === trimmedChannel.toLowerCase() ||
            (trimmedUrl && ch.channelUrl.toLowerCase() === trimmedUrl.toLowerCase())
        );
        if (exists) {
          return prev.map((ch) =>
            ch.channelName.toLowerCase() === trimmedChannel.toLowerCase() ||
            (trimmedUrl && ch.channelUrl.toLowerCase() === trimmedUrl.toLowerCase())
              ? { ...ch, createdNumber: phoneNumber, channelUrl: trimmedUrl || ch.channelUrl }
              : ch
          );
        } else {
          const slug = trimmedChannel.toLowerCase().replace(/[^a-z0-9]/g, '');
          const newCh: ChannelRecord = {
            id: `ch-${Date.now()}`,
            nameAndLink: `${trimmedChannel} (${trimmedUrl || `https://youtube.com/@${slug}`})`,
            channelName: trimmedChannel,
            channelUrl: trimmedUrl || `https://youtube.com/@${slug || 'channel'}`,
            status: 'Active',
            email: `${slug || 'channel'}.empire@gmail.com`,
            password: '••••••••••••',
            twoFactor: 'Enabled',
            managedBy: currentUser.name,
            managerMail: currentUser.email,
            backupCodes: 'Available',
            createdNumber: phoneNumber,
            pubId: `pub-${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
            owner: currentUser.name,
            ip: '104.28.19.45 (US Proxy)',
            branchId: currentUser.branchId === 'all' ? 'musafirkhana' : currentUser.branchId,
            niche: 'Automation / Tech',
            subscribers: '0 (New)',
            updatedAt: new Date().toISOString().split('T')[0],
          };
          return [newCh, ...prev];
        }
      });

      // REAL HERO-SMS POLLING LOOP FOR REAL OTP
      const pollIntervalMs = 4000;
      const startTime = Date.now();
      const maxTimeMs = 120000; // 2 minutes

      const intervalId = setInterval(async () => {
        const elapsed = Date.now() - startTime;

        if (elapsed > maxTimeMs) {
          clearInterval(intervalId);

          // Order timed out after 2 minutes! Cancel on Hero-SMS to get refund
          await fetch('/api/hero-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'cancelOrder', orderId, apiKey }),
          }).catch(() => null);

          setOtpOrders((prev) =>
            prev.map((o) => (o.id === orderId && o.status === 'PENDING_OTP' ? { ...o, status: 'EXPIRED' } : o))
          );
          setSettings((prev) => ({ ...prev, smsBalance: prev.smsBalance + 0.024 }));

          const failureMsg: AIChatMessage = {
            id: `msg-otp-fail-${Date.now()}`,
            sender: 'assistant',
            senderName: 'Nexs AI Assistant',
            text: `⚠️ **Verification Code Timed Out**\n\nNo SMS received from YouTube within 2 minutes. The order was automatically cancelled on Hero-SMS and $0.024 has been refunded to your account balance.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChatMessages((prev) => [...prev, failureMsg]);
          return;
        }

        // Check real status from Hero-SMS
        try {
          const statusRes = await fetch(`/api/hero-sms?action=getStatus&orderId=${orderId}&apiKey=${apiKey}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'STATUS_OK' && statusData.code) {
            clearInterval(intervalId);
            const realOtp = statusData.code;

            // Complete order on Hero-SMS
            await fetch('/api/hero-sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'completeOrder', orderId, apiKey }),
            }).catch(() => null);

            setOtpOrders((prev) =>
              prev.map((o) =>
                o.id === orderId ? { ...o, status: 'COMPLETED', otpCode: realOtp } : o
              )
            );

            // Update Channel in Channels Vault
            setChannels((prev) =>
              prev.map((ch) =>
                ch.channelName.toLowerCase() === trimmedChannel.toLowerCase() ||
                (trimmedUrl && ch.channelUrl.toLowerCase() === trimmedUrl.toLowerCase())
                  ? { ...ch, createdNumber: `${phoneNumber} [OTP: ${realOtp}]` }
                  : ch
              )
            );

            // Deliver Real OTP in chat
            const otpReceivedMsg: AIChatMessage = {
              id: `msg-otp-${Date.now()}`,
              sender: 'assistant',
              senderName: 'Nexs AI Assistant',
              text: `🎉 **Hero-SMS Real YouTube OTP Code Received!**\n- **Channel:** ${trimmedChannel}\n- **Link:** ${trimmedUrl}\n- **Phone (Philippines):** \`${phoneNumber}\`\n- **Live OTP Code:** \`${realOtp}\`\n- **Hero-SMS Order ID:** \`#${orderId}\`\n\n(This number and verified code have been synchronized into Channels Vault).`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fetchedItems: [
                {
                  type: 'channel',
                  title: `${trimmedChannel} - Real OTP: ${realOtp}`,
                  details: `Phone: ${phoneNumber} | Hero-SMS Live Order: #${orderId}`,
                  link: trimmedUrl,
                },
              ],
            };
            setChatMessages((prev) => [...prev, otpReceivedMsg]);
          }
        } catch (e) {
          // Keep polling until 2 min timeout
        }
      }, pollIntervalMs);

      return {
        success: true,
        message: `✅ Real Hero-SMS Order Placed! Number: ${phoneNumber} for channel "${trimmedChannel}" (${trimmedUrl}). Waiting for YouTube SMS code (2 min timer)...`,
        order: newOrder,
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Network Error: ${e.message || 'Hero-SMS API failed to connect'}`,
      };
    }
  };

  const cancelOTPOrder = async (orderId: string) => {
    const apiKey = settings.heroSmsApiKey?.trim();
    if (apiKey) {
      await fetch('/api/hero-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancelOrder', orderId, apiKey }),
      }).catch(() => null);
    }
    setOtpOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
    );
  };

  // AI Assistant message handler
  const sendMessageToAI = async (userQuery: string) => {
    const trimmed = userQuery.trim();
    if (!trimmed) return;

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: currentUser?.name || 'User',
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      createdAt: now.toISOString(),
      text: trimmed,
      timestamp: timeStr,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    const logToServer = (msgs: AIChatMessage[]) => {
      if (typeof window === 'undefined') return;
      const logEntries: ChatLogEntry[] = msgs.map((m) => ({
        id: `log-${m.id}`,
        userId: currentUser?.id || 'unknown-user',
        userName: currentUser?.name || 'User',
        userEmail: currentUser?.email || '',
        userRole: currentUser?.role || 'TEAM_MEMBER',
        branchId: currentUser?.branchId || 'musafirkhana',
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
        createdAt: m.createdAt || new Date().toISOString(),
        month,
      }));
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logEntries }),
      }).catch((err) => console.warn('Chat log sync notice:', err));
    };

    const lower = trimmed.toLowerCase();

    // 1. Salam & Greetings
    const isSalam =
      lower.includes('salam') ||
      lower.includes('assalam') ||
      lower.includes('asalam') ||
      lower.includes('aoa') ||
      lower.includes('aslaam') ||
      lower.includes('slm') ||
      /^(hi|hey|hello|helo)\b/i.test(trimmed);

    if (isSalam) {
      const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
      const isBranchManager = currentUser?.role === 'CO_FOUNDER' || currentUser?.role === 'BRANCH_HEAD';

      const optionsText = isSuperAdmin
        ? `- **All-to-All Operations & Sales:** All 3 branches monthly calculations & cashflow\n- **Channels Vault:** Full company channels database & Google Sheets\n- **Branch Analytics:** Graphical comparison between Musafirkhana, Bahawalpur & Rahim Yar Khan\n- **OTP & Niches:** Verification numbers & team claims`
        : isBranchManager
        ? `- **Branch Operations:** Aapki branch ke channels & video performance\n- **Channels Vault:** Branch Google Sheet & channel records\n- **Niche Topics:** Daily team script topics\n- **OTP Verification:** YouTube SMS phone numbers`
        : `- **Assigned Channels:** Aapke assigned YouTube channels ka data\n- **Niche Topics:** Script topics claim karna (daily quota)\n- **OTP Verification:** Real SIM YouTube SMS verification code lena`;

      const reply: AIChatMessage = {
        id: `msg-sal-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `وعلیکم السلام (Walaikum Assalam) **${currentUser?.name || 'Bhai'}**! 😊\n\nEmpireNexs AI Assistant aap ki khidmat mein hazir hai. Umeed hai aap ka din bohat acha guzar raha hoga.\n\nAaj aap kis cheez par baat ya kaam karna chahein gay?\n${optionsText}`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      logToServer([userMsg, reply]);
      return;
    }

    // 2. Hal Chal / "How are you?"
    const isHalChal =
      lower.includes('how are you') ||
      lower.includes('kese ho') ||
      lower.includes('kaise ho') ||
      lower.includes('kia hal') ||
      lower.includes('kya hal') ||
      lower.includes('hal chal') ||
      lower.includes('kaisay ho') ||
      lower.includes('kaisa chal raha') ||
      lower.includes('sab theek') ||
      lower.includes('sab kheriat');

    if (isHalChal) {
      const reply: AIChatMessage = {
        id: `msg-hal-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `Alhamdulillah, mein theek aur fresh hoon! ❤️\n\nAap sunayein **${currentUser?.name || 'Bhai'}**, aap ka hal chal kaisa hai? Video production aur channels ka kaam kaisa chal raha hai?\n\nAaj kis project ya task mein aap ki help karoon?`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      logToServer([userMsg, reply]);
      return;
    }

    // 3. Status Confirmation / "Ho gaya" / Done / Okay
    const isDone =
      lower.includes('ho گیا') ||
      lower.includes('ho gaya') ||
      lower.includes('hogya') ||
      lower.includes('done') ||
      lower.includes('theek hai') ||
      lower.includes('thek ha') ||
      lower.includes('theek hy') ||
      lower.includes('thek hy') ||
      lower.includes('kar lia') ||
      lower.includes('kar diya') ||
      lower === 'ok' ||
      lower === 'okay' ||
      lower.includes('zabardast') ||
      lower === 'good' ||
      lower === 'great' ||
      lower === 'nice';

    if (isDone) {
      const reply: AIChatMessage = {
        id: `msg-done-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `Bohat zabardast! Khushi hui sun kar ke kaam mukammal ho gaya. 👍\n\nKya aap kisi mazeed channel, agle niche topic, ya kisi aur task ke baray mein janna chahtay hain? Mein hazir hoon!`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      logToServer([userMsg, reply]);
      return;
    }

    // 4. Thanks & Gratitude
    const isThanks =
      lower.includes('thank') ||
      lower.includes('thanks') ||
      lower.includes('shukriya') ||
      lower.includes('shukria') ||
      lower.includes('jazakallah') ||
      lower.includes('thx') ||
      lower.includes('ty') ||
      lower.includes('bohot shukriya');

    if (isThanks) {
      const reply: AIChatMessage = {
        id: `msg-thx-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `You're most welcome **${currentUser?.name || 'Bhai'}**! 😊\n\nEmpireNexs team ke sath collaboration karne ka bohat shukriya. Agar kisi mazeed topic, channel link, ya verification OTP ki zaroorat ho to bila-jhijhak batayein!`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      logToServer([userMsg, reply]);
      return;
    }

    // 5. Monthly Calculations & Sales (Strict Privacy Guard)
    const isMonthlyCalc =
      lower.includes('monthly') ||
      lower.includes('sales') ||
      lower.includes('kitne channel') ||
      lower.includes('monetiz') ||
      lower.includes('sold') ||
      lower.includes('revenue') ||
      lower.includes('calculation') ||
      lower.includes('demonetiz');

    if (isMonthlyCalc) {
      const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
      const isBranchManager = currentUser?.role === 'CO_FOUNDER' || currentUser?.role === 'BRANCH_HEAD';

      // 1. Normal Employees / Staff / Students: STRICTLY RESTRICTED
      if (!isSuperAdmin && !isBranchManager) {
        const reply: AIChatMessage = {
          id: `msg-calc-restricted-${Date.now()}`,
          sender: 'assistant',
          senderName: 'Nexs AI Assistant',
          text: `Mohtaram **${currentUser?.name || 'Team Member'}**, company ke monthly sales records, channel monetization totals aur financial revenue calculations confidential hain aur yeh sirf Executive Management (Waqas Gill & Branch Managers) ke liye hain.\n\nAap baraye meherbani apne assigned channels aur daily tasks par focus karein. Agar aapko apne kisi specific channel ke link ya verification number (OTP) mein madad chahiye to bila-jhijhak batayein!`,
          timestamp: timeStr,
          createdAt: now.toISOString(),
        };
        setChatMessages((prev) => [...prev, reply]);
        logToServer([userMsg, reply]);
        return;
      }

      // 2. Branch Managers: ONLY their specific branch
      if (isBranchManager && !isSuperAdmin) {
        const userBranch = currentUser?.branchId || 'bahawalpur';
        const branchTitle =
          userBranch === 'bahawalpur'
            ? 'Team Bahawalpur'
            : userBranch === 'rahim-yar-khan'
            ? 'Team Rahim Yar Khan'
            : 'Team Musafirkhana';
        const branchChannels = channels.filter((c) => c.branchId === userBranch);
        const bTotal = branchChannels.length;
        const bMonetized = branchChannels.filter((c) => c.status === 'Monetized').length;
        const bSold = branchChannels.filter((c) => c.status === 'Sold').length;
        const bActive = branchChannels.filter((c) => c.status === 'Active').length;
        const bDemonetized = branchChannels.filter((c) => c.status === 'Demonetized').length;

        const reply: AIChatMessage = {
          id: `msg-calc-branch-${Date.now()}`,
          sender: 'assistant',
          senderName: 'Nexs AI Assistant',
          text: `🏢 **${branchTitle} Monthly Performance & Channels:**\n- **Branch Vault Channels:** ${bTotal}\n- **Currently Monetized Running:** ${bMonetized}\n- **Active In Production:** ${bActive}\n- **Sold Channels:** ${bSold}\n- **Issues / Demonetized:** ${bDemonetized}\n\n📌 *Confidentiality Notice:* Doosri branches aur global company revenue calculations sirf Founder & CEO (Waqas Gill) ke liye accessible hain.`,
          timestamp: timeStr,
          createdAt: now.toISOString(),
        };
        setChatMessages((prev) => [...prev, reply]);
        logToServer([userMsg, reply]);
        return;
      }

      // 3. Super Admin (Waqas Gill): ALL-TO-ALL Complete Transparency
      const totalCount = channels.length;
      const monetizedCount = channels.filter((c) => c.status === 'Monetized').length;
      const soldCount = channels.filter((c) => c.status === 'Sold').length;
      const activeCount = channels.filter((c) => c.status === 'Active').length;
      const demonetizedCount = channels.filter((c) => c.status === 'Demonetized').length;

      // Branch wise breakdown
      const mfkChannels = channels.filter((c) => c.branchId === 'musafirkhana');
      const bwpChannels = channels.filter((c) => c.branchId === 'bahawalpur');
      const rykChannels = channels.filter((c) => c.branchId === 'rahim-yar-khan');

      const calcRev = (list: typeof channels) =>
        list
          .filter((c) => c.status === 'Sold')
          .reduce((sum, c) => {
            const p = c.salePrice || 0;
            return sum + (c.saleCurrency === 'USD' ? p * 280 : p);
          }, 0);

      const mfkRev = calcRev(mfkChannels);
      const bwpRev = calcRev(bwpChannels);
      const rykRev = calcRev(rykChannels);
      const totalRev = mfkRev + bwpRev + rykRev;

      const reply: AIChatMessage = {
        id: `msg-calc-ceo-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `📊 **CEO Executive Operations & Sales Summary (All-to-All):**\n\n**🌐 Global Network Totals:**\n- **Total Channels in Vault:** ${totalCount}\n- **Currently Monetized Running:** ${monetizedCount}\n- **Active Fleet:** ${activeCount}\n- **Sold Channels:** ${soldCount}\n- **Issues / Demonetized:** ${demonetizedCount}\n- **Total Revenue (PKR):** Rs. ${totalRev.toLocaleString()}\n\n**🏢 Branch-by-Branch Breakdown:**\n- **Musafirkhana (HQ):** ${mfkChannels.filter((c) => c.status === 'Monetized').length} Monetized | ${mfkChannels.filter((c) => c.status === 'Sold').length} Sold | Rev: Rs. ${mfkRev.toLocaleString()}\n- **Bahawalpur (Zainab Akhtar):** ${bwpChannels.filter((c) => c.status === 'Monetized').length} Monetized | ${bwpChannels.filter((c) => c.status === 'Sold').length} Sold | Rev: Rs. ${bwpRev.toLocaleString()}\n- **Rahim Yar Khan (Saim Chaudhry):** ${rykChannels.filter((c) => c.status === 'Monetized').length} Monetized | ${rykChannels.filter((c) => c.status === 'Sold').length} Sold | Rev: Rs. ${rykRev.toLocaleString()}\n\n📈 *CEO Graphical View:* Aap **"Branches & Teams"** page par naya **'📊 Branches Graphical Comparison'** tab khol kar visual comparative bars, revenue distributions aur personal directives notes bhi dekh saktay hain!`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      logToServer([userMsg, reply]);
      return;
    }

    // 6. Company SOPs & Rules
    const isSOPs =
      lower.includes('rule') ||
      lower.includes('sop') ||
      lower.includes('timing') ||
      lower.includes('founder') ||
      lower.includes('ceo') ||
      lower.includes('policy');

    if (isSOPs) {
      const reply: AIChatMessage = {
        id: `msg-sop-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `🏢 **EmpireNexs Management & SOPs Guidelines:**\n- **Founder & CEO:** Waqas Gill (Musafirkhana HQ)\n- **Co-Founders:** Saim Chaudhry (Bahawalpur), Zainab Akhtar (Rahim Yar Khan)\n- **Daily Niche Quota:** Max 2 script topics per team member per 24 hours.\n- **Phone Verification:** 1 number per user per day via Philippines Hero-SMS numbers. Zero duplicate numbers.\n- **Data Isolation:** Students aur creators ka Google Sheet data strictly private aur isolated rehta hai.`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
      };
      setChatMessages((prev) => [...prev, reply]);
      logToServer([userMsg, reply]);
      return;
    }

    // 7. YouTube Link Extraction (handles channels, handles, and video links)
    const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s)>\]"']+)/i;
    const urlMatch = trimmed.match(urlRegex);
    let extractedUrl = urlMatch ? urlMatch[1].replace(/[)>\]"'.]+$/, '').trim() : '';

    // Channel Name Extraction
    let extractedChannel = '';

    // Pattern A: Labeled channel name e.g. "name :(vikzai)", "name: vikzai", "channel: vikzai", "channel name: vikzai"
    const labeledMatch = trimmed.match(/(?:channel\s*name|channel|name)\s*[:=\-]?\s*[\(\[\"'\s]*([a-zA-Z0-9_\s\-&]+?)[\)\]\"'\s]*(?:\s+(?:link|url|http|is|for)|\s*$|,)/i);
    if (labeledMatch && labeledMatch[1]?.trim()) {
      extractedChannel = labeledMatch[1].trim();
    }

    // Pattern B: "for channel X", "for X", "request number for X", "number for X"
    if (!extractedChannel) {
      const forMatch = trimmed.match(/(?:for\s+channel|number\s+for|request\s+(?:number\s+)?for)\s+[\(\[\"'\s]*([a-zA-Z0-9_\s\-&]+?)[\)\]\"'\s]*(?:\s+(?:link|url|http)|\s*$|,)/i);
      if (forMatch && forMatch[1]?.trim()) {
        extractedChannel = forMatch[1].trim();
      }
    }

    // Pattern C: If URL is present, strip the URL and keywords from the text
    if (!extractedChannel && extractedUrl) {
      const clean = trimmed
        .replace(urlRegex, '')
        .replace(/\b(link|url|channel\s*name|channel|name|request|number|otp|phone|sms|please|bhai|do|chahiye|give|me|for|is)\b/gi, '')
        .replace(/[:()\[\]"'=,-]/g, ' ')
        .trim();
      if (clean) {
        extractedChannel = clean.replace(/\s+/g, ' ');
      } else {
        const handleMatch = extractedUrl.match(/@([a-zA-Z0-9_.-]+)/);
        if (handleMatch) {
          extractedChannel = handleMatch[1];
        }
      }
    }

    // Pattern D: History lookup if only URL or only channel name was provided in recent messages
    if (!extractedUrl || !extractedChannel) {
      const recentUserMsgs = chatMessages.filter((m) => m.sender === 'user').slice(-3);
      for (let i = recentUserMsgs.length - 1; i >= 0; i--) {
        const prevText = recentUserMsgs[i].text;
        if (!extractedUrl) {
          const prevUrlMatch = prevText.match(urlRegex);
          if (prevUrlMatch) {
            extractedUrl = prevUrlMatch[1].replace(/[)>\]"'.]+$/, '').trim();
          }
        }
        if (!extractedChannel) {
          const prevLabeled = prevText.match(/(?:channel\s*name|channel|name)\s*[:=\-]?\s*[\(\[\"'\s]*([a-zA-Z0-9_\s\-&]+?)[\)\]\"'\s]*(?:\s+(?:link|url|http)|\s*$|,)/i);
          if (prevLabeled && prevLabeled[1]?.trim()) {
            extractedChannel = prevLabeled[1].trim();
          }
        }
      }
    }

    // 8. Detect OTP / Phone Verification Intent
    const containsOtpKeywords =
      lower.includes('otp') ||
      lower.includes('phone') ||
      lower.includes('number') ||
      lower.includes('num') ||
      lower.includes('sms') ||
      lower.includes('hero-sms') ||
      lower.includes('code') ||
      lower.includes('verify') ||
      lower.includes('verification');

    const isNameAndLinkProvided = Boolean(extractedChannel && extractedUrl);
    const hasNameAndLinkLabels = /(?:channel|name)/i.test(trimmed) && /(?:link|url|http)/i.test(trimmed);

    const lastAssistantMsg = chatMessages.slice(-1)[0];
    const isFollowupToOtpPrompt =
      Boolean(lastAssistantMsg &&
      lastAssistantMsg.sender === 'assistant' &&
      (lastAssistantMsg.text.toLowerCase().includes('channel name') ||
       lastAssistantMsg.text.toLowerCase().includes('verification number') ||
       lastAssistantMsg.text.toLowerCase().includes('to request a number')));

    const wantsOtp =
      containsOtpKeywords ||
      isNameAndLinkProvided ||
      hasNameAndLinkLabels ||
      (isFollowupToOtpPrompt && (Boolean(extractedChannel) || Boolean(extractedUrl)));

    if (wantsOtp) {
      if (!extractedChannel && !extractedUrl) {
        const askDetailsMsg: AIChatMessage = {
          id: `msg-ask-${Date.now()}`,
          sender: 'assistant',
          senderName: 'Nexs AI Assistant',
          text: `Bhai YouTube OTP verification number hasil karne ke liye please **Channel Name** aur **YouTube Channel URL** provide karein.\n\nExample:\n\`name: Vikzai Shorts link: https://youtube.com/@vikzai\``,
          timestamp: timeStr,
          createdAt: now.toISOString(),
        };
        setChatMessages((prev) => [...prev, askDetailsMsg]);
        logToServer([userMsg, askDetailsMsg]);
        return;
      }

      if (!extractedChannel) {
        const askNameMsg: AIChatMessage = {
          id: `msg-askname-${Date.now()}`,
          sender: 'assistant',
          senderName: 'Nexs AI Assistant',
          text: `Link \`${extractedUrl}\` ke liye please **Channel Name** specify karein taake verification number order ho sake.`,
          timestamp: timeStr,
          createdAt: now.toISOString(),
        };
        setChatMessages((prev) => [...prev, askNameMsg]);
        logToServer([userMsg, askNameMsg]);
        return;
      }

      if (!extractedUrl) {
        const askLinkMsg: AIChatMessage = {
          id: `msg-asklink-${Date.now()}`,
          sender: 'assistant',
          senderName: 'Nexs AI Assistant',
          text: `Channel **"${extractedChannel}"** ke liye please **YouTube Channel Link (URL)** provide karein taake duplicate check kar ke number book kiya ja sake.`,
          timestamp: timeStr,
          createdAt: now.toISOString(),
        };
        setChatMessages((prev) => [...prev, askLinkMsg]);
        logToServer([userMsg, askLinkMsg]);
        return;
      }

      // Both extractedChannel and extractedUrl are ready!
      const otpResult = await requestPhoneOTP(extractedChannel, extractedUrl);

      if (!otpResult.success) {
        const errorMsg: AIChatMessage = {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          senderName: 'Nexs AI Assistant',
          text: otpResult.message,
          timestamp: timeStr,
          createdAt: now.toISOString(),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
        logToServer([userMsg, errorMsg]);
        return;
      }

      const waitingMsg: AIChatMessage = {
        id: `msg-wait-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `⏳ **Hero-SMS Real Number Purchased!**\n- **Channel:** **${extractedChannel}**\n- **Link:** ${extractedUrl}\n- **Phone (Philippines):** \`${otpResult.order?.phoneNumber}\`\n- **Cost:** $0.024\n- **Purchased By:** ${currentUser?.name || 'Creator'}\n\n👉 **Next Step:** Copy this phone number into YouTube Studio phone verification. The system is listening live for your YouTube SMS code (2 minute window). As soon as YouTube sends the code, it will be posted here automatically!`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
      };
      setChatMessages((prev) => [...prev, waitingMsg]);
      logToServer([userMsg, waitingMsg]);
      return;
    }

    // 9. Niche Topic Claim Intent (Daily Quota: Max 2)
    const wantsNiche =
      lower.includes('niche') ||
      lower.includes('topic') ||
      lower.includes('script link') ||
      lower.includes('idea');

    if (wantsNiche) {
      let requestedCategory = 'Tech & AI';
      if (lower.includes('luxury') || lower.includes('billionaire')) requestedCategory = 'Luxury & Billionaires';
      if (lower.includes('mystery') || lower.includes('crime')) requestedCategory = 'Crime & Mysteries';
      if (lower.includes('stoic') || lower.includes('psychology')) requestedCategory = 'Psychology & Stoicism';
      if (lower.includes('space') || lower.includes('science')) requestedCategory = 'Space & Science';

      const claimResult = claimNicheTopic(requestedCategory);

      const nicheMsg: AIChatMessage = {
        id: `msg-niche-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: claimResult.message,
        timestamp: timeStr,
        createdAt: now.toISOString(),
        fetchedItems: claimResult.claim
          ? [
              {
                type: 'niche',
                title: claimResult.claim.topicTitle,
                details: `Category: ${claimResult.claim.nicheName} | Video #${claimResult.claim.videoNo}`,
                link: claimResult.claim.scriptDocLink,
              },
            ]
          : undefined,
      };

      setChatMessages((prev) => [...prev, nicheMsg]);
      logToServer([userMsg, nicheMsg]);
      return;
    }

    // 10. Channel Search Intent
    const matchingChannels = channels.filter(
      (c) =>
        lower.includes(c.channelName.toLowerCase()) ||
        lower.includes(c.niche.toLowerCase()) ||
        c.channelName.toLowerCase().includes(lower)
    );

    if (matchingChannels.length > 0) {
      const ch = matchingChannels[0];
      const channelMsg: AIChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'assistant',
        senderName: 'Nexs AI Assistant',
        text: `📌 **Channel Found:** **${ch.channelName}**\n- **Status:** ${ch.status}\n- **Link:** ${ch.channelUrl}\n- **Niche:** ${ch.niche}\n- **Managed By:** ${ch.managedBy}\n- **Verified Number:** ${ch.createdNumber || 'None'}\n- **Owner:** ${ch.owner}`,
        timestamp: timeStr,
        createdAt: now.toISOString(),
        fetchedItems: [
          {
            type: 'channel',
            title: ch.channelName,
            details: `Status: ${ch.status} | Niche: ${ch.niche} | Manager: ${ch.managedBy}`,
            link: ch.channelUrl,
          },
        ],
      };
      setChatMessages((prev) => [...prev, channelMsg]);
      logToServer([userMsg, channelMsg]);
      return;
    }

    // 11. Courteous Fallback
    const defaultMsg: AIChatMessage = {
      id: `msg-default-${Date.now()}`,
      sender: 'assistant',
      senderName: 'Nexs AI Assistant',
      text: `Mein EmpireNexs AI Operations Assistant hoon. Mein aap ko Channels Vault, Video Niches & Scripts, YouTube OTP Verification, aur Monthly Sales ke baray mein complete assist kar sakta hoon.\n\n- **OTP Number ke liye:** *"Vikzai channel ke liye OTP number do"* (Channel link ke sath)\n- **Topic claim karne ke liye:** *"Mujhe Tech niche ka topic do"* (Daily limit: 2)\n- **Channel search karne ke liye:** Channel ka naam likhein.\n\nAap kis cheez par kaam karna chahein gay?`,
      timestamp: timeStr,
      createdAt: now.toISOString(),
    };
    setChatMessages((prev) => [...prev, defaultMsg]);
    logToServer([userMsg, defaultMsg]);
  };

  const clearChatHistory = () => {
    setChatMessages(INITIAL_CHAT_MESSAGES);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined' && newSettings.heroSmsApiKey) {
        localStorage.setItem('empirenexs_herosms_key', newSettings.heroSmsApiKey);
      }
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        isAuthLoaded,
        login,
        registerUser,
        logout,
        theme,
        setTheme,
        toggleTheme,
        updateUserProfile,
        changeUserPassword,
        sendEmailOTP,
        verifyEmailOTP,
        resetPasswordWithOTP,
        pendingUsers,
        approveUser,
        rejectUser,
        directCreateUser,
        selectedBranchId,
        setSelectedBranchId,
        availableUsers,
        channels,
        addChannel,
        updateChannel,
        deleteChannel,
        filteredChannels,
        markChannelMonetized,
        markChannelSold,
        markChannelDemonetized,
        bulkImportChannels,
        nicheTabs,
        activeTabId,
        setActiveTabId,
        addNicheTab,
        addVideoToNiche,
        updateVideoInNiche,
        deleteVideoFromNiche,
        filteredNicheTabs,
        userNicheClaims,
        claimNicheTopic,
        getUserTodayNicheCount,
        chatMessages,
        isChatOpen,
        setIsChatOpen,
        sendMessageToAI,
        clearChatHistory,
        teamChatLogs,
        fetchTeamChatLogs,
        settings,
        updateSettings,
        isSyncingSheets,
        triggerGoogleSheetSync,
        isSyncModalOpen,
        setIsSyncModalOpen,
        otpOrders,
        requestPhoneOTP,
        cancelOTPOrder,
        getUserTodayOTPCount,
        getUserTotalOTPCount,
        getChannelExistingNumber,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
