export type BranchId = 'bahawalpur' | 'rahim-yar-khan' | 'musafirkhana' | 'all';

export interface Branch {
  id: BranchId;
  name: string;
  code: string;
  head: string;
  role: string;
  city: string;
  color: string;
  stats: {
    totalChannels: number;
    activeVideos: number;
    teamCount: number;
    monthlyOutput: number;
  };
}

export type UserRole = 'SUPER_ADMIN' | 'CO_FOUNDER' | 'BRANCH_HEAD' | 'TEAM_MEMBER';

export interface UserProfile {
  id: string;
  name: string;
  username: string; // Unique username (e.g. waqasgill, mubashir_editor)
  email: string;
  password?: string;
  phone?: string; // WhatsApp / Contact
  address?: string; // Physical address / City
  role: UserRole;
  designation: string;
  branchId: BranchId;
  avatar: string;
  canAccessAllBranches: boolean;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  joiningType?: 'PERCENTAGE' | 'SALARY';
  joinedAt?: string;
  emailVerified?: boolean;
}

export interface ChannelRecord {
  id: string;
  nameAndLink: string;
  channelName: string;
  channelUrl: string;
  status: 'Active' | 'Monetized' | 'In Review' | 'Suspended' | 'Warmup';
  email: string;
  password: string;
  twoFactor: string;
  managedBy: string;
  managerMail: string;
  backupCodes: string;
  createdNumber: string;
  pubId: string;
  owner: string;
  branchId: BranchId;
  ip: string;
  niche: string;
  subscribers?: string;
  notes?: string;
  updatedAt: string;
}

export interface NicheVideoItem {
  id: string;
  videoNo: number;
  topicTitle: string;
  scriptWriter: string;
  scriptDocLink: string;
  voiceoverArtist: string;
  voiceoverAudioLink: string;
  videoEditor: string;
  videoDriveLink: string;
  thumbnailDesigner: string;
  thumbnailLink: string;
  status: 'Idea' | 'Scripting' | 'Voiceover' | 'Video Editing' | 'Thumbnail' | 'Review' | 'Scheduled' | 'Published';
  uploadDate: string;
  finalVideoLink: string;
  branchId: BranchId;
  nicheName: string;
  notes?: string;
  claimedBy?: string;
  claimedDate?: string;
}

export interface NicheTab {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  description: string;
  branchId: BranchId;
  videos: NicheVideoItem[];
}

export interface NicheClaimRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  nicheTabId: string;
  nicheName: string;
  videoNo: number;
  topicTitle: string;
  scriptDocLink: string;
  claimedAt: string; // ISO date string
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  actionTaken?: string;
  fetchedItems?: {
    type: 'channel' | 'niche' | 'doc' | 'credential';
    title: string;
    details?: string;
    link?: string;
  }[];
}

export interface OTPOrderRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  branchId: BranchId;
  channelName: string;
  channelUrl: string; // Mandatory channel link
  phoneNumber: string;
  provider: 'Hero-SMS' | 'SMS-Activate' | '5SIM' | 'SMSPool';
  country: string;
  otpCode: string | null;
  status: 'PENDING_OTP' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  cost: string;
  createdAt: string;
  expiresAt: number;
}

export interface SystemSettings {
  geminiApiKey: string;
  googleSheetChannelsUrl: string;
  googleSheetNichesUrl: string;
  autoSyncIntervalMinutes: number;
  aiSystemPrompt: string;
  smsProvider: 'Hero-SMS' | 'SMS-Activate' | '5SIM' | 'SMSPool';
  smsApiKey: string;
  smsBalance: number;
  dailyNumberLimitPerUser: number;
  dailyNicheLimitPerUser: number;
  heroSmsApiKey: string;
}
