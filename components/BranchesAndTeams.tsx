'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import { BRANCHES } from '@/lib/initialData';
import { BranchId, UserRole } from '@/types';
import {
  Users,
  Shield,
  Building,
  Mail,
  MapPin,
  Youtube,
  Film,
  Award,
  CheckCircle,
  Plus,
  Phone,
  AtSign,
  User,
  Lock,
  Unlock,
  Trash2,
  Ban,
  Briefcase,
  AlertCircle,
  BarChart3,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { BranchComparisonAnalytics } from './BranchComparisonAnalytics';
import { UserProfile } from '@/types';

export const BranchesAndTeams: React.FC = () => {
  const {
    channels,
    availableUsers,
    setCurrentUser,
    currentUser,
    pendingUsers,
    approveUser,
    rejectUser,
    restrictUser,
    unrestrictUser,
    deleteUser,
    directCreateUser,
    updateMemberGoogleSheet,
    syncMemberSheetChannels,
    pushUserChannelsToSheet,
  } = useApp();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserBranch, setNewUserBranch] = useState<BranchId>('bahawalpur');
  const [newUserRole, setNewUserRole] = useState<UserRole>('TEAM_MEMBER');
  const [newUserDesignation, setNewUserDesignation] = useState('Senior Video Editor');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'comparison'>('members');

  // Google Sheet Attachment Modal & Sync States (Option 1)
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [selectedUserForSheet, setSelectedUserForSheet] = useState<UserProfile | null>(null);
  const [sheetInputUrl, setSheetInputUrl] = useState('');
  const [webhookInputUrl, setWebhookInputUrl] = useState('');
  const [syncingUserId, setSyncingUserId] = useState<string | null>(null);
  const [isSavingSheet, setIsSavingSheet] = useState(false);
  const [isPushingChannels, setIsPushingChannels] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [sheetFeedback, setSheetFeedback] = useState<string | null>(null);

  const openSheetModal = (u: UserProfile) => {
    setSelectedUserForSheet(u);
    setSheetInputUrl(u.personalGoogleSheetUrl || '');
    setWebhookInputUrl(u.personalGoogleSheetWebhookUrl || '');
    setSheetFeedback(null);
    setIsSheetModalOpen(true);
  };

  const copyAppsScriptCode = () => {
    const code = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date().toLocaleDateString(),
    data.channelName || '',
    data.channelUrl || '',
    data.niche || '',
    data.status || 'Active',
    data.managedBy || '',
    data.branchId || '',
    data.email || '',
    data.createdNumber || '',
    data.notes || ''
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}`;
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSaveAndSyncSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForSheet) return;
    setIsSavingSheet(true);
    setSheetFeedback(null);

    const cleanUrl = sheetInputUrl.trim();
    const cleanWebhook = webhookInputUrl.trim();
    if (!cleanUrl) {
      setSheetFeedback('Please enter a Google Sheet URL.');
      setIsSavingSheet(false);
      return;
    }

    try {
      await updateMemberGoogleSheet(selectedUserForSheet.id, cleanUrl, cleanWebhook);
      const syncRes = await syncMemberSheetChannels(selectedUserForSheet.id, cleanUrl);
      if (syncRes.success) {
        alert(syncRes.message);
        setIsSheetModalOpen(false);
      } else {
        setSheetFeedback(syncRes.message);
      }
    } catch (err: any) {
      setSheetFeedback(err?.message || 'Failed to sync Google Sheet');
    } finally {
      setIsSavingSheet(false);
    }
  };

  const handleQuickSyncMember = async (userId: string) => {
    setSyncingUserId(userId);
    try {
      const res = await syncMemberSheetChannels(userId);
      alert(res.message);
    } finally {
      setSyncingUserId(null);
    }
  };

  const handlePushChannelsToSheet = async (userId: string) => {
    setIsPushingChannels(true);
    try {
      const res = await pushUserChannelsToSheet(userId);
      alert(res.message);
    } finally {
      setIsPushingChannels(false);
    }
  };

  const isWaqasCeo =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.id === 'user-waqas' ||
    currentUser?.email === 'muhammadwaqasmwg@gmail.com' ||
    currentUser?.email === 'waqas@empirenexs.com' ||
    currentUser?.username === 'waqasgill';

  const handleCreateDirectUser = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);

    if (!newUserName.trim() || !newUserUsername.trim() || !newUserEmail.trim() || !newUserPass.trim()) {
      setModalFeedback('Full Name, Username, Gmail, and Password are required.');
      return;
    }

    const res = directCreateUser({
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      email: newUserEmail.trim(),
      password: newUserPass,
      phone: newUserPhone.trim(),
      address: newUserAddress.trim(),
      branchId: newUserBranch,
      role: newUserRole,
      designation: newUserDesignation,
    });

    if (res.success) {
      alert(res.message);
      setIsAddUserModalOpen(false);
      // Reset
      setNewUserName('');
      setNewUserUsername('');
      setNewUserEmail('');
      setNewUserPass('');
      setNewUserPhone('');
      setNewUserAddress('');
    } else {
      setModalFeedback(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-emerald-400" />
              Branches &amp; Team Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              3 Hubs Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Founder &amp; CEO: <strong>Waqas Gill</strong> (HQ Musafirkhana) • Co-Founders: <strong>Saim Chaudhry</strong> (Bahawalpur), <strong>Zainab Akhtar</strong> (Rahim Yar Khan).
          </p>
        </div>

        {isWaqasCeo && activeSubTab === 'members' && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Direct Team Member</span>
          </button>
        )}
      </div>

      {/* CEO Exclusive Tab Switcher */}
      {isWaqasCeo && (
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'members'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members &amp; Hierarchy</span>
          </button>
          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'comparison'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 Branches Graphical Comparison (CEO Exclusive)</span>
          </button>
        </div>
      )}

      {/* View Content: Either Graphical Comparison or Team Members */}
      {isWaqasCeo && activeSubTab === 'comparison' ? (
        <BranchComparisonAnalytics />
      ) : (
        <>

      {/* Leadership Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Waqas Gill */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Waqas Gill"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400"
            />
            <div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Founder &amp; CEO
              </span>
              <h2 className="text-base font-bold text-white mt-1">Waqas Gill</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Musafirkhana (HQ)
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Access:</span>
              <span className="text-emerald-400 font-bold">Master Super Admin</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">WhatsApp / Contact:</span>
              <a
                href="https://wa.me/923075203713"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-1"
                title="Open WhatsApp chat with Waqas Gill"
              >
                <span>+92 307 5203713</span>
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Visible Channels:</span>
              <span className="text-white font-bold">{channels.length} (All)</span>
            </div>
          </div>

          <div className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Executive Founder &amp; CEO
          </div>
        </div>

        {/* Saim Chaudhry */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-blue-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt="Saim Chaudhry"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-400"
            />
            <div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Co-Founder
              </span>
              <h2 className="text-base font-bold text-white mt-1">Saim Chaudhry</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" /> Bahawalpur Branch
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">System Role:</span>
              <span className="text-blue-400 font-bold">Branch Head</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Branch Channels:</span>
              <span className="text-white font-bold">
                {channels.filter((c) => c.branchId === 'bahawalpur').length} Channels
              </span>
            </div>
          </div>

          <div className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold text-center bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Head of Bahawalpur Branch
          </div>
        </div>

        {/* Zainab Akhtar */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-purple-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
              alt="Zainab Akhtar"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400"
            />
            <div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Co-Founder
              </span>
              <h2 className="text-base font-bold text-white mt-1">Zainab Akhtar</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-purple-400" /> Rahim Yar Khan
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">System Role:</span>
              <span className="text-purple-400 font-bold">Branch Head</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Branch Channels:</span>
              <span className="text-white font-bold">
                {channels.filter((c) => c.branchId === 'rahim-yar-khan').length} Channels
              </span>
            </div>
          </div>

          <div className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold text-center bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Head of Rahim Yar Khan Branch
          </div>
        </div>
      </div>

      {/* Pending User Approvals Section - RESTRICTED EXCLUSIVELY TO FOUNDER & CEO WAQAS GILL */}
      {pendingUsers.length > 0 && isWaqasCeo && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Pending Account Approvals ({pendingUsers.length})
              </h2>
              <p className="text-xs text-amber-200/80">
                These users have completed Gmail verification. Access to the ERP is restricted until approved by Founder &amp; CEO (Waqas Gill).
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              CEO Exclusive Action
            </span>
          </div>

          <div className="space-y-3">
            {pendingUsers.map((pending) => (
              <div
                key={pending.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={pending.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={pending.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-400/40 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white text-sm">{pending.name}</p>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        @{pending.username || 'user'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {pending.designation || 'Creator'}
                      </span>
                      {pending.joiningType && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          pending.joiningType === 'PERCENTAGE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {pending.joiningType === 'PERCENTAGE' ? 'On Percentage' : 'On Salary'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-300">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pending.email}</span>
                      </p>
                      {pending.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pending.phone}</span>
                        </p>
                      )}
                      {pending.address && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pending.address}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Branch: <strong className="text-white">{(pending.branchId || 'musafirkhana').toUpperCase()}</strong></span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => {
                      if (!isWaqasCeo) {
                        alert('Unauthorized: Sirf Founder & CEO Waqas Gill account decline kar sakty hain.');
                        return;
                      }
                      rejectUser(pending.id);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      if (!isWaqasCeo) {
                        alert('Unauthorized: Sirf Founder & CEO Waqas Gill account approve kar sakty hain.');
                        return;
                      }
                      approveUser(pending.id);
                      alert(`Account for ${pending.name} (@${pending.username}) has been approved successfully!`);
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md shadow-emerald-500/20 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production Team Members Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Active Team Members &amp; Operators ({availableUsers.length})
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Each team member is allotted channels according to their branch and role. Regular members are isolated to their own channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableUsers.map((user) => {
            const isRestricted = user.status === 'RESTRICTED' || user.status === 'SUSPENDED';
            const isFounder = user.id === 'user-waqas' || user.role === 'SUPER_ADMIN';

            return (
              <div
                key={user.id}
                className={`p-3.5 rounded-xl bg-slate-950 border flex flex-col justify-between gap-3 transition ${
                  isRestricted
                    ? 'border-red-500/50 bg-red-950/10'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className={`w-11 h-11 rounded-xl object-cover shrink-0 border ${
                      isRestricted ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  <div className="flex-1 truncate text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-slate-100 truncate">{user.name}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {(user.branchId || 'musafirkhana').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-400 truncate">{user.designation || 'Creator'}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">@{user.username || (user.email ? user.email.split('@')[0] : 'user')}</p>
                    {user.phone && <p className="text-[9px] text-slate-500">{user.phone}</p>}

                    {/* Status Badge */}
                    <div className="mt-1.5">
                      {isRestricted ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          <Ban className="w-3 h-3" /> Access Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Active Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Google Sheet Integration for Team Member (Option 1) */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                  {user.personalGoogleSheetUrl ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google Sheet Linked</span>
                        </span>
                        {user.syncedChannelsCount !== undefined && (
                          <span className="font-mono text-slate-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                            {user.syncedChannelsCount} Channels
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={user.personalGoogleSheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                          title="Open attached Google Sheet"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleQuickSyncMember(user.id)}
                          disabled={syncingUserId === user.id}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition disabled:opacity-50"
                          title="Fetch latest channels from Google Sheet now"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingUserId === user.id ? 'animate-spin text-emerald-400' : ''}`} />
                          <span>{syncingUserId === user.id ? '...' : 'Sync'}</span>
                        </button>

                        {isWaqasCeo && (
                          <button
                            type="button"
                            onClick={() => openSheetModal(user)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                            title="Edit Google Sheet Link"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    isWaqasCeo && (
                      <button
                        type="button"
                        onClick={() => openSheetModal(user)}
                        className="w-full py-2 rounded-xl text-[11px] font-bold bg-[#161820] hover:bg-[#1f232e] text-slate-300 hover:text-[#c4f042] border border-dashed border-[#232732] hover:border-[#c4f042]/50 flex items-center justify-center gap-1.5 transition"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#c4f042]" />
                        <span>+ Attach Google Sheet</span>
                      </button>
                    )
                  )}
                </div>

                {/* CEO Security Actions: Restrict Access or Delete User */}
                {isWaqasCeo && !isFounder && (
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    {/* Restrict / Unrestrict Button */}
                    {isRestricted ? (
                      <button
                        onClick={() => {
                          unrestrictUser(user.id);
                          alert(`Access for ${user.name} has been restored.`);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 transition"
                        title="Allow user to log in and work again"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>Restore Access</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`Aap ${user.name} ki access RESTRICT karna chahte hain?\n\nInka login foran block ho jayega aur yeh portal ya sheets access nahi kar sakein ge.`)) {
                            restrictUser(user.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition"
                        title="Block user login and access"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Restrict Access</span>
                      </button>
                    )}

                    {/* Delete Permanently Button */}
                    <button
                      onClick={() => {
                        if (confirm(`DANGER: Kya aap ${user.name} (@${user.username}) ko permanently DELETE karna chahte hain?\n\nInka account system aur cloud se mukammal remove ho jayega aur access foran terminate ho jayegi.`)) {
                          const res = deleteUser(user.id);
                          alert(res.message);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 flex items-center gap-1 transition"
                      title="Permanently remove user from EmpireNexs"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Direct Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Direct Add Team Member
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Members added via this form are activated immediately (no approval queue required).
            </p>

            {modalFeedback && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleCreateDirectUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Mubashir Hassan"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="mubashir"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gmail Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="mubashir@empirenexs.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Login Password</label>
                <input
                  type="password"
                  required
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City / Address</label>
                  <input
                    type="text"
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    placeholder="Bahawalpur"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Branch</label>
                  <select
                    value={newUserBranch}
                    onChange={(e) => setNewUserBranch(e.target.value as BranchId)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="bahawalpur">Bahawalpur</option>
                    <option value="rahim-yar-khan">Rahim Yar Khan</option>
                    <option value="musafirkhana">Musafirkhana (HQ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={newUserDesignation}
                    onChange={(e) => setNewUserDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
                >
                  Add Active User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach / Edit Google Sheet Modal (Option 1) */}
      {isSheetModalOpen && selectedUserForSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Attach Google Sheet for {selectedUserForSheet.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    @{selectedUserForSheet.username || 'user'} • {(selectedUserForSheet.branchId || 'musafirkhana').toUpperCase()} Branch
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSheetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sheetFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                {sheetFeedback}
              </div>
            )}

            <form onSubmit={handleSaveAndSyncSheet} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  1. Google Sheet URL (Public / Anyone with the link):
                </label>
                <input
                  type="url"
                  value={sheetInputUrl}
                  onChange={(e) => setSheetInputUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1.../edit?usp=sharing"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold">
                    2. Apps Script Webhook URL (For Direct Cell Writing):
                  </label>
                  <button
                    type="button"
                    onClick={copyAppsScriptCode}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 transition"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Script Copied!' : 'Copy Ready Apps Script'}</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={webhookInputUrl}
                  onChange={(e) => setWebhookInputUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Jab bhi member portal se naya channel add kare ga, row khud-b-khud is sheet ke cells mein likh di jaye gi.
                </p>
              </div>

              {webhookInputUrl && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-white text-xs">Direct Cell Auto-Write Ready</p>
                    <p className="text-[10px] text-slate-400">Portal se channels is Google Sheet ke cells mein auto-enter honge.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePushChannelsToSheet(selectedUserForSheet.id)}
                    disabled={isPushingChannels}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c4f042] hover:bg-[#b4eb28] text-slate-950 transition flex items-center gap-1 shrink-0"
                  >
                    {isPushingChannels ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-slate-950" />}
                    <span>Push Channels to Cells</span>
                  </button>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
                  How Auto-Writing to Cells Works:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px]">
                  <li>Member ki Google Sheet khol kar <strong>Extensions &gt; Apps Script</strong> mein code paste kar ke Web App deploy karein.</li>
                  <li>Webhook link yahan save kar dein. Iske baad member ko sheet kholne ki zaroorat nahi hogi.</li>
                  <li>Member portal ke <strong>Channels Vault</strong> se channel enter kare ga aur data foran Google Sheet ke cells mein chala jaye ga.</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSheetModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSheet}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingSheet ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving &amp; Fetching...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Save &amp; Sync Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
