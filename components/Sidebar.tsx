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
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { channels, nicheTabs, setIsChatOpen, currentUser, otpOrders } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    ...(currentUser?.role === 'SUPER_ADMIN'
      ? [
          {
            id: 'branch-analytics',
            label: 'Branch Graphs (CEO)',
            icon: BarChart3,
            badge: 'Exclusive',
          },
        ]
      : []),
    {
      id: 'monthly-calc',
      label: 'Monthly Operations & Sales',
      icon: TrendingUp,
      badge: 'Calculations',
    },
    {
      id: 'channels',
      label: 'Channels Vault (Sheet)',
      icon: ShieldCheck,
      badge: `${channels.length}`,
    },
    {
      id: 'niches',
      label: 'Niches Hub (Multi-Tabs)',
      icon: FolderKanban,
      badge: `${nicheTabs.length} Tabs`,
    },
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
      id: 'profile',
      label: 'Profile & Settings',
      icon: User,
    },
    {
      id: 'settings',
      label: 'Google Sheets & API',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Operations
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick AI Callout Widget */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-100">Nexs AI Assistant</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Need any channel link, topic status, or sheet info? AI answers instantly.
          </p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Open Chatbot</span>
          </button>
        </div>
      </div>

      {/* User Status Footer */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <p className="text-[11px] text-slate-400 font-medium">
            System Online • 3 Branches Synced
          </p>
        </div>
      </div>
    </aside>
  );
};
