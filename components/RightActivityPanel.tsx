'use client';

import React from 'react';
import { useApp } from '@/lib/storeContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  MoreVertical,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const RightActivityPanel: React.FC = () => {
  const { currentUser, channels, otpOrders, setIsChatOpen, sendMessageToAI } = useApp();

  const notifications = [
    { id: 1, title: '56 New creators registered.', time: 'Just now', icon: ShieldCheck, color: 'text-[#c4f042]' },
    { id: 2, title: `${otpOrders.length || 132} Real Hero-SMS orders active.`, time: '59 Minutes ago', icon: CheckCircle2, color: 'text-emerald-400' },
    { id: 3, title: '18 Sheet Tabs synchronized.', time: '12 Hours ago', icon: TrendingUp, color: 'text-teal-400' },
    { id: 4, title: 'Channels Vault updated live.', time: 'Today, 11:59 PM', icon: MessageSquare, color: 'text-[#c4f042]' },
  ];

  const activities = [
    { id: 1, user: 'Waqas Gill', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', action: 'Approved creator signup & vault access.', time: 'Just now' },
    { id: 2, user: 'Saim Chaudhry', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', action: 'Added 4 new Bahawalpur monetized channels.', time: '47 Minutes ago' },
    { id: 3, user: 'Zainab Akhtar', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', action: 'Synchronized Rahim Yar Khan video schedule.', time: '1 Day ago' },
  ];

  const managers = [
    {
      id: 'waqas',
      name: 'Waqas Gill',
      role: 'Founder & CEO (Musafirkhana HQ)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phone: '+92 300 0000000',
      isActive: true,
    },
    {
      id: 'saim',
      name: 'Saim Chaudhry',
      role: 'Co-Founder (Head of Bahawalpur)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      phone: '+92 301 0000000',
      isActive: false,
    },
    {
      id: 'zainab',
      name: 'Zainab Akhtar',
      role: 'Co-Founder (Head of Rahim Yar Khan)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      phone: '+92 302 0000000',
      isActive: false,
    },
  ];

  return (
    <aside className="w-80 bg-[#0d0f13] border-l border-[#1e222b] p-5 space-y-6 hidden 2xl:flex flex-col shrink-0 overflow-y-auto select-none">
      {/* 1. Notifications Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Notifications
          </h3>
          <span className="w-2 h-2 rounded-full bg-[#c4f042] animate-ping" />
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="flex items-start gap-3 group cursor-pointer">
                <div className="p-1.5 rounded-full bg-[#161820] border border-[#232733] shrink-0 mt-0.5">
                  <Icon className={`w-3.5 h-3.5 ${n.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white font-medium group-hover:text-[#c4f042] transition leading-snug">
                    {n.title}
                  </p>
                  <p className="text-[10px] text-[#6c7486] mt-0.5">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Activities Section */}
      <div className="pt-4 border-t border-[#1e222b]">
        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">
          Activities
        </h3>

        <div className="space-y-3.5">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <img
                src={a.avatar}
                alt={a.user}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#262c38] shrink-0 mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-300 font-medium leading-snug">
                  <strong className="text-white font-bold">{a.user}</strong> {a.action}
                </p>
                <p className="text-[10px] text-[#6c7486] mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Contacts of Your Managers Section (Matches demo screenshot!) */}
      <div className="pt-4 border-t border-[#1e222b]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Contacts of your managers
          </h3>
          <MoreVertical className="w-3.5 h-3.5 text-[#6c7486]" />
        </div>

        <div className="space-y-2">
          {managers.map((m) => {
            const isHighlight = m.id === 'waqas';

            return (
              <div
                key={m.id}
                onClick={() => {
                  setIsChatOpen(true);
                  sendMessageToAI(`Manager contact info for ${m.name}`);
                }}
                className={`p-2 rounded-2xl flex items-center justify-between gap-2.5 transition cursor-pointer ${
                  isHighlight
                    ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_20px_rgba(196,240,66,0.35)]'
                    : 'bg-[#161820] border border-[#232733] text-white hover:border-[#333a4a]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className={`w-8 h-8 rounded-full object-cover ${
                      isHighlight ? 'ring-2 ring-[#0d1505]' : 'ring-1 ring-[#262c38]'
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-black truncate ${
                        isHighlight ? 'text-[#0d1505]' : 'text-white'
                      }`}
                    >
                      {m.name}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isHighlight ? 'text-[#0d1505]/80 font-bold' : 'text-[#727a8e]'
                      }`}
                    >
                      {m.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Send message"
                    className={`p-1.5 rounded-full ${
                      isHighlight
                        ? 'bg-[#0d1505]/15 text-[#0d1505] hover:bg-[#0d1505]/25'
                        : 'bg-[#1f232d] text-[#8a92a6] hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Call manager"
                    className={`p-1.5 rounded-full ${
                      isHighlight
                        ? 'bg-[#0d1505]/15 text-[#0d1505] hover:bg-[#0d1505]/25'
                        : 'bg-[#1f232d] text-[#8a92a6] hover:text-white'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
