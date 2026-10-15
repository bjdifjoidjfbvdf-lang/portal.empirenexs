'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import { NicheVideoItem, BranchId } from '@/types';
import {
  FolderKanban,
  Plus,
  FileText,
  Mic,
  Video,
  Image,
  ExternalLink,
  CheckCircle,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Sparkles,
  Search,
  Copy,
  Check,
  RefreshCw,
  Youtube,
  Bot,
  Tag,
  ArrowUpRight,
  ListFilter,
} from 'lucide-react';

export const ALL_SHEET_TABS_LIST: { name: string; gid: string; icon: string }[] = [
  { name: 'All Tabs', gid: 'all', icon: '📑' },
  { name: 'Elon Musk', gid: '0', icon: '🚀' },
  { name: 'Carl Jung', gid: '331544996', icon: '🧠' },
  { name: 'Trump', gid: '428722131', icon: '🏛️' },
  { name: 'Joker', gid: '96686562', icon: '🃏' },
  { name: 'Prayers', gid: '2027798229', icon: '📿' },
  { name: 'Space', gid: '1403038898', icon: '🌌' },
  { name: 'Face Cloning', gid: '1487514818', icon: '🤖' },
  { name: 'Russian Stories', gid: '1282848236', icon: '🇷🇺' },
  { name: 'youngi cho', gid: '1218222988', icon: '✝️' },
  { name: 'Story', gid: '268093005', icon: '📖' },
  { name: 'food', gid: '271645373', icon: '🍲' },
  { name: 'news', gid: '2103532665', icon: '📰' },
  { name: 'princes', gid: '1670299079', icon: '👑' },
  { name: 'History', gid: '1026726497', icon: '📜' },
  { name: 'motivational', gid: '1214444991', icon: '💡' },
  { name: 'Others', gid: '2053988009', icon: '✨' },
  { name: 'Urdu Stories', gid: '1817895956', icon: '🇵🇰' },
  { name: 'judge', gid: '2043461382', icon: '⚖️' },
];

export const NichesHub: React.FC = () => {
  const {
    nicheTabs,
    activeTabId,
    setActiveTabId,
    addNicheTab,
    addVideoToNiche,
    updateVideoInNiche,
    deleteVideoFromNiche,
    currentUser,
    selectedBranchId,
    claimNicheTopic,
    getUserTodayNicheCount,
    settings,
    sheetNiches,
    sheetNichesCategories,
    isFetchingSheetNiches,
    refreshSheetNiches,
    setIsChatOpen,
    sendMessageToAI,
  } = useApp();

  // Mode: 'sheet' (Connected Google Sheet 18+ links) vs 'workflow' (Production boards)
  const [hubMode, setHubMode] = useState<'sheet' | 'workflow'>('sheet');
  const [selectedSheetCategory, setSelectedSheetCategory] = useState<string>('all');
  const [sheetSearch, setSheetSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabDesc, setNewTabDesc] = useState('');
  const [newTabBranch, setNewTabBranch] = useState<BranchId>('musafirkhana');

  // Add / Edit Video modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<NicheVideoItem | null>(null);

  const [videoFormData, setVideoFormData] = useState({
    videoNo: 1,
    topicTitle: '',
    scriptWriter: '',
    scriptDocLink: '',
    voiceoverArtist: '',
    voiceoverAudioLink: '',
    videoEditor: '',
    videoDriveLink: '',
    thumbnailDesigner: '',
    thumbnailLink: '',
    status: 'Idea' as NicheVideoItem['status'],
    uploadDate: '',
    finalVideoLink: '',
    notes: '',
  });

  const activeTab = nicheTabs.find((t) => t.id === activeTabId) || nicheTabs[0];

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabName.trim()) return;
    addNicheTab(newTabName.trim(), newTabDesc.trim(), newTabBranch);
    setNewTabName('');
    setNewTabDesc('');
    setIsAddTabModalOpen(false);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.topicTitle.trim()) {
      alert('Please enter a topic title');
      return;
    }

    if (editingVideo && activeTab) {
      updateVideoInNiche(activeTab.id, editingVideo.id, {
        ...videoFormData,
      });
    } else if (activeTab) {
      addVideoToNiche(activeTab.id, {
        ...videoFormData,
        branchId: activeTab.branchId,
        nicheName: activeTab.name,
      });
    }

    setIsVideoModalOpen(false);
    setEditingVideo(null);
  };

  const openAddVideoModal = () => {
    setEditingVideo(null);
    setVideoFormData({
      videoNo: (activeTab?.videos.length || 0) + 1,
      topicTitle: '',
      scriptWriter: currentUser.name,
      scriptDocLink: '',
      voiceoverArtist: '',
      voiceoverAudioLink: '',
      videoEditor: '',
      videoDriveLink: '',
      thumbnailDesigner: '',
      thumbnailLink: '',
      status: 'Idea',
      uploadDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      finalVideoLink: '',
      notes: '',
    });
    setIsVideoModalOpen(true);
  };

  const openEditVideoModal = (video: NicheVideoItem) => {
    setEditingVideo(video);
    setVideoFormData({
      videoNo: video.videoNo,
      topicTitle: video.topicTitle,
      scriptWriter: video.scriptWriter,
      scriptDocLink: video.scriptDocLink,
      voiceoverArtist: video.voiceoverArtist,
      voiceoverAudioLink: video.voiceoverAudioLink,
      videoEditor: video.videoEditor,
      videoDriveLink: video.videoDriveLink,
      thumbnailDesigner: video.thumbnailDesigner,
      thumbnailLink: video.thumbnailLink,
      status: video.status,
      uploadDate: video.uploadDate,
      finalVideoLink: video.finalVideoLink,
      notes: video.notes || '',
    });
    setIsVideoModalOpen(true);
  };

  const statusColors: Record<string, string> = {
    Idea: 'bg-slate-800 text-slate-300 border-slate-700',
    Scripting: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
    Voiceover: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    'Video Editing': 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    Thumbnail: 'bg-pink-950/60 text-pink-300 border-pink-500/40',
    Review: 'bg-orange-950/60 text-orange-300 border-orange-500/40',
    Scheduled: 'bg-teal-950/60 text-teal-300 border-teal-500/40',
    Published: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-emerald-400" />
              Niches Content Production Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Single Sheet • Multi-Tabs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized Google Sheets workbook with separate category tabs to organize video workflows, Google Docs scripts, voiceover tracks, and media assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddTabModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add New Niche Tab</span>
          </button>
          <button
            onClick={openAddVideoModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video to Tab</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setHubMode('sheet')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              hubMode === 'sheet'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheet Niches Vault ({sheetNiches.length || 18} Links)</span>
          </button>

          <button
            type="button"
            onClick={() => setHubMode('workflow')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              hubMode === 'workflow'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Branch Production Pipelines &amp; Workflows</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-1">
          <a
            href={settings.googleSheetNichesUrl || 'https://docs.google.com/spreadsheets/d/1p_3ENMU4jL3BzqOk2bekdPc_l-x6sxaFnQ1moaJ4UGs/edit?usp=sharing'}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Connected Sheet</span>
          </a>

          <button
            type="button"
            onClick={() => refreshSheetNiches()}
            disabled={isFetchingSheetNiches}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSheetNiches ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isFetchingSheetNiches ? 'Syncing...' : 'Sync Fresh'}</span>
          </button>
        </div>
      </div>

      {hubMode === 'sheet' ? (
        /* Google Sheet Master Vault Mode */
        <div className="space-y-6">
          {/* Sheet Connection Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="font-bold text-white text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Live Connected Google Sheet: Niches &amp; Competitor Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  18 Tabs • {sheetNiches.length || 78} Total Links Loaded
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Google Sheet ke تمام 18 category tabs (Carl Jung, Trump, Elon Musk, Joker, Prayers, Space, etc.) bind hain. Hamara AI bot bhi sheet se competitor links provide karta hai.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsChatOpen(true);
                  sendMessageToAI('Mujhe niches sheet ke baray mein batao aur available competitor topics dikhao');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI for Competitors</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                placeholder="Search Carl Jung, Trump, Elon Musk, Joker, Prayers, Space..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dynamic 18 Category Pills with Live Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {ALL_SHEET_TABS_LIST.map((tab) => {
                const count =
                  tab.gid === 'all'
                    ? (sheetNiches || []).length
                    : (sheetNiches || []).filter(
                        (i) => i.tabGid === tab.gid || (i.tabName && i.tabName.toLowerCase() === tab.name.toLowerCase())
                      ).length;
                const isSelected = selectedSheetCategory === tab.gid;

                return (
                  <button
                    key={tab.gid}
                    type="button"
                    onClick={() => setSelectedSheetCategory(tab.gid)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(sheetNiches || [])
              .filter((item) => {
                const matchesCategory =
                  selectedSheetCategory === 'all' ||
                  item.tabGid === selectedSheetCategory ||
                  (item.tabName && item.tabName.toLowerCase() === selectedSheetCategory.toLowerCase()) ||
                  item.category.toLowerCase().includes(selectedSheetCategory.toLowerCase());
                const matchesSearch =
                  !sheetSearch.trim() ||
                  `${item.title} ${item.channelName} ${item.category} ${item.tabName || ''} ${item.description} ${item.url} ${item.tags.join(' ')}`
                    .toLowerCase()
                    .includes(sheetSearch.toLowerCase());
                return matchesCategory && matchesSearch;
              })
              .map((item) => {
                const isCopied = copiedId === item.id;
                const directUrl =
                  item.directTabUrl ||
                  `https://docs.google.com/spreadsheets/d/1p_3ENMU4jL3BzqOk2bekdPc_l-x6sxaFnQ1moaJ4UGs/edit#gid=${item.tabGid || '0'}`;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      {/* Top Category Badge & Type */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 truncate">
                          Tab: {item.tabName || item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/40 text-red-400 border border-red-500/20 shrink-0 flex items-center gap-1">
                          <Youtube className="w-3 h-3" />
                          <span>{item.type === 'video' ? 'Video' : 'Competitor'}</span>
                        </span>
                      </div>

                      {/* Title & Reference */}
                      <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                        {item.channelName}
                      </p>

                      {/* Description & Angle */}
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Link & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
                        <span className="truncate pr-2">{item.url}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            setCopiedId(item.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="text-slate-400 hover:text-white transition shrink-0"
                          title="Copy Link"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/30 transition flex items-center justify-center gap-1"
                        >
                          <Youtube className="w-3.5 h-3.5" />
                          <span>YouTube</span>
                        </a>

                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1"
                          title="Open this specific tab in Google Sheet"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sheet Tab</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setIsChatOpen(true);
                            sendMessageToAI(`Mujhe "${item.tabName || item.title}" par competitor channels aur topics do`);
                          }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 transition flex items-center justify-center gap-1"
                        >
                          <Bot className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ask AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* Original Production Workflows & Tables Mode */
        <div className="space-y-6">
          {/* Sheet Tabs Bar (like Google Sheets tabs) */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-inner">
            <div className="flex items-center px-2 py-1 text-slate-400 text-[11px] font-bold uppercase tracking-wider shrink-0">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              Sheet Tabs:
            </div>
        {nicheTabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{tab.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {tab.videos.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Info Banner */}
      {activeTab && (
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Active Tab:
              </span>
              <h2 className="text-base font-bold text-white">{activeTab.name}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Assigned: {(activeTab.branchId || 'musafirkhana').toUpperCase()} Branch
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{activeTab.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">
              Total Videos in this Tab:{' '}
              <strong className="text-white font-bold">{activeTab.videos.length}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Daily Niche Quota Widget */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Daily Niche Assignment Quota:
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {getUserTodayNicheCount(currentUser.id)} / {settings.dailyNicheLimitPerUser || 2} Claimed Today
            </span>
          </div>
          <p className="text-slate-400 text-[11px] mt-1">
            Each unique user is allotted a maximum of 2 topics per 24 hours. Claiming a topic auto-assigns the Google Docs script link.
          </p>
        </div>

        <button
          onClick={() => {
            const res = claimNicheTopic(activeTab ? activeTab.name : 'Tech & AI');
            alert(res.message);
          }}
          disabled={getUserTodayNicheCount(currentUser.id) >= (settings.dailyNicheLimitPerUser || 2)}
          className="px-4 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Claim Next Topic in "{activeTab?.name}"</span>
        </button>
      </div>

      {/* Videos Workflow Table for the Active Tab */}
      <div className="rounded-xl border border-slate-800 bg-[#090d16] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 font-bold w-12 text-center">#</th>
                <th className="py-3 px-4 font-bold min-w-[220px]">Video Title / Topic</th>
                <th className="py-3 px-3 font-bold">Script (Doc)</th>
                <th className="py-3 px-3 font-bold">Voiceover (Drive)</th>
                <th className="py-3 px-3 font-bold">Video Edit (Drive)</th>
                <th className="py-3 px-3 font-bold">Thumbnail</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold">Target Date</th>
                <th className="py-3 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {!activeTab || activeTab.videos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No videos added yet to this niche tab. Click &quot;Add Video to Tab&quot; to start production.
                  </td>
                </tr>
              ) : (
                activeTab.videos.map((vid) => (
                  <tr key={vid.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Video # */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                      #{vid.videoNo}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-100 hover:text-emerald-400 transition">
                          {vid.topicTitle}
                        </p>
                        {vid.notes && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {vid.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Script Writer & Doc */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-200">{vid.scriptWriter || 'Unassigned'}</p>
                        {vid.scriptDocLink ? (
                          <a
                            href={vid.scriptDocLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:underline mt-0.5"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Google Doc</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">No link</span>
                        )}
                      </div>
                    </td>

                    {/* Voiceover Artist & Audio */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-200">{vid.voiceoverArtist || 'Pending'}</p>
                        {vid.voiceoverAudioLink ? (
                          <a
                            href={vid.voiceoverAudioLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-400 hover:underline mt-0.5"
                          >
                            <Mic className="w-3 h-3" />
                            <span>Drive Audio</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">No link</span>
                        )}
                      </div>
                    </td>

                    {/* Video Editor & Drive */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-200">{vid.videoEditor || 'Unassigned'}</p>
                        {vid.videoDriveLink ? (
                          <a
                            href={vid.videoDriveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:underline mt-0.5"
                          >
                            <Video className="w-3 h-3" />
                            <span>Raw / Cut</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">No link</span>
                        )}
                      </div>
                    </td>

                    {/* Thumbnail Designer & Link */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-200">{vid.thumbnailDesigner || 'Pending'}</p>
                        {vid.thumbnailLink ? (
                          <a
                            href={vid.thumbnailLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-pink-400 hover:underline mt-0.5"
                          >
                            <Image className="w-3 h-3" />
                            <span>Canva / PSD</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">No link</span>
                        )}
                      </div>
                    </td>

                    {/* Status Dropdown (Quick Status Update) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={vid.status}
                        onChange={(e) => {
                          updateVideoInNiche(activeTab.id, vid.id, {
                            status: e.target.value as NicheVideoItem['status'],
                          });
                        }}
                        className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-1 border focus:outline-none cursor-pointer ${
                          statusColors[vid.status] || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <option value="Idea">Idea</option>
                        <option value="Scripting">Scripting</option>
                        <option value="Voiceover">Voiceover</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="Thumbnail">Thumbnail</option>
                        <option value="Review">Review</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Published">Published</option>
                      </select>
                    </td>

                    {/* Upload / Target Date */}
                    <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{vid.uploadDate || 'TBD'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditVideoModal(vid)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                          title="Edit Video Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete video "${vid.topicTitle}" from this tab?`)) {
                              deleteVideoFromNiche(activeTab.id, vid.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition"
                          title="Delete from tab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* Add New Niche Tab Modal */}
      {isAddTabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-emerald-400" />
              Add New Niche Tab to Sheet
            </h2>
            <form onSubmit={handleCreateTab} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Niche / Topic Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Space & Cosmos, Finance Secrets"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Focus</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of videos produced in this niche tab..."
                  value={newTabDesc}
                  onChange={(e) => setNewTabDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Responsible Branch</label>
                <select
                  value={newTabBranch}
                  onChange={(e) => setNewTabBranch(e.target.value as BranchId)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="musafirkhana">Musafirkhana (Waqas Gill)</option>
                  <option value="bahawalpur">Bahawalpur (Saim Ch)</option>
                  <option value="rahim-yar-khan">Rahim Yar Khan (Zainab Akhtar)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTabModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Create Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-400" />
              {editingVideo ? 'Edit Video in Tab' : `Add Video to "${activeTab?.name}"`}
            </h2>

            <form onSubmit={handleSaveVideo} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">Video #</label>
                  <input
                    type="number"
                    value={videoFormData.videoNo}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, videoNo: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Current Status</label>
                  <select
                    value={videoFormData.status}
                    onChange={(e) =>
                      setVideoFormData({
                        ...videoFormData,
                        status: e.target.value as NicheVideoItem['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Scripting">Scripting</option>
                    <option value="Voiceover">Voiceover</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Thumbnail">Thumbnail</option>
                    <option value="Review">Review</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Video Topic / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inside Dubai's Most Guarded Billionaire Compound"
                  value={videoFormData.topicTitle}
                  onChange={(e) =>
                    setVideoFormData({ ...videoFormData, topicTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Script Writer</label>
                  <input
                    type="text"
                    placeholder="Writer Name"
                    value={videoFormData.scriptWriter}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, scriptWriter: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Script Doc Link</label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/..."
                    value={videoFormData.scriptDocLink}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, scriptDocLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Voiceover Artist</label>
                  <input
                    type="text"
                    placeholder="Artist / AI Model"
                    value={videoFormData.voiceoverArtist}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, voiceoverArtist: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Audio Drive Link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={videoFormData.voiceoverAudioLink}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, voiceoverAudioLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Video Editor</label>
                  <input
                    type="text"
                    placeholder="Editor Name"
                    value={videoFormData.videoEditor}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, videoEditor: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Video Drive Link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={videoFormData.videoDriveLink}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, videoDriveLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Thumbnail Designer</label>
                  <input
                    type="text"
                    placeholder="Designer Name"
                    value={videoFormData.thumbnailDesigner}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, thumbnailDesigner: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Thumbnail Link</label>
                  <input
                    type="url"
                    placeholder="Canva or Drive Link"
                    value={videoFormData.thumbnailLink}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, thumbnailLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target / Upload Date</label>
                  <input
                    type="date"
                    value={videoFormData.uploadDate}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, uploadDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Final YouTube Link</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoFormData.finalVideoLink}
                    onChange={(e) =>
                      setVideoFormData({ ...videoFormData, finalVideoLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  {editingVideo ? 'Update Video' : 'Add Video to Tab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
