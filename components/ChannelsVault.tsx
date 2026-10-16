'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import { ChannelRecord, BranchId } from '@/types';
import {
  ShieldCheck,
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Filter,
  Check,
  Globe,
  Trash2,
  Edit,
  Youtube,
  KeyRound,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const ChannelsVault: React.FC = () => {
  const {
    currentUser,
    channels,
    filteredChannels,
    addChannel,
    updateChannel,
    deleteChannel,
    bulkImportChannels,
    triggerGoogleSheetSync,
    isSyncingSheets,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal state for adding channel
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ChannelRecord | null>(null);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Personal Sheet / CSV Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSheetUrl, setImportSheetUrl] = useState(currentUser?.personalGoogleSheetUrl || '');
  const [pasteRows, setPasteRows] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // New channel form state
  const [formData, setFormData] = useState({
    nameAndLink: '',
    channelName: '',
    channelUrl: '',
    status: 'Active' as ChannelRecord['status'],
    email: '',
    password: '',
    twoFactor: '',
    managedBy: '',
    managerMail: '',
    backupCodes: '',
    createdNumber: '',
    pubId: '',
    owner: 'EmpireNexs',
    branchId: 'musafirkhana' as BranchId,
    ip: '',
    niche: 'Tech & AI',
    subscribers: '',
    notes: '',
  });

  const togglePasswordVisibility = (channelId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  const copyToClipboard = (text: string, keyIdentifier: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyIdentifier);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Filter channels by search and status
  const displayedChannels = filteredChannels.filter((ch) => {
    const matchesSearch =
      ch.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.managedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.pubId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleImportSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    setImportStatus(null);
    try {
      const imported: Omit<ChannelRecord, 'id' | 'updatedAt'>[] = [];

      // 1. Process Pasted Table / CSV lines
      if (pasteRows.trim()) {
        const lines = pasteRows.trim().split('\n');
        for (const line of lines) {
          const parts = line.includes('\t') ? line.split('\t') : line.split(',');
          if (parts.length >= 2) {
            const chName = parts[0]?.trim();
            const chUrl = parts[1]?.trim();
            if (chName && chUrl && (chUrl.includes('youtube.com') || chUrl.includes('youtu.be') || chUrl.startsWith('http'))) {
              imported.push({
                nameAndLink: `${chName} - ${chUrl}`,
                channelName: chName,
                channelUrl: chUrl,
                status: (parts[2]?.trim() as any) || 'Active',
                email: parts[3]?.trim() || `${chName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
                password: parts[4]?.trim() || '••••••••',
                twoFactor: parts[5]?.trim() || 'Enabled',
                managedBy: parts[6]?.trim() || currentUser?.name || 'Creator',
                managerMail: parts[7]?.trim() || currentUser?.email || 'admin@empirenexs.com',
                backupCodes: parts[8]?.trim() || 'Available',
                createdNumber: parts[9]?.trim() || '',
                pubId: parts[10]?.trim() || '',
                owner: parts[11]?.trim() || currentUser?.name || 'EmpireNexs',
                branchId: (currentUser?.branchId === 'all' || !currentUser?.branchId) ? 'musafirkhana' : (currentUser.branchId as BranchId),
                ip: parts[12]?.trim() || '194.26.29.112 (Static Proxy)',
                niche: parts[13]?.trim() || 'Automation / Tech',
                subscribers: '0',
                personalSheetUrl: importSheetUrl.trim(),
                notes: `Imported via private sheet on ${new Date().toLocaleDateString()}`,
              });
            }
          }
        }
      } else if (importSheetUrl.trim()) {
        // 2. Fetch CSV directly from Google Sheet published/export URL
        let fetchUrl = importSheetUrl.trim();
        if (fetchUrl.includes('/edit')) {
          fetchUrl = fetchUrl.replace(/\/edit.*$/, '/export?format=csv');
        }
        try {
          const res = await fetch(fetchUrl);
          if (res.ok) {
            const text = await res.text();
            const lines = text.trim().split('\n');
            for (let i = 1; i < lines.length; i++) {
              const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
              if (parts.length >= 2 && parts[0]) {
                imported.push({
                  nameAndLink: `${parts[0]} - ${parts[1] || ''}`,
                  channelName: parts[0],
                  channelUrl: parts[1] || `https://youtube.com/@${parts[0].toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                  status: (parts[2] as any) || 'Active',
                  email: parts[3] || '',
                  password: parts[4] || '••••••••',
                  twoFactor: parts[5] || 'Enabled',
                  managedBy: parts[6] || currentUser?.name || 'Creator',
                  managerMail: parts[7] || currentUser?.email || 'admin@empirenexs.com',
                  backupCodes: parts[8] || '',
                  createdNumber: parts[9] || '',
                  pubId: parts[10] || '',
                  owner: parts[11] || currentUser?.name || 'EmpireNexs',
                  branchId: (currentUser?.branchId === 'all' || !currentUser?.branchId) ? 'musafirkhana' : (currentUser.branchId as BranchId),
                  ip: parts[12] || '',
                  niche: parts[13] || 'Automation',
                  subscribers: '0',
                  personalSheetUrl: importSheetUrl.trim(),
                });
              }
            }
          }
        } catch (fetchErr) {
          console.warn('Direct CSV fetch notice:', fetchErr);
        }
      }

      if (imported.length > 0) {
        const count = await bulkImportChannels(imported);
        setImportStatus(`✅ Successfully imported and saved ${count} channels to your private cloud vault!`);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportStatus(null);
          setPasteRows('');
        }, 1500);
      } else {
        setImportStatus('⚠️ No channel rows detected. Please paste your sheet rows containing Channel Name and YouTube URL.');
      }
    } catch (err: any) {
      setImportStatus(`❌ Import failed: ${err?.message || 'Please check your sheet data.'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.channelName || !formData.channelUrl) {
      alert('Please provide Channel Name and URL');
      return;
    }

    const payload = {
      ...formData,
      nameAndLink: `${formData.channelName} - ${formData.channelUrl}`,
    };

    if (editingChannel) {
      updateChannel(editingChannel.id, payload);
      setActionNotification('Channel updated successfully!');
    } else {
      addChannel(payload);
      setActionNotification(
        currentUser?.personalGoogleSheetWebhookUrl
          ? `✅ "${formData.channelName}" added to EmpireNexs & row auto-written into your Google Sheet cells!`
          : `✅ "${formData.channelName}" added successfully to EmpireNexs Portal!`
      );
    }

    setIsAddModalOpen(false);
    setEditingChannel(null);
    setTimeout(() => setActionNotification(null), 5000);
  };

  const openEditModal = (ch: ChannelRecord) => {
    setEditingChannel(ch);
    setFormData({
      nameAndLink: ch.nameAndLink,
      channelName: ch.channelName,
      channelUrl: ch.channelUrl,
      status: ch.status,
      email: ch.email,
      password: ch.password,
      twoFactor: ch.twoFactor,
      managedBy: ch.managedBy,
      managerMail: ch.managerMail,
      backupCodes: ch.backupCodes,
      createdNumber: ch.createdNumber,
      pubId: ch.pubId,
      owner: ch.owner,
      branchId: ch.branchId,
      ip: ch.ip,
      niche: ch.niche,
      subscribers: ch.subscribers || '',
      notes: ch.notes || '',
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {actionNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionNotification}</span>
          </div>
          <button
            onClick={() => setActionNotification(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#c4f042]" />
              Channels Vault (Google Sheet Sync)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#c4f042]/15 text-[#c4f042] border border-[#c4f042]/30">
              Live Schema
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete channel directory matching your exact sheet columns: Credentials, 2FA, Backup Codes, PUB ID, Manager & Dedicated IP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setImportSheetUrl(currentUser?.personalGoogleSheetUrl || '');
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#161820] hover:bg-[#1f232e] text-slate-200 border border-[#232732] transition flex items-center gap-1.5 shadow-sm"
            title="Import or sync from your private Google Sheet / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#c4f042]" />
            <span>Sync My Google Sheet</span>
          </button>
          <button
            onClick={() => triggerGoogleSheetSync()}
            disabled={isSyncingSheets}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#161820] hover:bg-[#1f232e] text-slate-200 border border-[#232732] transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            <span>{isSyncingSheets ? 'Syncing...' : 'Sync Global'}</span>
          </button>
          <button
            onClick={() => {
              setEditingChannel(null);
              setFormData({
                nameAndLink: '',
                channelName: '',
                channelUrl: '',
                status: 'Active',
                email: '',
                password: '',
                twoFactor: '',
                managedBy: currentUser?.name || 'Creator',
                managerMail: currentUser?.email || 'admin@empirenexs.com',
                backupCodes: '',
                createdNumber: '',
                pubId: '',
                owner: currentUser?.name || 'EmpireNexs',
                branchId: (currentUser?.branchId === 'all' || !currentUser?.branchId) ? 'musafirkhana' : (currentUser.branchId as BranchId),
                ip: '',
                niche: 'Tech & AI',
                subscribers: '',
                notes: '',
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#c4f042] hover:bg-[#b4eb28] text-[#0d1505] shadow-[0_0_20px_rgba(196,240,66,0.3)] transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel to Sheet</span>
          </button>
        </div>
      </div>

      {/* Role Perspective Banner */}
      {currentUser?.role === 'SUPER_ADMIN' ? (
        <div className="p-3.5 rounded-2xl bg-[#161820] border border-[#232732] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-extrabold px-2 py-0.5 rounded bg-[#c4f042] text-[#0d1505] text-[10px]">
              SUPER ADMIN
            </span>
            <span>
              <strong>Master Founder Access (Waqas Gill):</strong> Showing all channels and all branches across the entire organization ({displayedChannels.length} Channels). Full login visibility enabled.
            </span>
          </div>
        </div>
      ) : currentUser?.role === 'CO_FOUNDER' || currentUser?.role === 'BRANCH_HEAD' ? (
        <div className="p-3.5 rounded-2xl bg-[#161820] border border-[#232732] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-300">
            <span className="font-extrabold px-2 py-0.5 rounded bg-blue-500 text-slate-950 text-[10px]">
              BRANCH HEAD
            </span>
            <span>
              <strong>Branch Workspace ({(currentUser?.branchId || 'HQ').toUpperCase()}):</strong> Showing all channels belonging to your branch ({displayedChannels.length} Channels).
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#161820] border border-[#232732] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="font-extrabold px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px]">
              PERSONAL VAULT
            </span>
            <span>
              <strong>Strict Privacy Isolation ({currentUser?.name || 'Creator'}):</strong> Showing only channels managed by you ({displayedChannels.length} Channels). You can view your login credentials to work on your channels. Other members cannot view your channels.
            </span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161820] p-3.5 rounded-2xl border border-[#232732]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Channel name, Email, Manager, IP, PUB ID..."
            className="w-full pl-9 pr-4 py-2 bg-[#111317] border border-[#232732] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c4f042]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#c4f042]" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111317] border border-[#232732] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#c4f042]"
          >
            <option value="all">All Statuses ({filteredChannels.length})</option>
            <option value="Active">Active</option>
            <option value="Monetized">Monetized</option>
            <option value="Sold">Sold</option>
            <option value="Demonetized">Demonetized</option>
            <option value="In Review">In Review</option>
            <option value="Warmup">Warmup</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Exact Sheet Columns Table */}
      <div className="rounded-2xl border border-[#232732] bg-[#161820] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111317] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232732]">
              <tr>
                <th className="py-3 px-4 font-bold">Name / Link</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold">Email</th>
                <th className="py-3 px-3 font-bold">Password</th>
                <th className="py-3 px-3 font-bold">2 FA</th>
                <th className="py-3 px-3 font-bold">Managed By</th>
                <th className="py-3 px-3 font-bold">Manager Mail</th>
                <th className="py-3 px-3 font-bold">Backup Codes</th>
                <th className="py-3 px-3 font-bold">Created Number</th>
                <th className="py-3 px-3 font-bold">PUB ID</th>
                <th className="py-3 px-3 font-bold">Owner (Branch)</th>
                <th className="py-3 px-3 font-bold">Dedicated IP</th>
                <th className="py-3 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {displayedChannels.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 font-sans">
                    No channels found matching the filter or branch.
                  </td>
                </tr>
              ) : (
                displayedChannels.map((ch) => {
                  const isRevealed = !!revealedPasswords[ch.id];
                  const canReveal = true;

                  return (
                    <tr
                      key={ch.id}
                      className="hover:bg-slate-900/40 transition-colors font-sans text-xs group"
                    >
                      {/* Name / Link */}
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                            <Youtube className="w-4 h-4" />
                          </div>
                          <div>
                            <a
                              href={ch.channelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-slate-100 hover:text-emerald-400 transition flex items-center gap-1 group/link"
                            >
                              <span>{ch.channelName}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition" />
                            </a>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {ch.niche} • {ch.subscribers || 'Growth'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ch.status === 'Monetized'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : ch.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ch.status === 'In Review'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span>{ch.email}</span>
                          <button
                            onClick={() => copyToClipboard(ch.email, `email-${ch.id}`)}
                            title="Copy Email"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white"
                          >
                            {copiedKey === `email-${ch.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password (Protected & Masked) */}
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              isRevealed
                                ? 'text-emerald-300 font-semibold bg-emerald-950/40 px-1 rounded'
                                : 'text-slate-400'
                            }
                          >
                            {isRevealed ? ch.password : '••••••••••••'}
                          </span>
                          {canReveal && (
                            <button
                              onClick={() => togglePasswordVisibility(ch.id)}
                              className="text-slate-400 hover:text-slate-200"
                              title={isRevealed ? 'Hide Password' : 'Show Password'}
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          {isRevealed && (
                            <button
                              onClick={() => copyToClipboard(ch.password, `pass-${ch.id}`)}
                              className="text-slate-400 hover:text-emerald-400"
                              title="Copy Password"
                            >
                              {copiedKey === `pass-${ch.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 2 FA */}
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 truncate max-w-[120px]" title={ch.twoFactor}>
                            {canReveal ? ch.twoFactor : '••••••••'}
                          </span>
                          {canReveal && (
                            <button
                              onClick={() => copyToClipboard(ch.twoFactor, `2fa-${ch.id}`)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white"
                              title="Copy 2FA key"
                            >
                              {copiedKey === `2fa-${ch.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Managed By */}
                      <td className="py-3 px-3 text-slate-200 font-medium whitespace-nowrap">
                        {ch.managedBy}
                      </td>

                      {/* Manager Mail */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {ch.managerMail}
                      </td>

                      {/* Backup Codes */}
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <span className="text-slate-400 truncate max-w-[110px] inline-block" title={ch.backupCodes}>
                          {canReveal && isRevealed ? ch.backupCodes : '•••• •••• ••••'}
                        </span>
                      </td>

                      {/* Created Number */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {ch.createdNumber}
                      </td>

                      {/* PUB ID */}
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap text-amber-300">
                        {ch.pubId}
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-200">{ch.owner}</span>
                      </td>

                      {/* Ip (Dedicated Proxy) */}
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700/80">
                          {ch.ip}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(ch)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                            title="Edit Channel Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {currentUser?.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${ch.channelName}?`)) {
                                  deleteChannel(ch.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition"
                              title="Delete from Sheet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Channel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                {editingChannel ? 'Edit Channel Details' : 'Add New Channel to EmpireNexs'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {currentUser?.personalGoogleSheetWebhookUrl && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Google Sheet Auto-Write Active:</strong> Ye channel save hotay hi aapki Google Sheet ke cells mein auto-enter ho jaye ga.
                </span>
              </div>
            )}

            <form onSubmit={handleSaveChannel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Channel Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.channelName}
                    onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                    placeholder="e.g. Apex Tech Documentaries"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Channel URL / Link *</label>
                  <input
                    type="url"
                    required
                    value={formData.channelUrl}
                    onChange={(e) => setFormData({ ...formData, channelUrl: e.target.value })}
                    placeholder="https://youtube.com/@channelhandle"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ChannelRecord['status'] })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Monetized">Monetized</option>
                    <option value="Sold">Sold</option>
                    <option value="Demonetized">Demonetized</option>
                    <option value="In Review">In Review</option>
                    <option value="Warmup">Warmup</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assigned Branch</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) =>
                      setFormData({ ...formData, branchId: e.target.value as BranchId })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="musafirkhana">Musafirkhana (Waqas Gill)</option>
                    <option value="bahawalpur">Bahawalpur (Saim Ch)</option>
                    <option value="rahim-yar-khan">Rahim Yar Khan (Zainab Akhtar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Account Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="channel.google@gmail.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Master password"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">2 FA Secret / Key</label>
                  <input
                    type="text"
                    value={formData.twoFactor}
                    onChange={(e) => setFormData({ ...formData, twoFactor: e.target.value })}
                    placeholder="Authenticator Secret or G-Code"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Backup Codes</label>
                  <input
                    type="text"
                    value={formData.backupCodes}
                    onChange={(e) => setFormData({ ...formData, backupCodes: e.target.value })}
                    placeholder="8291 0021, 3310 9940"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Managed By (Person)</label>
                  <input
                    type="text"
                    value={formData.managedBy}
                    onChange={(e) => setFormData({ ...formData, managedBy: e.target.value })}
                    placeholder="e.g. Saim Ch / Hamza Tariq"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Manager Mail</label>
                  <input
                    type="email"
                    value={formData.managerMail}
                    onChange={(e) => setFormData({ ...formData, managerMail: e.target.value })}
                    placeholder="manager@empirenexs.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Created Number</label>
                  <input
                    type="text"
                    value={formData.createdNumber}
                    onChange={(e) => setFormData({ ...formData, createdNumber: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">AdSense PUB ID</label>
                  <input
                    type="text"
                    value={formData.pubId}
                    onChange={(e) => setFormData({ ...formData, pubId: e.target.value })}
                    placeholder="pub-8910293847291029"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="e.g. Waqas Gill / Saim Ch / Zainab Akhtar"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dedicated IP / Proxy</label>
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                    placeholder="194.26.29.112 (Static UK Proxy)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  {editingChannel ? 'Update Channel' : 'Save to Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Personal Google Sheet Import / Sync Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  Sync &amp; Import from Google Sheet
                </h2>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Import channels directly into your <strong>Private Workspace</strong>. Every imported channel is automatically tagged to your account and stored in the persistent cloud database.
            </p>

            {importStatus && (
              <div className="mb-4 p-3 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-200">
                {importStatus}
              </div>
            )}

            <form onSubmit={handleImportSheet} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Option 1: Google Sheet URL (CSV / Published / Share Link)
                </label>
                <input
                  type="url"
                  value={importSheetUrl}
                  onChange={(e) => setImportSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-id/export?format=csv"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Direct published Google Sheet link or CSV export URL.
                </p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  OR COPY-PASTE ROWS
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Option 2: Paste Rows from Google Sheets (Tab or Comma Separated)
                </label>
                <textarea
                  rows={5}
                  value={pasteRows}
                  onChange={(e) => setPasteRows(e.target.value)}
                  placeholder={`Apex Tech Documentaries\thttps://youtube.com/@apextech\tActive\tapex@gmail.com\tpassword123\nLuxury Empire\thttps://youtube.com/@luxuryempire\tActive\tluxury@gmail.com\tpassword123`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Format: Channel Name &amp; YouTube Link required. Columns can be tab or comma separated.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Import &amp; Save to Cloud</span>
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
