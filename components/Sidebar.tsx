'use client';

import React from 'react';
import { useApp } from '@/lib/storeContext';
import {
  LayoutDashboard,
  ShieldCheck,
  FolderKanban,
  Users,
  Settings,
  Bot,
  ExternalLink,
  Table,
  Sparkles,
  User,
  Smartphone,
  TrendingUp,
  BarChart3,
  Search,
  Grid2X2,
  Globe,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { channels, nicheTabs, setIsChatOpen, currentUser, otpOrders, proxies } = useApp();

  const dashboardSection: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: Grid2X2,
      badge: 'Live',
    },
    ...(currentUser?.role === 'SUPER_ADMIN'
      ? [
          {
            id: 'branch-analytics',
            label: 'Branch Analytics',
            icon: BarChart3,
            badge: 'CEO',
          },
        ]
      : []),
    {
      id: 'monthly-calc',
      label: 'Monthly Sales',
      icon: TrendingUp,
      badge: 'Calculations',
    },
    {
      id: 'channels',
      label: 'Channels Vault',
      icon: ShieldCheck,
      badge: `${channels.length}`,
    },
    {
      id: 'niches',
      label: 'Niches Hub',
      icon: FolderKanban,
      badge: `${nicheTabs.length} Tabs`,
    },
  ];

  const managementSection: NavItem[] = [
    {
      id: 'team',
      label: 'Branches & Teams',
      icon: Users,
    },
    {
      id: 'otp',
      label: 'Phone & OTP Vault',
      icon: Smartphone,
      badge: `${otpOrders.length}`,
    },
    {
      id: 'proxies',
      label: 'Dedicated Proxies',
      icon: Globe,
      badge: proxies.length > 0 ? `${proxies.length}` : undefined,
    },
  ];

  const settingsSection: NavItem[] = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: User,
    },
    {
      id: 'settings',
      label: 'Sheets & APIs',
      icon: Settings,
    },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#6c7486] mb-2">
        {title}
      </p>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
              isActive
                ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_22px_rgba(196,240,66,0.35)] scale-[1.01]'
                : 'text-[#8a92a6] hover:text-white hover:bg-[#181b24]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0d1505]' : 'text-[#8a92a6]'}`} />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-[#0d1505]/15 text-[#0d1505]'
                    : 'bg-[#1e222c] text-[#8a92a6]'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-64 bg-[#0d0f13] border-r border-[#1e222b] flex flex-col justify-between p-4 shrink-0 hidden md:flex select-none">
      <div className="space-y-5">
        {/* Top User Profile Header (like demo picture) */}
        <div className="flex items-center gap-3 px-2 py-1.5">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#262c38]"
          />
          <div className="min-w-0">
            <h3 className="text-xs font-black text-white truncate">
              {currentUser?.name || 'Waqas Gill'}
            </h3>
            <p className="text-[11px] font-medium text-[#7a8294] truncate">
              {currentUser?.designation || (currentUser?.role === 'SUPER_ADMIN' ? 'Founder & CEO' : 'Co-Founder')}
            </p>
          </div>
        </div>

        {/* Search Bar with Shortcut (like demo picture) */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6c7486] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            readOnly
            onClick={() => setIsChatOpen(true)}
            placeholder="Search channels, niches..."
            className="w-full bg-[#161820] border border-[#232733] rounded-xl pl-8 pr-9 py-2 text-xs text-[#8a92a6] placeholder-[#5f6677] cursor-pointer hover:border-[#33394a] transition focus:outline-none"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#6c7486] bg-[#20242f] px-1.5 py-0.5 rounded border border-[#2b3140]">
            ⌘K
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5 pt-1">
          {renderNavGroup('Dashboards', dashboardSection)}
          {renderNavGroup('Management', managementSection)}
          {renderNavGroup('Settings', settingsSection)}
        </div>

        {/* Quick AI Callout Widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c2417] via-[#131b1e] to-[#12161c] border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#c4f042]" />
            <span className="text-xs font-black text-white">Nexs AI Operations</span>
          </div>
          <p className="text-[11px] text-[#8a92a6] mb-3 leading-relaxed">
            Instant sheet lookups, live OTPs &amp; competitor scraper.
          </p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full py-1.5 px-3 rounded-xl text-xs font-extrabold bg-[#c4f042] hover:bg-[#b8e833] text-[#0d1505] shadow-[0_0_18px_rgba(196,240,66,0.3)] transition flex items-center justify-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#0d1505]" />
            <span>Open AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Brand Footer Logo (DWISON style from demo picture) */}
      <div className="pt-3 border-t border-[#1e222b]">
        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center gap-0.5">
            <span className="w-2 h-2 rounded-full bg-[#c4f042]"></span>
            <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
            <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
          </div>
          <span className="text-xs font-black tracking-widest text-[#8a92a6] uppercase font-mono">
            EmpireNexs
          </span>
        </div>
      </div>
    </aside>
  );
};
