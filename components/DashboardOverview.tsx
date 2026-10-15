'use client';

import React from 'react';
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
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { currentUser, channels, filteredChannels, nicheTabs, selectedBranchId } = useApp();

  const monetizedCount = filteredChannels.filter((c) => c.status === 'Monetized').length;
  const activeCount = filteredChannels.filter((c) => c.status === 'Active').length;

  // Aggregate videos across all niche tabs
  const allVideos = nicheTabs.flatMap((t) => t.videos);
  const filteredVideos =
    currentUser.canAccessAllBranches && selectedBranchId === 'all'
      ? allVideos
      : allVideos.filter(
          (v) =>
            v.branchId ===
            (selectedBranchId !== 'all' ? selectedBranchId : currentUser.branchId)
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {currentUser.role === 'SUPER_ADMIN' ? 'CEO Executive View' : 'Branch Dashboard'}
              </span>
              <span className="text-xs text-slate-400">• EmpireNexs Multi-Branch Network</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentUser.canAccessAllBranches
                ? 'Monitor unified YouTube Automation output, live Google Sheets synchronization, and secure channels vault across Musafirkhana HQ, Bahawalpur, and Rahim Yar Khan branches.'
                : `Your branch (${currentUser.designation}) channels, video production pipeline, and synchronized Google Sheets data are ready.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('monthly-calc')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-slate-950" />
              <span>Monthly Calculations</span>
            </button>
            <button
              onClick={() => onNavigate('channels')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-2"
            >
              <Youtube className="w-4 h-4 text-emerald-400" />
              <span>Channels Vault</span>
            </button>
            <button
              onClick={() => onNavigate('niches')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-2 hidden lg:flex"
            >
              <Film className="w-4 h-4 text-emerald-400" />
              <span>Niches Pipeline</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Channels */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Managed Channels</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{filteredChannels.length}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% Synced
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across connected Google Sheets</p>
        </div>

        {/* Monetized Channels */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monetized (Revenue)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{monetizedCount}</span>
            <span className="text-xs text-amber-400 font-medium">PUB IDs Connected</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High RPM Niches (Tech, Luxury, Crime)</p>
        </div>

        {/* Active Videos in Pipeline */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Videos in Production</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{filteredVideos.length}</span>
            <span className="text-xs text-blue-400 font-medium">In {nicheTabs.length} Niche Tabs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Script, VO, Edit, Thumbnail</p>
        </div>

        {/* Monthly Output Target */}
        <div className="glass-panel glass-panel-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Video Capacity</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {BRANCHES.reduce((sum, b) => sum + (b.stats.monthlyOutput || 0), 0)}
            </span>
            <span className="text-xs text-purple-400 font-medium">Videos/Month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">3 Branches Combined Output</p>
        </div>
      </div>

      {/* 3 Branches Leadership & Performance Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              EmpireNexs 3 Branches Network
            </h2>
            <p className="text-xs text-slate-400">
              Head of branch, assigned channels, and YouTube automation performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BRANCHES.map((branch) => {
            const branchChannels = channels.filter((c) => c.branchId === branch.id);
            const isCurrentUsersBranch =
              currentUser.canAccessAllBranches || currentUser.branchId === branch.id;

            return (
              <div
                key={branch.id}
                className={`p-5 rounded-xl border transition-all ${
                  isCurrentUsersBranch
                    ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {branch.code} • {branch.city}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{branch.name}</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">
                    {branch.stats.monthlyOutput} vids/mo
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Branch Leader:</span>
                    <span className="text-slate-200 font-bold">{branch.head}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leadership Role:</span>
                    <span className="text-slate-300 font-medium">{branch.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Channels in Sheet:</span>
                    <span className="text-emerald-400 font-bold">
                      {branchChannels.length} Channels
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team Size:</span>
                    <span className="text-slate-300 font-medium">
                      {branch.stats.teamCount} Specialists
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onNavigate('channels')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Channels</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Status: <span className="text-emerald-400 font-bold">Active</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* YouTube Automation Production Pipeline Funnel */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-400" />
              YouTube Video Production Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Live count of videos across all Niche tabs (Idea to Published)
            </p>
          </div>
          <button
            onClick={() => onNavigate('niches')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Open Niches Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {Object.entries(pipelineCounts).map(([stage, count]) => {
            const colors: Record<string, string> = {
              Idea: 'border-slate-700 bg-slate-800/40 text-slate-300',
              Scripting: 'border-blue-500/30 bg-blue-950/30 text-blue-400',
              Voiceover: 'border-purple-500/30 bg-purple-950/30 text-purple-400',
              'Video Editing': 'border-amber-500/30 bg-amber-950/30 text-amber-400',
              Thumbnail: 'border-pink-500/30 bg-pink-950/30 text-pink-400',
              Review: 'border-orange-500/30 bg-orange-950/30 text-orange-400',
              Scheduled: 'border-teal-500/30 bg-teal-950/30 text-teal-400',
              Published: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400',
            };

            return (
              <div
                key={stage}
                className={`p-3 rounded-xl border ${colors[stage] || 'border-slate-800 bg-slate-900'} text-center`}
              >
                <p className="text-[10px] uppercase font-bold tracking-wider truncate mb-1">
                  {stage}
                </p>
                <p className="text-xl font-black text-white">{count}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Videos</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
