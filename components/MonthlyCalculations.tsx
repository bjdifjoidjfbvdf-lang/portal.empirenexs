'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/storeContext';
import { ChannelRecord, BranchId } from '@/types';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Calendar,
  Building2,
  ShoppingBag,
  ShieldCheck,
  Flame,
  Percent,
  ExternalLink,
  ChevronRight,
  Filter,
  Users,
  Search,
  Sparkles,
  Layers,
  ArrowUpRight,
  XCircle,
} from 'lucide-react';

const MONTH_OPTIONS = [
  { label: 'October 2026 (Current)', value: '2026-10' },
  { label: 'September 2026', value: '2026-09' },
  { label: 'August 2026', value: '2026-08' },
  { label: 'July 2026', value: '2026-07' },
  { label: 'All-Time Total', value: 'ALL' },
];

export const MonthlyCalculations: React.FC = () => {
  const {
    currentUser,
    filteredChannels,
    updateChannel,
    markChannelMonetized,
    markChannelSold,
    markChannelDemonetized,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sold' | 'inhouse' | 'demonetized' | 'all' | 'history'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for Actions
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isMonetizeModalOpen, setIsMonetizeModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelRecord | null>(null);

  // Form states
  const [salePrice, setSalePrice] = useState<string>('120000');
  const [saleCurrency, setSaleCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [soldTo, setSoldTo] = useState<string>('');
  const [soldDate, setSoldDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [monetizeDate, setMonetizeDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [issueReason, setIssueReason] = useState<string>('Reused Content (YouTube Policy 2026)');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Channels matching month filter
  const monthChannels = useMemo(() => {
    return filteredChannels.filter((ch) => {
      if (selectedMonth === 'ALL') return true;

      // Check if channel was monetized, sold, or updated in this month
      const chMonth = (ch.monetizedAt || ch.updatedAt || '').substring(0, 7);
      const soldMonth = (ch.soldAt || '').substring(0, 7);
      const demonMonth = (ch.demonetizedAt || '').substring(0, 7);

      return chMonth === selectedMonth || soldMonth === selectedMonth || demonMonth === selectedMonth;
    });
  }, [filteredChannels, selectedMonth]);

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    // 1. Total Monetized in period:
    // Either status === 'Monetized', 'Sold' (previously monetized), or 'Demonetized' (previously monetized)
    // Or if status is Monetized/Sold
    const monetizedList = monthChannels.filter(
      (c) => c.status === 'Monetized' || c.status === 'Sold' || Boolean(c.monetizedAt)
    );
    const totalMonetized = monetizedList.length;

    // 2. Sold Channels:
    const soldList = monthChannels.filter((c) => c.status === 'Sold');
    const totalSold = soldList.length;

    // Total Sales Cash in PKR (Convert USD to PKR ~280 for display if needed)
    const totalRevenuePKR = soldList.reduce((acc, c) => {
      const price = c.salePrice || 0;
      if (c.saleCurrency === 'USD') return acc + price * 280;
      return acc + price;
    }, 0);

    // 3. In-House Working Channels (Retained for Internal Cashflow):
    const inHouseList = monthChannels.filter((c) => c.status === 'Monetized' || (c.status === 'Active' && !c.soldAt));
    const totalInHouse = inHouseList.length;

    // 4. Demonetized / Issues Channels:
    const demonetizedList = monthChannels.filter((c) => c.status === 'Demonetized' || c.status === 'Suspended');
    const totalDemonetized = demonetizedList.length;

    // 5. Clean Active Fleet & Retention Rate
    const totalOperating = totalInHouse;
    const healthyCount = Math.max(0, totalOperating - totalDemonetized);
    const retentionRate = totalMonetized > 0
      ? Math.round(((totalMonetized - totalDemonetized) / totalMonetized) * 100)
      : 100;

    return {
      totalMonetized,
      totalSold,
      totalRevenuePKR,
      totalInHouse,
      totalDemonetized,
      healthyCount,
      retentionRate,
      soldList,
      inHouseList,
      demonetizedList,
    };
  }, [monthChannels]);

  // Handlers for quick actions
  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel) return;

    const priceNum = parseFloat(salePrice) || 0;
    await markChannelSold(selectedChannel.id, priceNum, soldTo.trim() || 'Direct Client', soldDate, saleCurrency);
    setIsSellModalOpen(false);
    setSelectedChannel(null);
    setSoldTo('');
  };

  const handleConfirmMonetize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel) return;

    await markChannelMonetized(selectedChannel.id, monetizeDate);
    setIsMonetizeModalOpen(false);
    setSelectedChannel(null);
  };

  const handleConfirmDemonetized = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel) return;

    await markChannelDemonetized(selectedChannel.id, issueReason, issueDate);
    setIsIssueModalOpen(false);
    setSelectedChannel(null);
  };

  // Filter channels in table search
  const searchedChannels = monthChannels.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.channelName.toLowerCase().includes(q) ||
      c.managedBy.toLowerCase().includes(q) ||
      c.owner.toLowerCase().includes(q) ||
      (c.soldTo && c.soldTo.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in-50">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0b1120] to-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Monthly Operations &amp; Sales Calculations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Financial Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live lifecycle tracking: Channels Monetized ➔ Sold to Buyers (with PKR Revenue) ➔ Retained In-House Automation ➔ Demonetization &amp; Issue Ratio.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary Metric Cards */}
      {/* Monthly KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* 1. Monetized */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] shadow-lg relative overflow-hidden group transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a92a6]">
              Monetized
            </span>
            <div className="p-1.5 rounded-lg bg-[#c4f042]/10 text-[#c4f042]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {stats.totalMonetized}
          </div>
          <p className="text-[10px] text-[#22c55e] font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Monetization Pass Rate</span>
          </p>
        </div>

        {/* 2. Sold */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] shadow-lg relative overflow-hidden group transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a92a6]">
              Channels Sold
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-blue-400">
            {stats.totalSold}
          </div>
          <p className="text-[10px] text-[#8a92a6] font-medium mt-1">
            Outflow to Clients / Buyers
          </p>
        </div>

        {/* 3. Sales Cash Revenue */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-[#0c2417] via-[#161820] to-[#161820] border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c4f042]">
              Sales Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-[#c4f042]/10 text-[#c4f042]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-[#c4f042] truncate" title={`Rs ${stats.totalRevenuePKR.toLocaleString()}`}>
            Rs {stats.totalRevenuePKR > 1000000 ? `${(stats.totalRevenuePKR / 1000000).toFixed(2)}M` : stats.totalRevenuePKR.toLocaleString()}
          </div>
          <p className="text-[10px] text-[#8a92a6] font-medium mt-1">
            Realized cash inflow (PKR)
          </p>
        </div>

        {/* 4. In-House Working */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] shadow-lg relative overflow-hidden group transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a92a6]">
              In-House Working
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-400">
            {stats.totalInHouse}
          </div>
          <p className="text-[10px] text-[#8a92a6] font-medium mt-1">
            Retained for Daily Ad Revenue
          </p>
        </div>

        {/* 5. Demonetized / Issues */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] shadow-lg relative overflow-hidden group transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a92a6]">
              Issues / Flagged
            </span>
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-red-400">
            {stats.totalDemonetized}
          </div>
          <p className="text-[10px] text-[#8a92a6] font-medium mt-1">
            Demonetized / Policy strikes
          </p>
        </div>

        {/* 6. Health & Retention */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#232733] hover:border-[#323847] shadow-lg relative overflow-hidden group transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a92a6]">
              Fleet Health
            </span>
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-teal-400">
            {stats.retentionRate}%
          </div>
          <p className="text-[10px] text-teal-300 font-medium mt-1">
            Active Channel Retention
          </p>
        </div>
      </div>

      {/* Operations Lifecycle Visual Funnel */}
      <div className="p-5 rounded-2xl bg-[#161820] border border-[#232733] shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#c4f042]" />
          <span>Monetization &amp; Sales Conversion Pipeline ({selectedMonth === 'ALL' ? 'All Time' : selectedMonth})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-[#0d0f13] border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8a92a6]">Step 1: Monetized</span>
              <p className="text-lg font-black text-white">{stats.totalMonetized} Channels</p>
              <p className="text-[10px] text-[#22c55e]">Successfully Partnered</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6c7486] hidden md:block" />
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-[#0d0f13] border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8a92a6]">Step 2: Sold Out</span>
              <p className="text-lg font-black text-blue-400">{stats.totalSold} Sold</p>
              <p className="text-[10px] text-blue-300">Rs {stats.totalRevenuePKR.toLocaleString()} Realized</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6c7486] hidden md:block" />
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-[#0d0f13] border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8a92a6]">Step 3: Kept In-House</span>
              <p className="text-lg font-black text-amber-400">{stats.totalInHouse} Working</p>
              <p className="text-[10px] text-amber-300">Continuous Daily Video Production</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6c7486] hidden md:block" />
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-[#0d0f13] border border-red-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8a92a6]">Step 4: Attrition / Issues</span>
              <p className="text-lg font-black text-red-400">{stats.totalDemonetized} Flagged</p>
              <p className="text-[10px] text-red-300">{stats.healthyCount} Net Running Clean</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#161820] border border-[#232733] text-xs">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeSubTab === 'overview'
                ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_15px_rgba(196,240,66,0.25)] font-black'
                : 'text-[#8a92a6] hover:text-white'
            }`}
          >
            All Channels ({monthChannels.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sold')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeSubTab === 'sold'
                ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_15px_rgba(196,240,66,0.25)] font-black'
                : 'text-[#8a92a6] hover:text-white'
            }`}
          >
            Sold Channels ({stats.totalSold})
          </button>
          <button
            onClick={() => setActiveSubTab('inhouse')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeSubTab === 'inhouse'
                ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_15px_rgba(196,240,66,0.25)] font-black'
                : 'text-[#8a92a6] hover:text-white'
            }`}
          >
            In-House Active ({stats.totalInHouse})
          </button>
          <button
            onClick={() => setActiveSubTab('demonetized')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeSubTab === 'demonetized'
                ? 'bg-red-500 text-white shadow-sm font-black'
                : 'text-[#8a92a6] hover:text-white'
            }`}
          >
            Demonetized / Issues ({stats.totalDemonetized})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6c7486] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search channels, buyers, managers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#161820] border border-[#232733] rounded-xl text-xs text-white placeholder-[#5f6677] focus:outline-none focus:border-[#c4f042] w-64"
          />
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-[#161820] border border-[#232733] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1a1e27] border-b border-[#232733] text-[11px] font-bold text-[#8a92a6] uppercase tracking-wider">
                <th className="py-3 px-4">Channel Name &amp; URL</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Lifecycle Details</th>
                <th className="py-3 px-3">Sale / Value</th>
                <th className="py-3 px-3">Manager &amp; Branch</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {searchedChannels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-sm font-bold text-slate-300">No channels found for {selectedMonth}</p>
                      <p className="text-xs text-slate-500">
                        Add channels in Channels Vault or mark active channels as Monetized or Sold to track monthly operations.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                searchedChannels.map((ch) => {
                  return (
                    <tr key={ch.id} className="hover:bg-slate-900/40 transition">
                      {/* Name & URL */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{ch.channelName}</span>
                          <a
                            href={ch.channelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-emerald-400"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{ch.channelUrl}</p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            ch.status === 'Sold'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : ch.status === 'Demonetized'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : ch.status === 'Monetized'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{ch.status}</span>
                        </span>
                      </td>

                      {/* Lifecycle Details */}
                      <td className="py-3 px-3">
                        {ch.status === 'Sold' ? (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-200">
                              Buyer: <strong className="text-blue-400">{ch.soldTo || 'Private Investor'}</strong>
                            </p>
                            <p className="text-[10px] text-slate-400">Sold Date: {ch.soldAt || ch.updatedAt}</p>
                          </div>
                        ) : ch.status === 'Demonetized' ? (
                          <div>
                            <p className="text-[11px] font-semibold text-red-400">{ch.issueReason || 'Policy Violation'}</p>
                            <p className="text-[10px] text-slate-400">Date: {ch.demonetizedAt || ch.updatedAt}</p>
                          </div>
                        ) : ch.status === 'Monetized' ? (
                          <div>
                            <p className="text-[11px] font-semibold text-emerald-400">Active Monetization</p>
                            <p className="text-[10px] text-slate-400">Date: {ch.monetizedAt || ch.updatedAt}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">In Preparation</span>
                        )}
                      </td>

                      {/* Sale / Value */}
                      <td className="py-3 px-3 font-mono">
                        {ch.status === 'Sold' ? (
                          <div>
                            <span className="font-bold text-emerald-400 text-xs">
                              {ch.saleCurrency === 'USD' ? `$${ch.salePrice?.toLocaleString()}` : `Rs ${(ch.salePrice || 0).toLocaleString()}`}
                            </span>
                            <p className="text-[10px] text-slate-500">Realized Cash</p>
                          </div>
                        ) : ch.status === 'Monetized' ? (
                          <span className="text-amber-400 text-xs font-bold">In-House Daily Rev</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Manager & Branch */}
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-200">{ch.managedBy}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                          {ch.branchId} Branch
                        </p>
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ch.status !== 'Sold' && (
                            <button
                              onClick={() => {
                                setSelectedChannel(ch);
                                setIsSellModalOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold"
                              title="Record channel sale with price and buyer"
                            >
                              Log Sale
                            </button>
                          )}

                          {ch.status !== 'Monetized' && ch.status !== 'Sold' && (
                            <button
                              onClick={() => {
                                setSelectedChannel(ch);
                                setIsMonetizeModalOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold"
                              title="Mark channel as monetized"
                            >
                              Mark Monetized
                            </button>
                          )}

                          {ch.status !== 'Demonetized' && (
                            <button
                              onClick={() => {
                                setSelectedChannel(ch);
                                setIsIssueModalOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold"
                              title="Flag demonetization issue"
                            >
                              Report Issue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: LOG CHANNEL SALE */}
      {isSellModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-blue-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              Log Channel Sale • {selectedChannel.channelName}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Record selling this monetized channel to an outside buyer or investor with price and date.
            </p>

            <form onSubmit={handleConfirmSale} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Sale Price *</label>
                  <input
                    type="number"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="120000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Currency</label>
                  <select
                    value={saleCurrency}
                    onChange={(e) => setSaleCurrency(e.target.value as 'PKR' | 'USD')}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PKR">Pakistani Rupee (PKR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Buyer Name / Agency *</label>
                <input
                  type="text"
                  required
                  value={soldTo}
                  onChange={(e) => setSoldTo(e.target.value)}
                  placeholder="e.g. Media Agency Lahore / Ali Raza (+92 300 9999999)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Date Sold</label>
                <input
                  type="date"
                  value={soldDate}
                  onChange={(e) => setSoldDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold"
                >
                  Record Channel Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MARK MONETIZED */}
      {isMonetizeModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-emerald-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Mark Channel Monetized
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Confirm YouTube Partner Program acceptance for <strong>{selectedChannel.channelName}</strong>.
            </p>

            <form onSubmit={handleConfirmMonetize} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Monetization Date</label>
                <input
                  type="date"
                  value={monetizeDate}
                  onChange={(e) => setMonetizeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMonetizeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save as Monetized
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT ISSUE / DEMONETIZED */}
      {isIssueModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Report Issue or Demonetization
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Flag issue on <strong>{selectedChannel.channelName}</strong> to subtract from net working fleet.
            </p>

            <form onSubmit={handleConfirmDemonetized} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Violation / Issue Reason *</label>
                <select
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Reused Content (YouTube Policy 2026)">Reused Content</option>
                  <option value="Misleading Metadata / Clickbait">Misleading Metadata</option>
                  <option value="AdSense Suspension / Identity Verification">AdSense Suspension</option>
                  <option value="Community Guidelines Strike">Community Guidelines Strike</option>
                  <option value="Copyright Strike">Copyright Strike</option>
                  <option value="Channel Suspended by YouTube">Channel Suspended</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Date Flagged</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-slate-950 font-bold"
                >
                  Record Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
