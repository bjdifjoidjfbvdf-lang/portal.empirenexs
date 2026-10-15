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
    head: 'Saim Ch',
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
    head: 'Zainab Athar',
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
    name: 'Saim Ch',
    username: 'saimch',
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
    name: 'Zainab Athar',
    username: 'zainabathar',
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

// Clean Production: Niche categories ready for production video items
export const INITIAL_NICHE_TABS: NicheTab[] = [
  {
    id: 'niche-tech',
    name: 'Tech & AI Documentaries',
    slug: 'tech-ai-documentaries',
    description: 'Silicon valley deep dives, artificial intelligence breakdowns, tech giants scandals.',
    branchId: 'musafirkhana',
    videos: [],
  },
  {
    id: 'niche-luxury',
    name: 'Luxury & Billionaires',
    slug: 'luxury-billionaires',
    description: 'High net worth lifestyles, business moguls biographies, luxury real estate and mega projects.',
    branchId: 'bahawalpur',
    videos: [],
  },
  {
    id: 'niche-crime',
    name: 'Crime & Mysteries',
    slug: 'crime-mysteries',
    description: 'Cold cases, mysterious disappearances, criminal psychology investigations.',
    branchId: 'rahim-yar-khan',
    videos: [],
  },
  {
    id: 'niche-stoic',
    name: 'Psychology & Stoicism',
    slug: 'psychology-stoicism',
    description: 'Marcus Aurelius, mental resilience, dark psychology, masculine growth.',
    branchId: 'bahawalpur',
    videos: [],
  },
  {
    id: 'niche-space',
    name: 'Space & Science',
    slug: 'space-science',
    description: 'Cosmology, James Webb discoveries, space race and astrophysical mysteries.',
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
