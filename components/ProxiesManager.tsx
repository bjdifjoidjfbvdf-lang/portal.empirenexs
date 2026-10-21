'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import {
  ProxyRecord,
  ProxyLedgerTransaction,
  UserProxyKhata,
  PROXY_PERIOD_OPTIONS,
  ProxyPeriodOption,
  UserProfile,
} from '@/types';
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
  Receipt,
  DollarSign,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  History,
  CreditCard,
  Calendar,
  FileText,
  ChevronRight,
  X,
  Trash2,
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
    proxyTransactions,
    userKhatas,
    refreshProxies,
    requestProxy,
    renewProxy,
    toggleUserProxyAuthorization,
    recordUserProxyPayment,
    deleteProxyTransaction,
    getUserTodayProxyCount,
    getUserTotalProxyCount,
    getUserProxySpend,
    getUserProxyKhata,
    getUserTransactions,
    channels,
    settings,
  } = useApp();

  // Navigation sub-tab for CEO
  const [activeSubTab, setActiveSubTab] = useState<'proxies' | 'khata'>('proxies');

  // Purchase Modal states
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedChannelUrl, setSelectedChannelUrl] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedType, setSelectedType] = useState<'http' | 'socks'>('http');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(28);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Renew Modal states
  const [renewModalProxy, setRenewModalProxy] = useState<ProxyRecord | null>(null);
  const [renewPeriod, setRenewPeriod] = useState<number>(28);
  const [isRenewing, setIsRenewing] = useState(false);

  // Payment Recording Modal states (CEO only)
  const [paymentModalUser, setPaymentModalUser] = useState<UserProfile | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'PAYMENT_RECEIVED' | 'MANUAL_ADJUSTMENT'>('PAYMENT_RECEIVED');
  const [isDebitAdjustment, setIsDebitAdjustment] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Statement / Khata History Modal states
  const [statementUserId, setStatementUserId] = useState<string | null>(null);

  // General states
  const [isSyncing, setIsSyncing] = useState(false);
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
  const isLimitReached = !isPrivilegedOwner && todayCount >= 1;

  // Data isolation:
  // - Waqas (CEO / Privileged Owner): Sees ALL team members' proxies
  // - Regular team member: Sees ONLY their own purchased proxies
  const visibleProxies = isPrivilegedOwner
    ? proxies
    : proxies.filter((p) => p.userId === currentUser?.id);

  // Current user's personal khata
  const myKhata: UserProxyKhata = getUserProxyKhata(currentUser?.id || '');

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

  // Calculate Organization Total Khata Metrics (CEO view)
  const totalTeamCharges = Math.round(userKhatas.reduce((s, k) => s + (k.totalCharged || 0), 0) * 100) / 100;
  const totalTeamPaid = Math.round(userKhatas.reduce((s, k) => s + (k.totalPaid || 0), 0) * 100) / 100;
  const totalTeamBalanceDue = Math.round((totalTeamCharges - totalTeamPaid) * 100) / 100;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  };

  // Handle Buy Submit
  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!selectedChannel.trim()) {
      setActionError('Target YouTube channel name is required.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestProxy(selectedChannel, selectedChannelUrl, selectedCountry, selectedType, selectedPeriod);
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

  // Handle Renew Submit
  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModalProxy) return;

    setActionError(null);
    setIsRenewing(true);
    const res = await renewProxy(renewModalProxy.id, renewPeriod);
    setIsRenewing(false);

    if (!res.success) {
      setActionError(res.message);
    } else {
      setActionSuccess(res.message);
      setRenewModalProxy(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Payment Submit (Waqas Gill only)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalUser) return;

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setActionError('Valid amount is required.');
      return;
    }

    setIsRecordingPayment(true);
    const res = await recordUserProxyPayment(
      paymentModalUser.id,
      amountNum,
      paymentType,
      paymentMethod,
      paymentNotes,
      isDebitAdjustment
    );
    setIsRecordingPayment(false);

    if (!res.success) {
      setActionError(res.message);
    } else {
      setActionSuccess(res.message);
      setPaymentModalUser(null);
      setPaymentAmount('');
      setPaymentNotes('');
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

  // Selected statement transactions & user details
  const activeStatementUser = users.find((u) => u.id === statementUserId);
  const activeStatementTx = statementUserId ? getUserTransactions(statementUserId) : [];
  const activeStatementKhata = statementUserId ? getUserProxyKhata(statementUserId) : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#c4f042]" />
              Dedicated Proxies &amp; IPs Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#c4f042]/15 text-[#c4f042] border border-[#c4f042]/30">
              Dedicated IPv4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated static IPv4 datacenter proxies for YouTube channel operations with duration plans, renew extensions, and complete per-user billing ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Balance (visible ONLY to Waqas / Super Admin) */}
          {isPrivilegedOwner && (
            <div className="flex items-center gap-1.5">
              <div className="px-3.5 py-2 rounded-xl bg-[#161820] border border-[#232732] text-xs flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Provider Balance:</span>
                <span className="font-bold text-emerald-300 font-mono">
                  ${(settings.proxyBalance || 4.10).toFixed(2)} USD
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setIsSyncing(true);
                  await refreshProxies();
                  setIsSyncing(false);
                }}
                disabled={isSyncing}
                className="p-2 rounded-xl bg-[#161820] hover:bg-[#1f232e] border border-[#232732] text-slate-400 hover:text-white transition disabled:opacity-50"
                title="Sync Live Balance & Active Dedicated IPs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#c4f042]' : ''}`} />
              </button>
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
                Your account is currently not authorized to purchase dedicated proxies. Authorization from Founder &amp; CEO <strong>Waqas Gill</strong> is required to purchase dedicated IPs.
              </p>
              <p className="text-xs text-slate-400">
                Please contact Waqas Gill on official WhatsApp to request authorization:
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://wa.me/923075203713?text=Hello%20Waqas,%20I%20would%20like%20to%20request%20proxy%20purchase%20authorization%20on%20the%20portal."
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

      {/* USER'S PERSONAL BILLING & LEDGER CARD (Visible to regular members) */}
      {!isPrivilegedOwner && isAuthorized && (
        <div className="rounded-2xl border border-[#232732] bg-[#161820] p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4f042] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>My Billing Account &amp; Ledger</span>
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Billing &amp; Payment Statement for {currentUser?.name}
              </h3>
              <p className="text-xs text-slate-400">
                Proxy purchases and renewals are charged directly to your account. Payments submitted to management update your balance automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatementUserId(currentUser?.id || null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1e222c] hover:bg-[#282d3b] text-slate-200 border border-[#2f3545] transition flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4 text-[#c4f042]" />
                <span>View Account Statement</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#232732]">
            <div className="bg-[#111317] p-3 rounded-xl border border-[#232732]">
              <span className="text-[10px] font-semibold text-slate-400 block">Total Proxies</span>
              <span className="text-lg font-bold text-white font-mono">{myKhata.totalProxiesBought}</span>
              <span className="text-[10px] text-slate-500 block">({myKhata.activeProxiesCount} Active)</span>
            </div>

            <div className="bg-[#111317] p-3 rounded-xl border border-[#232732]">
              <span className="text-[10px] font-semibold text-slate-400 block">Total Charges</span>
              <span className="text-lg font-bold text-white font-mono">${myKhata.totalCharged.toFixed(2)}</span>
              <span className="text-[10px] text-slate-500 block">Purchases &amp; Renewals</span>
            </div>

            <div className="bg-[#111317] p-3 rounded-xl border border-[#232732]">
              <span className="text-[10px] font-semibold text-slate-400 block">Total Paid</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">${myKhata.totalPaid.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-500/70 block">Received by Waqas</span>
            </div>

            <div className={`p-3 rounded-xl border ${
              myKhata.balanceDue > 0
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                : myKhata.balanceDue < 0
                ? 'bg-blue-950/20 border-blue-500/40 text-blue-300'
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            }`}>
              <span className="text-[10px] font-semibold block opacity-80">
                {myKhata.balanceDue > 0 ? 'Outstanding Due' : myKhata.balanceDue < 0 ? 'Advance Credit' : 'Account Settled'}
              </span>
              <span className="text-lg font-black font-mono">
                ${Math.abs(myKhata.balanceDue).toFixed(2)}
              </span>
              <span className="text-[10px] block opacity-80">
                {myKhata.balanceDue > 0 ? 'Due to Management' : myKhata.balanceDue < 0 ? 'Credit with Management' : 'Fully Settled ($0.00)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CEO TOP NAVIGATION SUB-TABS (Waqas Gill Only) */}
      {isPrivilegedOwner && (
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#161820] border border-[#232732] w-fit">
          <button
            onClick={() => setActiveSubTab('proxies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'proxies'
                ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_15px_rgba(196,240,66,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Dedicated Proxies List ({visibleProxies.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('khata')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'khata'
                ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_15px_rgba(196,240,66,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Team Billing &amp; Balance Ledger ({userKhatas.length} Members)</span>
            {totalTeamBalanceDue > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                ${totalTeamBalanceDue.toFixed(2)} Due
              </span>
            )}
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: PROXIES TABLE & FILTERS
         ========================================================================= */}
      {activeSubTab === 'proxies' && (
        <>
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

            {/* Network Route */}
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Network Route</span>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">Private Datacenter</span>
                <span className="text-xs text-emerald-400 font-semibold">• Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">3d, 7d, 14d, 28d Duration Plans</p>
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

          {/* Search & Filter Bar */}
          <div className="rounded-2xl border border-[#232732] bg-[#161820] p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by IP, port, channel name, member name, or country..."
                  className="w-full pl-9 pr-4 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#c4f042]/50 text-xs"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                {isPrivilegedOwner && (
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="px-3 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white focus:outline-none focus:border-[#c4f042]/50 text-xs"
                  >
                    <option value="all">All Members ({users.length})</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.branchId.toUpperCase()})
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="px-3 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white focus:outline-none focus:border-[#c4f042]/50 text-xs"
                >
                  <option value="all">All Locations</option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-[#0d0f13] border border-[#232732] rounded-xl text-white focus:outline-none focus:border-[#c4f042]/50 text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Proxies Table */}
          <div className="rounded-2xl border border-[#232732] bg-[#161820] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#232732] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#c4f042]" />
                <span>
                  {isPrivilegedOwner ? 'Organization Proxies Directory' : 'My Dedicated Proxies'}
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  ({filteredProxies.length} found)
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111317] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232732]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Proxy IP &amp; Port</th>
                    <th className="py-3 px-3 font-bold">Auth (User:Pass)</th>
                    <th className="py-3 px-3 font-bold">Protocol &amp; Country</th>
                    <th className="py-3 px-3 font-bold">Assigned Channel</th>
                    <th className="py-3 px-3 font-bold">Plan &amp; Rate</th>
                    {isPrivilegedOwner && <th className="py-3 px-3 font-bold">Purchased By</th>}
                    <th className="py-3 px-3 font-bold">Status &amp; Expiry</th>
                    <th className="py-3 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredProxies.length === 0 ? (
                    <tr>
                      <td colSpan={isPrivilegedOwner ? 8 : 7} className="py-12 text-center text-slate-400 font-sans">
                        {visibleProxies.length > 0
                          ? 'No proxies match your filter criteria.'
                          : 'No proxies purchased yet. Click "Purchase New Proxy" to acquire a dedicated IP.'}
                      </td>
                    </tr>
                  ) : (
                    filteredProxies.map((proxy) => {
                      const daysLeft = getDaysRemaining(proxy.expiresAt);
                      const isExpiring = daysLeft <= 3 && daysLeft > 0;
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
                                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                                >
                                  <span>Channel Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Plan & Rate */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c4f042]/10 text-[#c4f042] border border-[#c4f042]/30 inline-block font-mono">
                                {proxy.periodDays || 28} Days • ${Number(proxy.costUsd || 2.00).toFixed(2)}
                              </span>
                              {proxy.renewCount && proxy.renewCount > 0 ? (
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  Renewed {proxy.renewCount}x
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* Purchased By (CEO view) */}
                          {isPrivilegedOwner && (
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div>
                                <span className="font-semibold text-white block text-xs">{proxy.userName}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-mono">{proxy.branchId}</span>
                              </div>
                            </td>
                          )}

                          {/* Status & Expiry */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                  isExpired
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : isExpiring
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {isExpired ? 'Expired' : isExpiring ? `Expiring (${daysLeft}d)` : `Active (${daysLeft}d left)`}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                                {new Date(proxy.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 whitespace-nowrap text-right space-x-1.5">
                            <button
                              onClick={() => copyToClipboard(fullFormat, `full-${proxy.id}`)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                              title="Copy full format: ip:port:user:pass"
                            >
                              {copiedKey === `full-${proxy.id}` ? '✓ Copied' : 'Copy Full'}
                            </button>

                            {/* Renew Button with Duration Selector */}
                            <button
                              onClick={() => {
                                setRenewModalProxy(proxy);
                                setRenewPeriod(proxy.periodDays || 28);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#c4f042]/15 hover:bg-[#c4f042]/25 text-[#c4f042] border border-[#c4f042]/30 transition"
                              title="Renew Dedicated IP (Choose 3d, 7d, 14d, 28d)"
                            >
                              + Renew
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
        </>
      )}

      {/* =========================================================================
          VIEW 2: CEO BILLING & BALANCE LEDGER
         ========================================================================= */}
      {isPrivilegedOwner && activeSubTab === 'khata' && (
        <div className="space-y-6">
          {/* Organization Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#232732] bg-[#161820] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Team Charges</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">${totalTeamCharges.toFixed(2)}</span>
                <span className="text-xs text-slate-400">USD</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">All proxy purchases &amp; renewals across branches</p>
            </div>

            <div className="rounded-2xl border border-[#232732] bg-[#161820] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Payments Received</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">${totalTeamPaid.toFixed(2)}</span>
                <span className="text-xs text-slate-400">USD</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Collected from members via Cash, Easypaisa, JazzCash</p>
            </div>

            <div className={`rounded-2xl border p-5 shadow-xl ${
              totalTeamBalanceDue > 0
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold opacity-80">Total Outstanding Dues</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono">${totalTeamBalanceDue.toFixed(2)}</span>
                <span className="text-xs opacity-80">USD Due</span>
              </div>
              <p className="text-[11px] opacity-80 mt-1">
                {totalTeamBalanceDue > 0
                  ? 'Total pending amount to be collected from team members'
                  : 'All team accounts are fully settled!'}
              </p>
            </div>
          </div>

          {/* Members Billing Table */}
          <div className="rounded-2xl border border-[#232732] bg-[#161820] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#232732] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#c4f042]" />
                  <span>Team Member Billing Accounts &amp; Ledgers</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record cash/online payments received from employees, make balance adjustments (+ / -), and audit individual statements.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111317] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232732]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Team Member</th>
                    <th className="py-3 px-3 font-bold">Branch &amp; Role</th>
                    <th className="py-3 px-3 font-bold">Proxy Access</th>
                    <th className="py-3 px-3 font-bold">Total Proxies</th>
                    <th className="py-3 px-3 font-bold">Total Charges</th>
                    <th className="py-3 px-3 font-bold">Total Paid</th>
                    <th className="py-3 px-3 font-bold">Balance Due</th>
                    <th className="py-3 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {userKhatas.map((khata) => {
                    const memberUser = users.find((u) => u.id === khata.userId);
                    const isMemberAuth = memberUser?.role === 'SUPER_ADMIN' || memberUser?.id === 'user-waqas' || !!memberUser?.canBuyProxies;
                    const isDue = khata.balanceDue > 0;
                    const isAdvance = khata.balanceDue < 0;

                    return (
                      <tr key={khata.userId} className="hover:bg-slate-900/40 transition-colors">
                        {/* Member */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={memberUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={khata.userName}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <span className="font-bold text-white text-xs block">{khata.userName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{khata.userEmail}</span>
                            </div>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                            {khata.branchId}
                          </span>
                        </td>

                        {/* Proxy Access */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {memberUser?.role !== 'SUPER_ADMIN' && memberUser?.id !== 'user-waqas' ? (
                            <button
                              onClick={() => handleToggleAuth(khata.userId, isMemberAuth)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                isMemberAuth
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'
                              }`}
                              title={isMemberAuth ? 'Click to Revoke' : 'Click to Grant'}
                            >
                              {isMemberAuth ? '✓ Authorized' : '+ Authorize'}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              CEO Owner
                            </span>
                          )}
                        </td>

                        {/* Total Proxies */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-xs">
                          <span className="text-white font-bold">{khata.totalProxiesBought}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({khata.activeProxiesCount} active)</span>
                        </td>

                        {/* Total Charges */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-xs text-white">
                          ${khata.totalCharged.toFixed(2)}
                        </td>

                        {/* Total Paid */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-xs text-emerald-400 font-bold">
                          ${khata.totalPaid.toFixed(2)}
                        </td>

                        {/* Net Balance Due */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-xs">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-black inline-block ${
                              isDue
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isAdvance
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isDue
                              ? `Due: $${khata.balanceDue.toFixed(2)}`
                              : isAdvance
                              ? `Credit: +$${Math.abs(khata.balanceDue).toFixed(2)}`
                              : 'Settled ($0.00)'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 whitespace-nowrap text-right space-x-1.5">
                          {/* Record Payment Button */}
                          <button
                            onClick={() => {
                              if (memberUser) {
                                setPaymentModalUser(memberUser);
                                setPaymentAmount('');
                                setPaymentType('PAYMENT_RECEIVED');
                                setIsDebitAdjustment(false);
                                setPaymentMethod('CASH');
                                setPaymentNotes('');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
                            title="Record Payment from Employee"
                          >
                            + Record Payment
                          </button>

                          {/* View Statement Button */}
                          <button
                            onClick={() => setStatementUserId(khata.userId)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                            title="View Account Statement"
                          >
                            Statement →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: PURCHASE PROXY MODAL (WITH 3d, 7d, 14d, 28d DURATION PLANS)
         ========================================================================= */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161820] border border-[#232732] rounded-3xl p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-[#c4f042]/10 text-[#c4f042]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Purchase Dedicated Static Proxy</h3>
                  <p className="text-[11px] text-slate-400">Provision a high-speed private datacenter IPv4 address</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBuySubmit} className="space-y-4">
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#c4f042]"
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#c4f042]"
                />
              </div>

              {/* DURATION PLAN SELECTOR (3 Days, 7 Days, 14 Days, 28 Days) */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Select Proxy Duration &amp; Plan:</span>
                  <span className="text-[10px] text-[#c4f042] font-mono">Billed to your Account</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROXY_PERIOD_OPTIONS.map((opt) => {
                    const isSelected = selectedPeriod === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setSelectedPeriod(opt.days)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#c4f042]/15 border-[#c4f042] text-white shadow-[0_0_15px_rgba(196,240,66,0.25)]'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className={`text-base font-black font-mono block mt-1 ${isSelected ? 'text-[#c4f042]' : 'text-slate-200'}`}>
                          ${opt.priceUsd.toFixed(2)}
                        </span>
                        <span className="text-[9px] block text-slate-500 mt-0.5 font-mono">
                          ${(opt.priceUsd / opt.days).toFixed(3)}/day
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Location / Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#c4f042]"
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
                <label className="block font-semibold text-slate-300 mb-1">Protocol</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType('http')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                      selectedType === 'http'
                        ? 'bg-[#c4f042]/20 text-[#c4f042] border-[#c4f042]/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    HTTP / HTTPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('socks')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                      selectedType === 'socks'
                        ? 'bg-[#c4f042]/20 text-[#c4f042] border-[#c4f042]/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    SOCKS5
                  </button>
                </div>
              </div>

              {/* Summary note */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Duration:</span>
                  <span className="text-white font-bold">{selectedPeriod} Days</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Price (Account Billing):</span>
                  <span className="text-[#c4f042] font-black text-xs font-mono">
                    ${(PROXY_PERIOD_OPTIONS.find((p) => p.days === selectedPeriod)?.priceUsd || 2.00).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Daily Quota:</span>
                  <span className="text-white font-bold">
                    {todayCount} / {isPrivilegedOwner ? '∞ (Owner Unlimited)' : '1 proxy per 24 hours'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLimitReached || isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#c4f042] hover:bg-[#b4eb28] disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-[#c4f042]/20 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isLimitReached ? 'Daily Limit Reached' : 'Confirm & Purchase Proxy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: RENEW PROXY MODAL (WITH 3d, 7d, 14d, 28d DURATION PLANS)
         ========================================================================= */}
      {renewModalProxy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161820] border border-[#232732] rounded-3xl p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-[#c4f042]/10 text-[#c4f042]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Renew Dedicated Proxy</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{renewModalProxy.ip}:{renewModalProxy.port}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRenewModalProxy(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Channel:</span>
                  <span className="font-bold text-white">{renewModalProxy.assignedChannelName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Expiry:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(renewModalProxy.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* RENEW DURATION SELECTOR */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Choose Extension Period:</span>
                  <span className="text-[10px] text-[#c4f042] font-mono">Billed to your Account</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROXY_PERIOD_OPTIONS.map((opt) => {
                    const isSelected = renewPeriod === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setRenewPeriod(opt.days)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#c4f042]/15 border-[#c4f042] text-white shadow-[0_0_15px_rgba(196,240,66,0.25)]'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className={`text-base font-black font-mono block mt-1 ${isSelected ? 'text-[#c4f042]' : 'text-slate-200'}`}>
                          ${opt.priceUsd.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Extension Days:</span>
                  <span className="text-white font-bold">+{renewPeriod} Days</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Renewal Rate:</span>
                  <span className="text-[#c4f042] font-black font-mono">
                    ${(PROXY_PERIOD_OPTIONS.find((p) => p.days === renewPeriod)?.priceUsd || 2.00).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenewModalProxy(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenewing}
                  className="px-5 py-2 rounded-lg bg-[#c4f042] hover:bg-[#b4eb28] disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-[#c4f042]/20 flex items-center gap-2"
                >
                  {isRenewing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Renewal (+{renewPeriod} Days)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CEO RECORD PAYMENT MODAL (Payments & Manual Adjustments)
         ========================================================================= */}
      {paymentModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161820] border border-[#232732] rounded-3xl p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Member Payment / Ledger Adjustment</h3>
                  <p className="text-[11px] text-slate-400">{paymentModalUser.name} ({paymentModalUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Transaction Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('PAYMENT_RECEIVED');
                      setIsDebitAdjustment(false);
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition text-center ${
                      paymentType === 'PAYMENT_RECEIVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Payment Received
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('MANUAL_ADJUSTMENT')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition text-center ${
                      paymentType === 'MANUAL_ADJUSTMENT'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Adjustment (+ / -)
                  </button>
                </div>
              </div>

              {/* Adjustment Mode (if Manual Adjustment) */}
              {paymentType === 'MANUAL_ADJUSTMENT' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Adjustment Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDebitAdjustment(true)}
                      className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold ${
                        isDebitAdjustment
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      + Add Charge (Increase Dues)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDebitAdjustment(false)}
                      className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold ${
                        !isDebitAdjustment
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      - Credit Balance (Reduce Dues)
                    </button>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Amount in USD ($) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 5.00"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              {paymentType === 'PAYMENT_RECEIVED' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Method / Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CASH">Cash in Hand</option>
                    <option value="EASYPAISA">Easypaisa</option>
                    <option value="JAZZCASH">JazzCash</option>
                    <option value="BANK_TRANSFER">Bank Transfer (HBL / Meezan / UBL)</option>
                    <option value="OTHER">Other / Salary Deduction</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received via JazzCash from Abid for 2 proxies"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalUser(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
                >
                  {isRecordingPayment && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Payment Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: COMPLETE KHATA STATEMENT / INVOICE MODAL
         ========================================================================= */}
      {statementUserId && activeStatementUser && activeStatementKhata && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#161820] border border-[#232732] rounded-3xl p-6 shadow-2xl relative text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-[#232732] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#c4f042]/10 text-[#c4f042]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Account Statement &amp; Transaction Ledger</h3>
                  <p className="text-[11px] text-slate-400">{activeStatementUser.name} • {activeStatementUser.branchId.toUpperCase()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatementUserId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Summary Banner */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-[#111317] p-2.5 rounded-xl border border-[#232732]">
                <span className="text-[10px] text-slate-400 block">Total Charges</span>
                <span className="text-base font-bold text-white font-mono">${activeStatementKhata.totalCharged.toFixed(2)}</span>
              </div>
              <div className="bg-[#111317] p-2.5 rounded-xl border border-[#232732]">
                <span className="text-[10px] text-slate-400 block">Total Paid</span>
                <span className="text-base font-bold text-emerald-400 font-mono">${activeStatementKhata.totalPaid.toFixed(2)}</span>
              </div>
              <div className={`p-2.5 rounded-xl border font-mono ${
                activeStatementKhata.balanceDue > 0
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              }`}>
                <span className="text-[10px] block opacity-80">
                  {activeStatementKhata.balanceDue > 0 ? 'Balance Due' : 'Fully Settled'}
                </span>
                <span className="text-base font-black">${Math.abs(activeStatementKhata.balanceDue).toFixed(2)}</span>
              </div>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activeStatementTx.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No billing transactions recorded for this member yet.
                </div>
              ) : (
                activeStatementTx.map((tx) => {
                  const isPayment = tx.type === 'PAYMENT_RECEIVED';
                  const isPurchase = tx.type === 'PROXY_PURCHASE';
                  const isRenewal = tx.type === 'PROXY_RENEWAL';

                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-[#111317] border border-[#232732] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isPayment
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isPurchase
                              ? 'bg-[#c4f042]/10 text-[#c4f042]'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {isPayment ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{tx.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="text-slate-500">By {tx.recordedBy}</span>
                            {tx.notes && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 italic font-sans">&quot;{tx.notes}&quot;</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isPayment ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {isPayment ? `-${tx.paidAmount.toFixed(2)}` : `+${tx.chargeAmount.toFixed(2)}`} USD
                          </span>
                          <span className="text-[9px] text-slate-500 block uppercase font-mono">
                            {isPayment ? 'Payment' : 'Charge'}
                          </span>
                        </div>

                        {/* CEO Delete / Reversal option */}
                        {isPrivilegedOwner && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm('Are you sure you want to remove this transaction from the ledger?')) {
                                await deleteProxyTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete / Reverse Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-[#232732] flex justify-end">
              <button
                type="button"
                onClick={() => setStatementUserId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
