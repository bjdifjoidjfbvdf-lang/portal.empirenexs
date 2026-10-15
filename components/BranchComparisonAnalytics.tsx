'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/storeContext';
import { BRANCHES } from '@/lib/initialData';
import { BranchId, ChannelRecord } from '@/types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Tv,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Percent,
  Download,
  Info,
} from 'lucide-react';

const MONTH_FILTERS = [
  { label: 'October 2026 (Current)', value: '2026-10' },
  { label: 'September 2026', value: '2026-09' },
  { label: 'August 2026', value: '2026-08' },
  { label: 'All-Time Combined', value: 'ALL' },
];

export const BranchComparisonAnalytics: React.FC = () => {
  const { currentUser, channels, availableUsers } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [activeView, setActiveView] = useState<'all' | 'musafirkhana' | 'bahawalpur' | 'rahim-yar-khan'>('all');

  // CEO Personal Notes State (Persisted in localStorage)
  const [ceoNotes, setCeoNotes] = useState({
    musafirkhana: '',
    bahawalpur: '',
    rahimYarKhan: '',
    general: '',
  });
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);

  // Load saved notes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('empirenexs_ceo_branch_notes');
      if (saved) {
        try {
          setCeoNotes(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleSaveNotes = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('empirenexs_ceo_branch_notes', JSON.stringify(ceoNotes));
      setNotesSavedMsg(true);
      setTimeout(() => setNotesSavedMsg(false), 3000);
    }
  };

  // Restrict access strictly to Super Admin (Waqas Gill)
  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-red-500/30 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted: Executive CEO Only</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Branch performance comparison, cross-branch revenue distributions, and sales metrics are confidential and strictly restricted to Founder &amp; CEO (Waqas Gill).
        </p>
      </div>
    );
  }

  // Branch IDs definition
  const branchIds: { id: BranchId; name: string; head: string; city: string; color: string }[] = [
    {
      id: 'musafirkhana',
      name: 'Musafirkhana HQ',
      head: 'Waqas Gill (Founder & CEO)',
      city: 'Musafirkhana',
      color: 'emerald',
    },
    {
      id: 'bahawalpur',
      name: 'Bahawalpur Branch',
      head: 'Zainab Akhtar / Saim Chaudhry',
      city: 'Bahawalpur',
      color: 'blue',
    },
    {
      id: 'rahim-yar-khan',
      name: 'Rahim Yar Khan Branch',
      head: 'Saim Chaudhry / Zainab Akhtar',
      city: 'Rahim Yar Khan',
      color: 'purple',
    },
  ];

  // Calculate statistics per branch
  const branchMetrics = useMemo(() => {
    return branchIds.map((b) => {
      const branchChannels = channels.filter((c) => c.branchId === b.id);

      // Filter channels for selected month
      const monthChannels = branchChannels.filter((ch) => {
        if (selectedMonth === 'ALL') return true;
        const chMonth = (ch.monetizedAt || ch.updatedAt || '').substring(0, 7);
        const soldMonth = (ch.soldAt || '').substring(0, 7);
        const demonMonth = (ch.demonetizedAt || '').substring(0, 7);
        return chMonth === selectedMonth || soldMonth === selectedMonth || demonMonth === selectedMonth;
      });

      // 1. Currently Running Monetized Channels (active fleet)
      const runningMonetized = branchChannels.filter((c) => c.status === 'Monetized').length;

      // 2. Monetized this Month
      const monetizedThisMonth = monthChannels.filter(
        (c) =>
          (selectedMonth === 'ALL' && Boolean(c.monetizedAt || c.status === 'Monetized')) ||
          (c.monetizedAt && c.monetizedAt.substring(0, 7) === selectedMonth)
      ).length;

      // 3. Sold this Month
      const soldList = monthChannels.filter((c) => {
        if (c.status !== 'Sold') return false;
        if (selectedMonth === 'ALL') return true;
        return c.soldAt ? c.soldAt.substring(0, 7) === selectedMonth : true;
      });
      const soldThisMonth = soldList.length;

      // 4. Revenue Generated in PKR
      const revenuePKR = soldList.reduce((acc, c) => {
        const p = c.salePrice || 0;
        return acc + (c.saleCurrency === 'USD' ? p * 280 : p);
      }, 0);

      // 5. Demonetized / Issues
      const demonetizedCount = monthChannels.filter(
        (c) => c.status === 'Demonetized' || c.status === 'Suspended'
      ).length;

      // 6. Active Team / Creators
      const teamCount = availableUsers.filter((u) => u.branchId === b.id).length;

      return {
        ...b,
        totalVaultChannels: branchChannels.length,
        runningMonetized,
        monetizedThisMonth,
        soldThisMonth,
        revenuePKR,
        demonetizedCount,
        teamCount,
      };
    });
  }, [channels, availableUsers, selectedMonth]);

  // Overall totals
  const overallStats = useMemo(() => {
    return branchMetrics.reduce(
      (acc, curr) => ({
        totalChannels: acc.totalChannels + curr.totalVaultChannels,
        runningMonetized: acc.runningMonetized + curr.runningMonetized,
        monetizedThisMonth: acc.monetizedThisMonth + curr.monetizedThisMonth,
        soldThisMonth: acc.soldThisMonth + curr.soldThisMonth,
        revenuePKR: acc.revenuePKR + curr.revenuePKR,
        demonetizedCount: acc.demonetizedCount + curr.demonetizedCount,
        teamCount: acc.teamCount + curr.teamCount,
      }),
      {
        totalChannels: 0,
        runningMonetized: 0,
        monetizedThisMonth: 0,
        soldThisMonth: 0,
        revenuePKR: 0,
        demonetizedCount: 0,
        teamCount: 0,
      }
    );
  }, [branchMetrics]);

  // Find max value for relative bar heights
  const maxChannelCount = Math.max(
    1,
    ...branchMetrics.map((b) => Math.max(b.runningMonetized, b.monetizedThisMonth, b.soldThisMonth, b.demonetizedCount, 5))
  );

  const maxRevenue = Math.max(1, ...branchMetrics.map((b) => b.revenuePKR));

  return (
    <div className="space-y-6">
      {/* Top Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Founder &amp; CEO Master Analytics
            </span>
            <span className="text-xs text-slate-400">• Multi-Branch Comparative Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Branch Performance &amp; Graphical Comparison
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Live graphical comparison between <strong>Musafirkhana HQ</strong>, <strong>Bahawalpur</strong>, and <strong>Rahim Yar Khan</strong>: Running Monetized Channels, Monthly Monetizations, Sales, Revenue in PKR, and Risk rates.
          </p>
        </div>

        {/* Month Selector Filter */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-1 flex items-center gap-1.5 shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-400 ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-100 pr-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {MONTH_FILTERS.map((f) => (
                <option key={f.value} value={f.value} className="bg-slate-900 text-slate-100">
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Branch Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branchMetrics.map((b) => {
          const revShare = overallStats.revenuePKR > 0
            ? Math.round((b.revenuePKR / overallStats.revenuePKR) * 100)
            : 0;

          const borderColor =
            b.id === 'musafirkhana'
              ? 'border-emerald-500/40 hover:border-emerald-400'
              : b.id === 'bahawalpur'
              ? 'border-blue-500/40 hover:border-blue-400'
              : 'border-purple-500/40 hover:border-purple-400';

          const badgeBg =
            b.id === 'musafirkhana'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : b.id === 'bahawalpur'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border ${borderColor} transition-all shadow-xl relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                  {b.name}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">{b.city}</span>
              </div>

              <h2 className="text-base font-bold text-white">{b.head}</h2>

              {/* Revenue Pill */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Generated Revenue ({selectedMonth === 'ALL' ? 'All-Time' : 'This Month'})
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-emerald-400">
                    Rs. {b.revenuePKR.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {revShare}% of Total
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Running Monetized</span>
                  <span className="text-lg font-black text-white">{b.runningMonetized}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Monetized in Period</span>
                  <span className="text-lg font-black text-cyan-400">{b.monetizedThisMonth}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Sold to Clients</span>
                  <span className="text-lg font-black text-amber-400">{b.soldThisMonth}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Issues / Demonetized</span>
                  <span className={`text-lg font-black ${b.demonetizedCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {b.demonetizedCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GRAPH 1: Comparative Multi-Bar Chart (Side-by-Side Channels Analysis) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Comparative Branch Channels Graph (Monetized vs Sold vs Newly Monetized vs Issues)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side volume comparison of channel milestones across branches for {selectedMonth === 'ALL' ? 'All-Time' : selectedMonth}.
            </p>
          </div>

          {/* Graph Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              <span>Running Monetized</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-cyan-400 inline-block"></span>
              <span>Monetized In Period</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
              <span>Sold Channels</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-red-400 inline-block"></span>
              <span>Demonetized / Issues</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {branchMetrics.map((branch) => {
            const hMonetized = Math.max(8, Math.round((branch.runningMonetized / maxChannelCount) * 160));
            const hNew = Math.max(8, Math.round((branch.monetizedThisMonth / maxChannelCount) * 160));
            const hSold = Math.max(8, Math.round((branch.soldThisMonth / maxChannelCount) * 160));
            const hDemon = Math.max(8, Math.round((branch.demonetizedCount / maxChannelCount) * 160));

            return (
              <div key={branch.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-sm text-white">{branch.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total: {branch.totalVaultChannels} Channels
                  </span>
                </div>

                {/* Bars Chart Area */}
                <div className="h-48 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex items-end justify-around gap-2">
                  {/* Bar 1: Running Monetized */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                    <span className="text-[11px] font-black text-emerald-400">
                      {branch.runningMonetized}
                    </span>
                    <div
                      style={{ height: `${hMonetized}px` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 shadow-md shadow-emerald-500/20"
                    ></div>
                    <span className="text-[10px] text-slate-400 font-medium">Running</span>
                  </div>

                  {/* Bar 2: New Monetized */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                    <span className="text-[11px] font-black text-cyan-400">
                      {branch.monetizedThisMonth}
                    </span>
                    <div
                      style={{ height: `${hNew}px` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all duration-500 shadow-md shadow-cyan-500/20"
                    ></div>
                    <span className="text-[10px] text-slate-400 font-medium">New</span>
                  </div>

                  {/* Bar 3: Sold */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                    <span className="text-[11px] font-black text-amber-400">
                      {branch.soldThisMonth}
                    </span>
                    <div
                      style={{ height: `${hSold}px` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all duration-500 shadow-md shadow-amber-500/20"
                    ></div>
                    <span className="text-[10px] text-slate-400 font-medium">Sold</span>
                  </div>

                  {/* Bar 4: Demonetized */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                    <span className="text-[11px] font-black text-red-400">
                      {branch.demonetizedCount}
                    </span>
                    <div
                      style={{ height: `${hDemon}px` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-500 shadow-md shadow-red-500/20"
                    ></div>
                    <span className="text-[10px] text-slate-400 font-medium">Issues</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAPH 2: Revenue Generation Breakdown (PKR Financial Share) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Branch Revenue Generation Comparison (PKR Cashflow)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of total channel sales revenue generated by each branch in {selectedMonth === 'ALL' ? 'All-Time' : selectedMonth}.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Network Sales</span>
            <span className="text-xl font-black text-emerald-400">
              Rs. {overallStats.revenuePKR.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Proportional Segmented Progress Bar */}
        <div className="space-y-2">
          <div className="h-6 w-full rounded-xl bg-slate-950 p-1 border border-slate-800 flex overflow-hidden gap-1">
            {branchMetrics.map((b) => {
              const widthPct = overallStats.revenuePKR > 0
                ? Math.round((b.revenuePKR / overallStats.revenuePKR) * 100)
                : 33.33;

              const bgGradient =
                b.id === 'musafirkhana'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  : b.id === 'bahawalpur'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                  : 'bg-gradient-to-r from-purple-600 to-purple-400';

              return (
                <div
                  key={b.id}
                  style={{ width: `${Math.max(5, widthPct)}%` }}
                  className={`h-full rounded-lg ${bgGradient} transition-all duration-500 relative group flex items-center justify-center text-[10px] font-black text-slate-950`}
                  title={`${b.name}: Rs. ${b.revenuePKR.toLocaleString()} (${widthPct}%)`}
                >
                  {widthPct >= 10 && `${widthPct}%`}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>Musafirkhana HQ ({overallStats.revenuePKR > 0 ? Math.round((branchMetrics[0].revenuePKR / overallStats.revenuePKR) * 100) : 0}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
              <span>Bahawalpur ({overallStats.revenuePKR > 0 ? Math.round((branchMetrics[1].revenuePKR / overallStats.revenuePKR) * 100) : 0}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
              <span>Rahim Yar Khan ({overallStats.revenuePKR > 0 ? Math.round((branchMetrics[2].revenuePKR / overallStats.revenuePKR) * 100) : 0}%)</span>
            </span>
          </div>
        </div>

        {/* Detailed Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {branchMetrics.map((b) => (
            <div key={b.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">{b.name}</span>
                <span className="text-slate-400 font-mono">{b.soldThisMonth} channels sold</span>
              </div>
              <div className="text-2xl font-black text-white">
                Rs. {b.revenuePKR.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-900">
                <span>Avg. Sale / Channel:</span>
                <span className="text-emerald-400 font-bold">
                  {b.soldThisMonth > 0
                    ? `Rs. ${Math.round(b.revenuePKR / b.soldThisMonth).toLocaleString()}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPREHENSIVE TABULAR MATRIX */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Cross-Branch Operations Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Side-by-side key operational indicators and health retention rates across the 3 hubs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-bold">Operational Metric</th>
                <th className="py-3 px-4 font-bold text-emerald-400">Musafirkhana (HQ)</th>
                <th className="py-3 px-4 font-bold text-blue-400">Bahawalpur</th>
                <th className="py-3 px-4 font-bold text-purple-400">Rahim Yar Khan</th>
                <th className="py-3 px-4 font-bold text-white">Global Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-slate-300">Total Managed Channels in Vault</td>
                <td className="py-3 px-4 font-bold text-white">{branchMetrics[0].totalVaultChannels}</td>
                <td className="py-3 px-4 font-bold text-white">{branchMetrics[1].totalVaultChannels}</td>
                <td className="py-3 px-4 font-bold text-white">{branchMetrics[2].totalVaultChannels}</td>
                <td className="py-3 px-4 font-extrabold text-emerald-400">{overallStats.totalChannels}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-slate-300">Currently Monetized Running Channels</td>
                <td className="py-3 px-4 font-bold text-emerald-400">{branchMetrics[0].runningMonetized}</td>
                <td className="py-3 px-4 font-bold text-emerald-400">{branchMetrics[1].runningMonetized}</td>
                <td className="py-3 px-4 font-bold text-emerald-400">{branchMetrics[2].runningMonetized}</td>
                <td className="py-3 px-4 font-extrabold text-emerald-400">{overallStats.runningMonetized}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-slate-300">Monetized in Selected Period</td>
                <td className="py-3 px-4 font-bold text-cyan-400">{branchMetrics[0].monetizedThisMonth}</td>
                <td className="py-3 px-4 font-bold text-cyan-400">{branchMetrics[1].monetizedThisMonth}</td>
                <td className="py-3 px-4 font-bold text-cyan-400">{branchMetrics[2].monetizedThisMonth}</td>
                <td className="py-3 px-4 font-extrabold text-cyan-400">{overallStats.monetizedThisMonth}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-slate-300">Sold Channels to Clients</td>
                <td className="py-3 px-4 font-bold text-amber-400">{branchMetrics[0].soldThisMonth}</td>
                <td className="py-3 px-4 font-bold text-amber-400">{branchMetrics[1].soldThisMonth}</td>
                <td className="py-3 px-4 font-bold text-amber-400">{branchMetrics[2].soldThisMonth}</td>
                <td className="py-3 px-4 font-extrabold text-amber-400">{overallStats.soldThisMonth}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-slate-300">Sales Cashflow (Revenue)</td>
                <td className="py-3 px-4 font-bold text-white">Rs. {branchMetrics[0].revenuePKR.toLocaleString()}</td>
                <td className="py-3 px-4 font-bold text-white">Rs. {branchMetrics[1].revenuePKR.toLocaleString()}</td>
                <td className="py-3 px-4 font-bold text-white">Rs. {branchMetrics[2].revenuePKR.toLocaleString()}</td>
                <td className="py-3 px-4 font-extrabold text-emerald-400">Rs. {overallStats.revenuePKR.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-slate-300">Demonetized / Policy Issues</td>
                <td className="py-3 px-4 font-bold text-red-400">{branchMetrics[0].demonetizedCount}</td>
                <td className="py-3 px-4 font-bold text-red-400">{branchMetrics[1].demonetizedCount}</td>
                <td className="py-3 px-4 font-bold text-red-400">{branchMetrics[2].demonetizedCount}</td>
                <td className="py-3 px-4 font-extrabold text-red-400">{overallStats.demonetizedCount}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-slate-300">Active Creators &amp; Staff</td>
                <td className="py-3 px-4 font-bold text-slate-200">{branchMetrics[0].teamCount}</td>
                <td className="py-3 px-4 font-bold text-slate-200">{branchMetrics[1].teamCount}</td>
                <td className="py-3 px-4 font-bold text-slate-200">{branchMetrics[2].teamCount}</td>
                <td className="py-3 px-4 font-extrabold text-slate-100">{overallStats.teamCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CEO SCRATCHPAD & BRANCH DIRECTIVES ("ताकि मैं वहां से ये चीजें देख सकूं नोट कर सकूं") */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              CEO Operational Directives &amp; Branch Notes (وقاص گل کے ذاتی نوٹس)
            </h2>
            <p className="text-xs text-slate-400">
              Yahan aap branches ke targets, channel pricing, aur monthly observations note kar saktay hain. Yeh notes sirf aapke liye save rehte hain.
            </p>
          </div>

          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save All Notes</span>
          </button>
        </div>

        {notesSavedMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Notes saved successfully to CEO private storage!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Musafirkhana Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Musafirkhana HQ Notes
            </label>
            <textarea
              value={ceoNotes.musafirkhana}
              onChange={(e) => setCeoNotes((prev) => ({ ...prev, musafirkhana: e.target.value }))}
              placeholder="e.g. Current in-house channel goals, revenue targets, high-performing niches..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Bahawalpur Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Bahawalpur Branch Notes (Zainab Akhtar)
            </label>
            <textarea
              value={ceoNotes.bahawalpur}
              onChange={(e) => setCeoNotes((prev) => ({ ...prev, bahawalpur: e.target.value }))}
              placeholder="e.g. Monetization milestones, sold channels price approvals, team performance..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Rahim Yar Khan Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Rahim Yar Khan Notes (Saim Chaudhry)
            </label>
            <textarea
              value={ceoNotes.rahimYarKhan}
              onChange={(e) => setCeoNotes((prev) => ({ ...prev, rahimYarKhan: e.target.value }))}
              placeholder="e.g. Channel warmup status, creator sheet syncs, monthly sales followups..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
