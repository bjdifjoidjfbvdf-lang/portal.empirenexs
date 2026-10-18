'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import {
  Smartphone,
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
} from 'lucide-react';

export const OTPManager: React.FC = () => {
  const {
    currentUser,
    otpOrders,
    requestPhoneOTP,
    cancelOTPOrder,
    getUserTodayOTPCount,
    getUserTotalOTPCount,
    getChannelExistingNumber,
    channels,
    settings,
    updateSettings,
  } = useApp();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedChannelUrl, setSelectedChannelUrl] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Philippines (+63)');
  const [selectedProvider, setSelectedProvider] = useState<'Hero-SMS'>('Hero-SMS');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRemainingCountdown = (expiresAt: number) => {
    const diffSec = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const todayCount = getUserTodayOTPCount(currentUser?.id || '');
  const totalCount = getUserTotalOTPCount(currentUser?.id || '');
  const isPrivilegedOwner =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'CO_FOUNDER' ||
    currentUser?.role === 'BRANCH_HEAD';
  const isLimitReached = !isPrivilegedOwner && todayCount >= settings.dailyNumberLimitPerUser;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    if (!selectedChannel.trim()) {
      setRequestError('Channel name is required.');
      return;
    }

    if (!selectedChannelUrl.trim()) {
      setRequestError('Channel YouTube Link (URL) is required.');
      return;
    }

    const res = await requestPhoneOTP(selectedChannel, selectedChannelUrl, 'Philippines (+63)', 'Hero-SMS');
    if (!res.success) {
      setRequestError(res.message);
    } else {
      setIsRequestModalOpen(false);
      setSelectedChannel('');
      setSelectedChannelUrl('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-[#c4f042]" />
              Phone Numbers &amp; OTP Verification Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#c4f042]/15 text-[#c4f042] border border-[#c4f042]/30">
              Automated SMS API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            YouTube phone verification service with strict tracking: 1 number/day per user, zero duplicate numbers per channel, and complete per-user audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SMS Balance visible ONLY to Team Owners and Super Admin Waqas Gill */}
          {isPrivilegedOwner && (
            <div className="px-3.5 py-2 rounded-xl bg-[#161820] border border-[#232732] text-xs flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">SMS Balance:</span>
              <span className="font-bold text-amber-300 font-mono">
                ${settings.smsBalance.toFixed(2)}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              setRequestError(null);
              setIsRequestModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#c4f042] hover:bg-[#b4eb28] text-[#0d1505] shadow-[0_0_20px_rgba(196,240,66,0.3)] transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Request OTP Number</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Numbers Purchased</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{otpOrders.length}</span>
            <span className="text-xs text-slate-400">Across 3 Branches</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">All-time OTP allocations</p>
        </div>

        {/* Your Daily Usage */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Daily Quota Status</span>
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
              {todayCount} / {isPrivilegedOwner ? '∞' : settings.dailyNumberLimitPerUser}
            </span>
            <span
              className={`text-xs font-bold ${
                isLimitReached ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isPrivilegedOwner ? 'Unlimited (Owner)' : isLimitReached ? 'Quota Used' : 'Quota Available'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {currentUser?.name || 'Creator'} • Quota only locks when OTP code arrives
          </p>
        </div>

        {/* Active Provider */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Connected Provider</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{settings.smsProvider}</span>
            <span className="text-xs text-emerald-400 font-semibold">• Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct Carrier Dedicated Delivery</p>
        </div>

        {/* Channels Linked */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Unique Channels Verified</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {new Set(otpOrders.map((o) => o.channelName.toLowerCase())).size}
            </span>
            <span className="text-xs text-amber-400 font-semibold">Zero Duplicates</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Directly synced to sheet</p>
        </div>
      </div>

      {/* Rules Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-200">
              Strict Verification Protocols Enforced:
            </p>
            <p className="text-slate-400 text-[11px]">
              1️⃣ Channel name &amp; link required • 2️⃣ 5-minute timer (auto-cancel &amp; auto-refund) • 3️⃣ Quota only locks when OTP code arrives • 4️⃣ Duplicate channels blocked.
            </p>
          </div>
        </div>

        {currentUser?.role === 'SUPER_ADMIN' && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Founder Override Active
            </span>
          </div>
        )}
      </div>

      {/* Complete OTP Allocations History Table */}
      <div className="rounded-2xl border border-[#232732] bg-[#161820] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#232732] bg-[#111317] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#c4f042]" />
            Per-User Purchase History &amp; OTP Logs
          </h2>
          <span className="text-xs text-slate-400">
            Showing all {otpOrders.length} order records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111317] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232732]">
              <tr>
                <th className="py-3 px-4 font-bold">Team Member (User)</th>
                <th className="py-3 px-3 font-bold">Branch</th>
                <th className="py-3 px-3 font-bold">Channel Name</th>
                <th className="py-3 px-3 font-bold">Phone Number</th>
                <th className="py-3 px-3 font-bold">Country &amp; Provider</th>
                <th className="py-3 px-3 font-bold">OTP Code</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold">Purchased At</th>
                <th className="py-3 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {otpOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    No OTP orders found. When a team member requests a number, the live audit log will appear here.
                  </td>
                </tr>
              ) : (
                otpOrders.map((order) => {
                const isPending = order.status === 'PENDING_OTP';
                const isCompleted = order.status === 'COMPLETED';

                return (
                  <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* User */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-slate-100">{order.userName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{order.userEmail}</p>
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {(order.branchId || 'musafirkhana').toUpperCase()}
                      </span>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>
                        <span className="font-bold text-emerald-400">{order.channelName}</span>
                        {order.channelUrl && (
                          <a
                            href={order.channelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[10px] text-slate-400 hover:text-white truncate max-w-[170px]"
                            title={order.channelUrl}
                          >
                            {order.channelUrl}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{order.phoneNumber}</span>
                        <button
                          onClick={() => copyToClipboard(order.phoneNumber, `phone-${order.id}`)}
                          className="text-slate-400 hover:text-white"
                          title="Copy Phone Number"
                        >
                          {copiedKey === `phone-${order.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Country & Provider */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>
                        <p className="text-slate-300">{order.country}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{order.provider}</span>
                      </div>
                    </td>

                    {/* OTP Code */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      {order.otpCode ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded font-black text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 text-sm">
                            {order.otpCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.otpCode!, `otp-${order.id}`)}
                            className="text-slate-400 hover:text-emerald-400"
                            title="Copy OTP Code"
                          >
                            {copiedKey === `otp-${order.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : isPending ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Waiting SMS...
                          </span>
                          {order.expiresAt && (
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit flex items-center gap-1">
                              <span>⏱</span>
                              <span>{formatRemainingCountdown(order.expiresAt)}</span>
                              <span className="text-[9px] text-amber-400/70 font-sans font-normal">(Auto-Refund)</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                            : order.status === 'EXPIRED'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : order.status === 'CANCELLED'
                            ? 'bg-slate-700/50 text-slate-400 border-slate-600/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {order.status === 'EXPIRED' ? 'Expired & Refunded' : order.status === 'CANCELLED' ? 'Cancelled & Refunded' : order.status}
                      </span>
                    </td>

                    {/* Purchased At */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {order.createdAt}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isPending && (
                        <button
                          onClick={() => cancelOTPOrder(order.id)}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition"
                        >
                          Cancel / Refund
                        </button>
                      )}
                      {isCompleted && (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                        </span>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Number Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                Request YouTube Verification Number
              </h2>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {requestError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>{requestError}</div>
              </div>
            )}

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  YouTube Channel Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Tech Documentaries"
                  value={selectedChannel}
                  onChange={(e) => {
                    setSelectedChannel(e.target.value);
                    setRequestError(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  YouTube Channel Link (URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/@apextechdoc"
                  value={selectedChannelUrl}
                  onChange={(e) => {
                    setSelectedChannelUrl(e.target.value);
                    setRequestError(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Strict Rule: Both Channel Name and Channel Link must be unique. Duplicate numbers are blocked.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Service</label>
                <div className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-emerald-400 font-semibold text-xs flex items-center justify-between">
                  <span>Google / YouTube / Gmail (service: go)</span>
                  <span className="text-[10px] text-slate-400">Fixed</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">SMS Provider &amp; Country</label>
                <div className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-100">Hero-SMS (hero-sms.com)</span>
                    <span className="text-slate-400 text-[11px] block">Country: Philippines (+63)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 mt-1">
                  ✓ Rule: Automatically selecting Philippines (+63) for optimal YouTube verification delivery.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Daily Usage Limit:</span>
                  <span className="text-white font-bold">{todayCount} / {isPrivilegedOwner ? '∞ (Owner Unlimited)' : `${settings.dailyNumberLimitPerUser} used today`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Waiting Timeout:</span>
                  <span className="text-emerald-400 font-semibold">5 Minutes (300s Live Countdown)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Quota &amp; Refund Rule:</span>
                  <span className="text-slate-300 text-right">If no OTP arrives in 5 mins, order is cancelled &amp; daily limit is NOT consumed!</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLimitReached}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20"
                >
                  {isLimitReached ? 'Daily Limit Reached' : 'Confirm & Buy Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
