import { Branch, ChannelRecord, NicheTab, UserProfile, OTPOrderRecord } from '@/types';

export const BRANCHES: Branch[] = [
  {
    id: 'musafirkhana',
    name: 'Team Musafirkhana',
    code: 'MFK',
    head: 'Waqas Gill',
    role: 'Founder & CEO',
    city: 'Musafirkhana',
    color: 'emerald',
    stats: {
      totalChannels: 0,
      activeVideos: 0,
      teamCount: 1,
      monthlyOutput: 0,
    },
  },
  {
    id: 'bahawalpur',
    name: 'Team Bahawalpur',
    code: 'BWP',
    head: 'Saim Chaudhry',
    role: 'Co-Founder & Branch Head',
    city: 'Bahawalpur',
    color: 'blue',
    stats: {
      totalChannels: 0,
      activeVideos: 0,
      teamCount: 1,
      monthlyOutput: 0,
    },
  },
  {
    id: 'rahim-yar-khan',
    name: 'Team Rahim Yar Khan',
    code: 'RYK',
    head: 'Zainab Akhtar',
    role: 'Co-Founder & Branch Head',
    city: 'Rahim Yar Khan',
    color: 'purple',
    stats: {
      totalChannels: 0,
      activeVideos: 0,
      teamCount: 1,
      monthlyOutput: 0,
    },
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-waqas',
    name: 'Waqas Gill',
    username: 'waqasgill',
    email: 'muhammadwaqasmwg@gmail.com',
    password: 'admin123',
    phone: '+92 300 0000000',
    address: 'EmpireNexs HQ, Musafirkhana',
    role: 'SUPER_ADMIN',
    designation: 'Founder & CEO',
    branchId: 'all',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    canAccessAllBranches: true,
    status: 'ACTIVE',
    joinedAt: '2026-01-10',
    emailVerified: true,
  },
  {
    id: 'user-saim',
    name: 'Saim Chaudhry',
    username: 'saimchaudhry',
    email: 'saim@empirenexs.com',
    password: 'saim123',
    phone: '+92 301 1111111',
    address: 'Model Town A, Bahawalpur',
    role: 'CO_FOUNDER',
    designation: 'Co-Founder / Head of Bahawalpur',
    branchId: 'bahawalpur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    canAccessAllBranches: false,
    status: 'ACTIVE',
    joinedAt: '2026-01-15',
    emailVerified: true,
  },
  {
    id: 'user-zainab',
    name: 'Zainab Akhtar',
    username: 'zainabakhtar',
    email: 'zainab@empirenexs.com',
    password: 'zainab123',
    phone: '+92 302 2222222',
    address: 'Gulshan-e-Iqbal, Rahim Yar Khan',
    role: 'CO_FOUNDER',
    designation: 'Co-Founder / Head of Rahim Yar Khan',
    branchId: 'rahim-yar-khan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    canAccessAllBranches: false,
    status: 'ACTIVE',
    joinedAt: '2026-01-20',
    emailVerified: true,
  },
];

// Clean Production: No dummy channels
export const INITIAL_CHANNELS: ChannelRecord[] = [];

// Production Niche categories aligned with Google Sheet master hub
export const INITIAL_NICHE_TABS: NicheTab[] = [
  {
    id: 'niche-elon',
    name: 'Elon Musk & Storytelling',
    slug: 'elon-musk-storytelling',
    description: 'Love Musk Daily, Chosen Code Breakers, Musk Motivation dramatic monologues & visionary stories.',
    branchId: 'musafirkhana',
    videos: [],
  },
  {
    id: 'niche-music',
    name: 'Ambient Chill Music & Beats',
    slug: 'ambient-chill-music',
    description: 'Elon Soul Music, Elon Studio Music, Musk Music Studio lo-fi & focus soundtracks.',
    branchId: 'bahawalpur',
    videos: [],
  },
  {
    id: 'niche-stoic',
    name: 'Psychology & Mindset Facts',
    slug: 'psychology-mindset-facts',
    description: 'Peak Mindset Facts, Deep Mind, Behavioral Psychology & Stoicism.',
    branchId: 'rahim-yar-khan',
    videos: [],
  },
  {
    id: 'niche-crime',
    name: 'Dark Reality & Crime Mysteries',
    slug: 'dark-reality-crime-mysteries',
    description: 'Dark Reality, The Genius Files, Crime Investigation Vault case studies.',
    branchId: 'musafirkhana',
    videos: [],
  },
  {
    id: 'niche-deals',
    name: 'Alpha Motivation & Mega Deals',
    slug: 'alpha-motivation-mega-deals',
    description: 'Titan Mind Legacy, Deep Deal corporate investigations & high performance.',
    branchId: 'musafirkhana',
    videos: [],
  },
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'assistant' as const,
    senderName: 'Nexs AI Assistant',
    text: 'Hello! I am the EmpireNexs Executive AI Operations Assistant. I monitor YouTube channels across all three branches (Musafirkhana HQ, Bahawalpur, Rahim Yar Khan), Google Sheets synchronizations, and video production pipelines. You can ask me for channel links, credentials, status, niche topics, or YouTube verification numbers anytime!',
    timestamp: '10:00 AM',
  },
];

// Clean Production: No dummy OTP orders
export const INITIAL_OTP_ORDERS: OTPOrderRecord[] = [];
