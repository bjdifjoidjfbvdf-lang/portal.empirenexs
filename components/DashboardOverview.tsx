'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import { BRANCHES } from '@/lib/initialData';
import {
  TrendingUp,
  Youtube,
  Tv,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Shield,
  ArrowUpRight,
  Globe,
  Film,
  Building,
  MoreVertical,
  DollarSign,
  ChevronDown,
  Users,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { currentUser, channels, filteredChannels, nicheTabs, selectedBranchId, setIsChatOpen, sendMessageToAI } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | 'month' | 'quarter'>('month');

  const monetizedCount = filteredChannels.filter((c) => c.status === 'Monetized').length;
  const activeCount = filteredChannels.filter((c) => c.status === 'Active').length;
  const soldCount = filteredChannels.filter((c) => c.status === 'Sold').length;

  // Aggregate videos across all niche tabs
  const allVideos = nicheTabs.flatMap((t) => t.videos);
  const filteredVideos =
    currentUser?.canAccessAllBranches && selectedBranchId === 'all'
      ? allVideos
      : allVideos.filter(
          (v) =>
            v.branchId ===
            (selectedBranchId !== 'all' ? selectedBranchId : (currentUser?.branchId || 'musafirkhana'))
        );

  const pipelineCounts = {
    Idea: filteredVideos.filter((v) => v.status === 'Idea').length,
    Scripting: filteredVideos.filter((v) => v.status === 'Scripting').length,
    Voiceover: filteredVideos.filter((v) => v.status === 'Voiceover').length,
    'Video Editing': filteredVideos.filter((v) => v.status === 'Video Editing').length,
    Thumbnail: filteredVideos.filter((v) => v.status === 'Thumbnail').length,
    Review: filteredVideos.filter((v) => v.status === 'Review').length,
    Scheduled: filteredVideos.filter((v) => v.status === 'Scheduled').length,
    Published: filteredVideos.filter((v) => v.status === 'Published').length,
  };

  // Branch breakdowns for Donut & Sales
  const mfkChannels = channels.filter((c) => c.branchId === 'musafirkhana');
  const bwpChannels = channels.filter((c) => c.branchId === 'bahawalpur');
  const rykChannels = channels.filter((c) => c.branchId === 'rahim-yar-khan');

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Date Dropdown (Exact match to demo image) */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Overview</h1>
          <p className="text-xs text-[#8a92a6] mt-0.5">
            {currentUser?.canAccessAllBranches
              ? 'Multi-branch executive channels, live Google Sheet synchronization & financial overview'
              : `${currentUser?.branchId?.toUpperCase()} branch performance and managed automation pipeline`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="appearance-none bg-[#161820] border border-[#232733] hover:border-[#33394a] text-xs font-bold text-white rounded-xl pl-3 pr-8 py-2 focus:outline-none cursor-pointer transition shadow-sm"
            >
              <option value="today">Today</option>
              <option value="month">This Month (Feb 2026)</option>
              <option value="quarter">This Quarter (Q1)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8a92a6] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => onNavigate('monthly-calc')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#161820] border border-[#232733] hover:border-[#33394a] text-[#c4f042] transition shadow-sm hidden sm:flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Monthly Sales</span>
          </button>
        </div>
      </div>

      {/* 2. Top Row 4 KPI Cards (Matches demo image 4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Revenue */}
        <div className="p-5 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition flex flex-col justify-between group shadow-lg">
          <div>
            <span className="text-xs font-semibold text-[#8a92a6]">Net revenue</span>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-white tracking-tight">
              $3,131,021
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#22c55e]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>0.4% vs last month</span>
          </div>
        </div>

        {/* Card 2: ARR / Managed Channels */}
        <div className="p-5 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition flex flex-col justify-between group shadow-lg">
          <div>
            <span className="text-xs font-semibold text-[#8a92a6]">ARR &amp; Active Fleet</span>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-white tracking-tight">
              $1,511,121
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-bold text-[#22c55e] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>32% vs last quarter</span>
            </span>
            <span className="text-[11px] font-bold text-[#8a92a6] bg-[#1f232d] px-2 py-0.5 rounded-full">
              {filteredChannels.length} Channels
            </span>
          </div>
        </div>

        {/* Card 3: Quarterly Revenue Goal (With SVG Arc Gauge Meter from demo) */}
        <div className="p-5 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition flex items-center justify-between group shadow-lg">
          <div>
            <span className="text-xs font-semibold text-[#8a92a6]">Quarterly revenue goal</span>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-white tracking-tight">
              71%
            </div>
            <p className="text-xs text-[#8a92a6] mt-1">Goal: $1.1M / 100 Vids</p>
          </div>

          {/* Radial Semi-Circle Gauge */}
          <div className="relative w-20 h-14 flex items-end justify-center shrink-0">
            <svg viewBox="0 0 100 55" className="w-20 h-14 overflow-visible">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#242b38"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#22c55e"
                strokeWidth="10"
                strokeDasharray="125.6"
                strokeDashoffset="36.4"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="w-2 h-2 rounded-full bg-[#c4f042] absolute bottom-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#c4f042]" />
          </div>
        </div>

        {/* Card 4: New Orders / Verified Numbers */}
        <div className="p-5 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition flex flex-col justify-between group shadow-lg">
          <div>
            <span className="text-xs font-semibold text-[#8a92a6]">New orders &amp; OTP</span>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-white tracking-tight">
              18,221
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#22c55e]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>11% vs last quarter</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Sales Overview Donut + Profit Wave Chart (Exact demo layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Sales Overview Card with Donut Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-white">Sales Overview</h2>
            <MoreVertical className="w-4 h-4 text-[#6c7486] cursor-pointer hover:text-white transition" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Donut Chart with Center Text */}
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
                {/* Background Ring */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#1f2430" strokeWidth="18" />
                {/* Segment 1: Neon Lime (Musafirkhana 55k) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#c4f042"
                  strokeWidth="18"
                  strokeDasharray="376.99"
                  strokeDashoffset="130"
                  strokeLinecap="round"
                />
                {/* Segment 2: Emerald Green (Bahawalpur 11k) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="18"
                  strokeDasharray="376.99"
                  strokeDashoffset="260"
                  strokeLinecap="round"
                />
                {/* Segment 3: Deep Forest Green (Rahim Yar Khan) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="18"
                  strokeDasharray="376.99"
                  strokeDashoffset="330"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Metrics (102k Weekly Visits from demo) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-white tracking-tight">102k</span>
                <span className="text-[10px] font-bold text-[#8a92a6] uppercase tracking-wider">
                  Weekly Visits
                </span>
              </div>
            </div>

            {/* Breakdown Legend matching demo picture */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#c4f042]/10 text-[#c4f042] border border-[#c4f042]/20">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#8a92a6]">Number of Sales</p>
                  <p className="text-xl font-black text-white tracking-tight">$71,020</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#232733]">
                <div>
                  <div className="flex items-center gap-1.5 text-[#8a92a6]">
                    <span className="w-2 h-2 rounded-full bg-[#c4f042]" />
                    <span className="truncate">Musafirkhana</span>
                  </div>
                  <p className="text-sm font-black text-white mt-0.5">$55,640</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[#8a92a6]">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="truncate">Bahawalpur</span>
                  </div>
                  <p className="text-sm font-black text-white mt-0.5">$11,420</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[#8a92a6]">
                    <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                    <span className="truncate">Rahim Yar Khan</span>
                  </div>
                  <p className="text-sm font-black text-white mt-0.5">$1,840</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[#8a92a6]">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                    <span className="truncate">Niches Vault</span>
                  </div>
                  <p className="text-sm font-black text-white mt-0.5">$2,120</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stacked Cards (New Customers / Profit Wave Chart) (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Top Mini Cards Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8a92a6]">New channels</span>
                <div className="p-1.5 rounded-lg bg-[#c4f042]/10 text-[#c4f042]">
                  <Tv className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xl font-black text-white">{filteredChannels.length}</div>
              <p className="text-[10px] text-[#ef4444] font-bold mt-0.5">-8% Last Week</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8a92a6]">Monetized Fleet</span>
                <div className="p-1.5 rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xl font-black text-white">${monetizedCount * 1200}</div>
              <p className="text-[10px] text-[#22c55e] font-bold mt-0.5">+42% Weekly Profit</p>
            </div>
          </div>

          {/* Bottom Card: Total Profit Glowing Wave Chart (Exact demo image) */}
          <div className="p-5 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition shadow-lg relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#8a92a6]">Total Profit:</p>
                  <p className="text-xl font-black text-white mt-0.5">$136,755.77</p>
                </div>
                <span className="text-[10px] text-[#6c7486] font-bold uppercase tracking-wider">
                  February 2026
                </span>
              </div>
            </div>

            {/* Glowing Emerald Green Curve Wave Chart */}
            <div className="mt-4 -mb-2 -mx-2 h-20 relative">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 80 Q 50 85 90 60 T 170 40 T 230 15 T 300 45 L 300 100 L 0 100 Z"
                  fill="url(#waveGradient)"
                />
                <path
                  d="M 0 80 Q 50 85 90 60 T 170 40 T 230 15 T 300 45"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="230" cy="15" r="4" fill="#c4f042" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Customer List Table + Premium Plane Highlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Customer List / Channels Fleet Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] transition shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-white">Customer &amp; Channel Fleet</h2>
            <MoreVertical className="w-4 h-4 text-[#6c7486] cursor-pointer hover:text-white transition" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232733] text-[#6c7486] text-[11px] font-bold">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Status / Deals</th>
                  <th className="pb-3 font-semibold text-right">Total Deal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232733]/60">
                {channels.slice(0, 4).map((ch, idx) => {
                  const avatars = [
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                  ];
                  const deals = [1023, 963, 843, 720];
                  const values = ['$37,431', '$30,423', '$28,549', '$21,800'];

                  return (
                    <tr key={ch.id} className="hover:bg-[#1a1e28] transition group">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatars[idx % avatars.length]}
                            alt={ch.channelName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#282e3c]"
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-[#c4f042] transition truncate">
                              {ch.channelName}
                            </p>
                            <p className="text-[11px] text-[#6c7486] truncate">{ch.managerMail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-slate-300">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1f2430] text-[#c4f042] border border-[#2b3345]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c4f042]" />
                          {ch.status} • {deals[idx]}
                        </span>
                      </td>
                      <td className="py-3 text-right font-black text-white">
                        {values[idx]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Premium Plan VIP Card (Exact match to demo green mesh card!) (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-[#0a2717] via-[#0f2018] to-[#12171c] border border-emerald-500/30 shadow-[0_0_35px_rgba(34,197,94,0.15)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glowing orb */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-[#c4f042]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#c4f042]/15 text-[#c4f042] border border-[#c4f042]/30">
                <Zap className="w-3.5 h-3.5 fill-[#c4f042]" />
                Premium Plane
              </span>
              <MoreVertical className="w-4 h-4 text-[#8a92a6]" />
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tight">$30</span>
              <div className="text-[11px] text-emerald-400 font-bold leading-tight">
                <p>Per Month</p>
                <p className="text-[#8a92a6]">Per User</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed font-medium">
              Improve your workplace, view and analyze your profits and losses across unified YouTube fleets.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                setIsChatOpen(true);
                sendMessageToAI('Mujhe EmpireNexs automation tools aur monthly performance calculations ke baray mein guide karo');
              }}
              className="w-full py-3 rounded-2xl font-black text-xs bg-[#c4f042] hover:bg-[#b8e833] text-[#0d1505] shadow-[0_0_25px_rgba(196,240,66,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. 3 Branches Leadership & Performance Grid */}
      <div className="p-6 rounded-2xl bg-[#161820] border border-[#232733] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-[#c4f042]" />
              EmpireNexs 3 Branches Network
            </h2>
            <p className="text-xs text-[#8a92a6] mt-0.5">
              Musafirkhana HQ, Bahawalpur, and Rahim Yar Khan leadership output
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BRANCHES.map((branch) => {
            const branchChannels = channels.filter((c) => c.branchId === branch.id);
            const isCurrentUsersBranch =
              currentUser?.canAccessAllBranches || currentUser?.branchId === branch.id;

            return (
              <div
                key={branch.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurrentUsersBranch
                    ? 'bg-[#1a1e27] border-[#2b3345] shadow-md'
                    : 'bg-[#13151b] border-[#1e222b] opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#161820] text-[#c4f042] border border-[#2b3345]">
                      {branch.code} • {branch.city}
                    </span>
                    <h3 className="text-base font-black text-white mt-1.5">{branch.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-[#c4f042]">
                    {branch.stats.monthlyOutput} vids/mo
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#232733] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8a92a6]">Branch Leader:</span>
                    <span className="text-white font-bold">{branch.head}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a6]">Leadership Role:</span>
                    <span className="text-slate-300 font-medium">{branch.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a6]">Channels in Sheet:</span>
                    <span className="text-[#22c55e] font-black">
                      {branchChannels.length} Channels
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#232733] flex items-center justify-between text-xs">
                  <button
                    onClick={() => onNavigate('channels')}
                    className="text-[#c4f042] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>View Channels</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-[#8a92a6]">
                    Status: <strong className="text-[#22c55e]">Active</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
