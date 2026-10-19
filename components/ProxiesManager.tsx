'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import {
  Globe,
  Shield,
  KeyRound,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  Coins,
  Building,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Users,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

const COUNTRY_OPTIONS = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
];

export const ProxiesManager: React.FC = () => {
  const {
    currentUser,
    availableUsers: users,
    proxies,
    requestProxy,
    renewProxy,
    toggleUserProxyAuthorization,
    getUserTodayProxyCount,
    getUserTotalProxyCount,
    getUserProxySpend,
    channels,
    settings,
  } = useApp();

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedChannelUrl, setSelectedChannelUrl] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedType, setSelectedType] = useState<'http' | 'socks'>('http');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const isPrivilegedOwner =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'CO_FOUNDER' ||
    currentUser?.id === 'user-waqas';
  const isAuthorized = isPrivilegedOwner || !!currentUser?.canBuyProxies;
  const todayCount = getUserTodayProxyCount(currentUser?.id || '');
  const totalCount = getUserTotalProxyCount(currentUser?.id || '');
  const isLimitReached = !isPrivilegedOwner && todayCount >= 1;

  // Data isolation:
  // - Waqas (CEO / Privileged Owner): Sees ALL team members' proxies
  // - Regular team member: Sees ONLY their own purchased proxies
  const visibleProxies = isPrivilegedOwner
    ? proxies
    : proxies.filter((p) => p.userId === currentUser?.id);

  // Apply filters to visible proxies
  const filteredProxies = visibleProxies.filter((proxy) => {
    if (filterUser !== 'all' && proxy.userId !== filterUser && proxy.userName !== filterUser) {
      return false;
    }
    if (filterCountry !== 'all' && proxy.country.toUpperCase() !== filterCountry.toUpperCase()) {
      return false;
    }
    if (filterStatus !== 'all' && proxy.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchIp = proxy.ip.toLowerCase().includes(q);
      const matchUser = proxy.userName.toLowerCase().includes(q);
      const matchChannel = proxy.assignedChannelName.toLowerCase().includes(q);
      const matchCountry = proxy.country.toLowerCase().includes(q);
      if (!matchIp && !matchUser && !matchChannel && !matchCountry) {
        return false;
      }
    }
    return true;
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!selectedChannel.trim()) {
      setActionError('Target YouTube channel name is required.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestProxy(selectedChannel, selectedChannelUrl, selectedCountry, selectedType);
    setIsSubmitting(false);

    if (!res.success) {
      setActionError(res.message);
    } else {
      setActionSuccess(res.message);
      setIsBuyModalOpen(false);
      setSelectedChannel('');
      setSelectedChannelUrl('');
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleRenew = async (proxyId: string) => {
    setActionError(null);
    const res = await renewProxy(proxyId);
    if (!res.success) {
      setActionError(res.message);
    } else {
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleToggleAuth = async (targetUserId: string, currentVal: boolean) => {
    const res = await toggleUserProxyAuthorization(targetUserId, !currentVal);
    if (!res.success) {
      setActionError(res.message);
    } else {
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#c4f042]" />
              Proxies &amp; Dedicated IPs Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#c4f042]/15 text-[#c4f042] border border-[#c4f042]/30">
              Proxy6.net API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated IPv4 &amp; IPv6 datacenter proxies for YouTube channel management with strict access authorization, 1 proxy/day quota, and per-member usage auditing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Proxy6 Balance (visible ONLY to Waqas / Super Admin) */}
          {isPrivilegedOwner && (
            <div className="px-3.5 py-2 rounded-xl bg-[#161820] border border-[#232732] text-xs flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Proxy6 Balance:</span>
              <span className="font-bold text-emerald-300 font-mono">
                ${(settings.proxyBalance || 24.50).toFixed(2)} USD
              </span>
            </div>
          )}

          {isAuthorized && (
            <button
              onClick={() => {
                setActionError(null);
                setIsBuyModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#c4f042] hover:bg-[#b4eb28] text-[#0d1505] shadow-[0_0_20px_rgba(196,240,66,0.3)] transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Purchase New Proxy</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Access Denied Warning (if user is NOT authorized) */}
      {!isAuthorized && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-amber-300">
                Proxy Purchase Authorization Required
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aapka account abhi proxies purchase karne ke liye authorized nahi hai. Proxy6.net se proxy purchase karne ke liye Founder &amp; CEO <strong>Waqas Gill</strong> ki authorization zaroori hai.
              </p>
              <p className="text-xs text-slate-400">
                Baraye meherbani authorization ke liye Waqas Gill se official WhatsApp par rabta karein:
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://wa.me/923075203713?text=Salam%20Waqas%20bhai,%20mujhe%20portal%20par%20proxy%20purchase%20ki%20authorization%20chahiye."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <span>Contact Waqas Gill on WhatsApp (+923075203713)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Proxies */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isPrivilegedOwner ? 'Organization Active Proxies' : 'Your Active Proxies'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{visibleProxies.length}</span>
            <span className="text-xs text-slate-400">
              {isPrivilegedOwner ? 'Across 3 Hubs' : 'Allocated'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dedicated Datacenter IPs</p>
        </div>

        {/* Daily Quota Status */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Daily Proxy Quota</span>
            <div
              className={`p-2 rounded-lg ${
                isLimitReached ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {todayCount} / {isPrivilegedOwner ? '∞' : '1'}
            </span>
            <span
              className={`text-xs font-bold ${
                isLimitReached ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isPrivilegedOwner ? 'Unlimited (CEO)' : isLimitReached ? 'Quota Used' : 'Quota Available'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Max 1 dedicated proxy per 24 hours</p>
        </div>

        {/* Connected Provider */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Proxy Provider</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">Proxy6.net</span>
            <span className="text-xs text-emerald-400 font-semibold">• Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High-Speed Static IPv4 Route</p>
        </div>

        {/* Channels Linked */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Channels Linked</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {new Set(visibleProxies.map((p) => p.assignedChannelName.toLowerCase())).size}
            </span>
            <span className="text-xs text-amber-400 font-semibold">1-to-1 Mapping</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dedicated IP per channel</p>
        </div>
      </div>

      {/* CEO AUDIT TRACKER: TEAM MEMBERS AUTHORIZATION & PROXY BALANCE USAGE */}
      {isPrivilegedOwner && (
        <div className="rounded-2xl border border-[#232732] bg-[#161820] p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c4f042]" />
                Team Members Proxy Authorization &amp; Balance Usage Audit
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                CEO exclusive control: Grant proxy purchase permissions to team members, track total balance used in USD, and audit daily limits.
              </p>
            </div>
            {filterUser !== 'all' && (
              <button
                onClick={() => setFilterUser('all')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 w-fit"
              >
                ✕ Clear Member Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((member) => {
              const memberToday = getUserTodayProxyCount(member.id);
              const memberTotal = getUserTotalProxyCount(member.id);
              const memberSpend = getUserProxySpend(member.id);
              const isMemberAuth = member.role === 'SUPER_ADMIN' || member.id === 'user-waqas' || !!member.canBuyProxies;
              const isSelected = filterUser === member.id;

              return (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#c4f042]/10 border-[#c4f042] shadow-[0_0_15px_rgba(196,240,66,0.15)]'
                      : 'bg-[#111317] border-[#232732] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={member.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{member.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[130px] font-mono">{member.email}</p>
                      </div>
                    </div>

                    {/* Toggle Authorization button for Waqas */}
                    {member.role !== 'SUPER_ADMIN' && member.id !== 'user-waqas' ? (
                      <button
                        onClick={() => handleToggleAuth(member.id, isMemberAuth)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                          isMemberAuth
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'
                        }`}
                        title={isMemberAuth ? 'Click to Revoke Proxy Access' : 'Click to Grant Proxy Access'}
                      >
                        {isMemberAuth ? '✓ Authorized' : '+ Authorize'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        CEO Owner
                      </span>
                    )}
                  </div>

                  {/* Member Stats */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-xs pt-2.5 border-t border-slate-800/80">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Today</span>
                      <span
                        className={`font-black text-xs ${
                          memberToday > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {memberToday} / {member.role === 'SUPER_ADMIN' ? '∞' : '1'}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Total Proxies</span>
                      <span className="font-black text-xs text-white">{memberTotal}</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Spent</span>
                      <span className="font-black text-xs text-emerald-400 font-mono">${memberSpend.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 uppercase font-mono">{member.branchId}</span>
                    <button
                      onClick={() => setFilterUser(isSelected ? 'all' : member.id)}
                      className="text-[#c4f042] hover:underline font-semibold"
                    >
                      {isSelected ? 'Showing Proxies' : 'View Proxies →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Proxies Audit Table */}
      <div className="rounded-2xl border border-[#232732] bg-[#161820] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#232732] bg-[#111317] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#c4f042]" />
                Dedicated Proxies Audit &amp; Allocation Logs
              </h2>
              <span className="text-xs text-slate-400">
                Showing {filteredProxies.length} of {visibleProxies.length} proxy records
              </span>
            </div>

            {(searchQuery || filterUser !== 'all' || filterCountry !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterUser('all');
                  setFilterCountry('all');
                  setFilterStatus('all');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
              >
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IP, channel, or user..."
                className="w-full pl-9 pr-3 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#c4f042]/50 text-xs"
              />
            </div>

            {/* Filter by Member (for Waqas / Privileged Owner) */}
            {isPrivilegedOwner && (
              <div>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white focus:outline-none focus:border-[#c4f042]/50 text-xs"
                >
                  <option value="all">All Team Members ({users.length})</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.branchId.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by Country */}
            <div>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white focus:outline-none focus:border-[#c4f042]/50 text-xs"
              >
                <option value="all">All Countries</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white focus:outline-none focus:border-[#c4f042]/50 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="RENEWED">Renewed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111317] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232732]">
              <tr>
                <th className="py-3 px-4 font-bold">Proxy IP &amp; Port</th>
                <th className="py-3 px-3 font-bold">Auth (User:Pass)</th>
                <th className="py-3 px-3 font-bold">Protocol &amp; Country</th>
                <th className="py-3 px-3 font-bold">Assigned Channel</th>
                {isPrivilegedOwner && <th className="py-3 px-3 font-bold">Purchased By</th>}
                <th className="py-3 px-3 font-bold">Status &amp; Expiry</th>
                <th className="py-3 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProxies.length === 0 ? (
                <tr>
                  <td colSpan={isPrivilegedOwner ? 7 : 6} className="py-12 text-center text-slate-400 font-sans">
                    {visibleProxies.length > 0
                      ? 'No proxies match your filter criteria.'
                      : 'No proxies purchased yet. Click "Purchase New Proxy" to acquire a dedicated IP.'}
                  </td>
                </tr>
              ) : (
                filteredProxies.map((proxy) => {
                  const daysLeft = getDaysRemaining(proxy.expiresAt);
                  const isExpiring = daysLeft <= 5 && daysLeft > 0;
                  const isExpired = daysLeft <= 0;
                  const isPassRevealed = !!revealedPasswords[proxy.id];
                  const fullFormat = `${proxy.ip}:${proxy.port}:${proxy.user}:${proxy.pass}`;

                  return (
                    <tr key={proxy.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* IP & Port */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{proxy.ip}:{proxy.port}</span>
                          <button
                            onClick={() => copyToClipboard(`${proxy.ip}:${proxy.port}`, `ip-${proxy.id}`)}
                            className="text-slate-400 hover:text-white"
                            title="Copy IP:Port"
                          >
                            {copiedKey === `ip-${proxy.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-sans">Dedicated Static IP</span>
                      </td>

                      {/* Auth */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300">{proxy.user}</span>
                          <span className="text-slate-500">:</span>
                          <span className="text-amber-300">
                            {isPassRevealed ? proxy.pass : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordReveal(proxy.id)}
                            className="text-slate-500 hover:text-slate-300 ml-1"
                            title={isPassRevealed ? 'Hide Password' : 'Show Password'}
                          >
                            {isPassRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Protocol & Country */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                            {proxy.type.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {proxy.country}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Channel */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div>
                          <span className="font-bold text-emerald-400">{proxy.assignedChannelName}</span>
                          {proxy.assignedChannelUrl && (
                            <a
                              href={proxy.assignedChannelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[10px] text-slate-400 hover:text-white truncate max-w-[160px]"
                            >
                              {proxy.assignedChannelUrl}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Purchased By (CEO View) */}
                      {isPrivilegedOwner && (
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div>
                            <p className="font-bold text-slate-100">{proxy.userName}</p>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">{proxy.branchId}</span>
                          </div>
                        </td>
                      )}

                      {/* Status & Expiry */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border w-fit ${
                              isExpired
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : isExpiring
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {isExpired ? 'Expired' : `${daysLeft} Days Left`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Exp: {proxy.expiresAt.split('T')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => copyToClipboard(fullFormat, `full-${proxy.id}`)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                          title="Copy Full Proxy String (ip:port:user:pass)"
                        >
                          {copiedKey === `full-${proxy.id}` ? '✓ Copied' : 'Copy Full'}
                        </button>
                        <button
                          onClick={() => handleRenew(proxy.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 transition"
                          title="Renew Proxy on Proxy6 (+30 Days)"
                        >
                          Renew (+30d)
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buy Proxy Modal */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Purchase Dedicated Datacenter Proxy
              </h2>
              <button
                onClick={() => setIsBuyModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>{actionError}</div>
              </div>
            )}

            <form onSubmit={handleBuySubmit} className="space-y-4 text-xs">
              {/* Target Channel */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Target YouTube Channel Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  placeholder="e.g. Chosen Code Breakers / Musk Motivation"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Channel URL */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  YouTube Channel Link (URL) <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={selectedChannelUrl}
                  onChange={(e) => setSelectedChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@channelname"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Country Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Proxy Country Location</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code}) - High-Speed Datacenter
                    </option>
                  ))}
                </select>
              </div>

              {/* Protocol */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Proxy Protocol</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType('http')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                      selectedType === 'http'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    HTTP / HTTPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('socks')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                      selectedType === 'socks'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    SOCKS5
                  </button>
                </div>
              </div>

              {/* Policy & Quota notice */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Daily Quota:</span>
                  <span className="text-white font-bold">
                    {todayCount} / {isPrivilegedOwner ? '∞ (Owner Unlimited)' : '1 proxy per 24 hours'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration:</span>
                  <span className="text-emerald-400 font-semibold">30 Days (Renewable)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Allocation:</span>
                  <span className="text-slate-300">Dedicated 1-to-1 IP per YouTube Channel</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLimitReached || isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isLimitReached ? 'Daily Limit Reached' : 'Confirm & Purchase Proxy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
