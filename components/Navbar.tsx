'use client';

import React from 'react';
import { useApp } from '@/lib/storeContext';
import { BRANCHES } from '@/lib/initialData';
import {
  Shield,
  Bot,
  RefreshCw,
  Building2,
  ChevronDown,
  UserCheck,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  User,
  UserPlus,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    pendingUsers,
    logout,
    selectedBranchId,
    setSelectedBranchId,
    channels,
    isSyncingSheets,
    triggerGoogleSheetSync,
    setIsChatOpen,
    setIsSyncModalOpen,
    theme,
    toggleTheme,
  } = useApp();

  const activeBranch = BRANCHES.find((b) => b.id === selectedBranchId);

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f13]/95 backdrop-blur-md border-b border-[#1e222b] px-4 lg:px-7 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand + Breadcrumbs (like demo picture) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#161920] border border-[#262c38] flex items-center justify-center font-black text-[#c4f042] text-sm shadow-sm">
              EN
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm tracking-tight text-white">
                EmpireNexs
              </span>
              <span className="ml-1.5 text-[9px] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#c4f042]/15 text-[#c4f042] border border-[#c4f042]/30">
                HQ OS
              </span>
            </div>
          </div>

          {/* Breadcrumbs matching demo image */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#6c7486] font-medium border-l border-[#1e222b] pl-4">
            <span className="text-[#8a92a6]">Dashboards</span>
            <span>/</span>
            <span className="text-white font-bold capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Middle: Active Branch Switcher (Enabled for CEO, restricted for branch heads) */}
        <div className="flex items-center gap-2">
          {currentUser?.canAccessAllBranches ? (
            <div className="flex items-center bg-[#161820] border border-[#232733] rounded-xl p-1 text-xs">
              <span className="text-[#6c7486] px-2 font-bold text-[11px] flex items-center gap-1.5 hidden md:flex">
                <Building2 className="w-3.5 h-3.5 text-[#c4f042]" />
                Branch:
              </span>
              <button
                onClick={() => setSelectedBranchId('all')}
                className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all ${
                  selectedBranchId === 'all'
                    ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_15px_rgba(196,240,66,0.25)]'
                    : 'text-[#8a92a6] hover:text-white hover:bg-[#1f232d]'
                }`}
              >
                All Branches (HQ)
              </button>
              {BRANCHES.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all hidden lg:block ${
                    selectedBranchId === branch.id
                      ? 'bg-[#c4f042] text-[#0d1505] shadow-[0_0_15px_rgba(196,240,66,0.25)]'
                      : 'text-[#8a92a6] hover:text-white hover:bg-[#1f232d]'
                  }`}
                >
                  {branch.city}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161820] border border-[#232733] rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-[#c4f042] animate-pulse"></span>
              <span className="font-bold text-slate-200">
                {currentUser?.branchId === 'bahawalpur'
                  ? 'Bahawalpur Branch (Saim Chaudhry)'
                  : currentUser?.branchId === 'rahim-yar-khan'
                  ? 'Rahim Yar Khan Branch (Zainab Akhtar)'
                  : 'Musafirkhana Branch (Waqas Gill)'}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions: Theme Toggle + Sheets Sync + AI Assistant + User Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-xs font-semibold bg-[#161820] border border-[#232733] hover:border-[#383e50] text-[#8a92a6] hover:text-white transition-colors flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Google Sheets Live Sync Button */}
          <button
            onClick={async () => {
              await triggerGoogleSheetSync();
            }}
            disabled={isSyncingSheets}
            title="Sync with Google Sheets"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#161820] border border-[#232733] hover:border-[#383e50] text-[#c4f042] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin text-[#c4f042]' : ''}`} />
            <span className="hidden md:inline">
              {isSyncingSheets ? 'Syncing...' : 'Sheets Sync'}
            </span>
          </button>

          {/* Pending Approvals Badge for Admin */}
          {pendingUsers.length > 0 && currentUser?.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => setActiveTab('team')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
              title="Click to review pending user approvals"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>{pendingUsers.length} Pending Approval</span>
            </button>
          )}

          {/* Ask AI Assistant Floating Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Nexs AI Bot</span>
          </button>

          {/* User Profile & Role Switcher Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg p-1.5 cursor-pointer text-xs">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-emerald-400/40"
              />
              <div className="hidden sm:block text-left">
                <p className="font-bold text-slate-200 leading-tight flex items-center gap-1">
                  {currentUser?.name || 'User'}
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <Shield className="w-3 h-3 text-amber-400" />
                  )}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {currentUser?.designation || 'Creator'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Profile Card Header */}
              <div className="p-2 border-b border-slate-800 mb-1 flex items-center gap-2.5">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name || 'User'}
                  className="w-9 h-9 rounded-xl object-cover border border-emerald-400/40"
                />
                <div className="flex-1 truncate">
                  <p className="font-bold text-white text-xs">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] text-emerald-400 font-mono truncate">@{currentUser?.username || 'user'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || ''}</p>
                </div>
              </div>

              {/* My Profile Button */}
              <button
                onClick={() => setActiveTab('profile')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 transition font-medium"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>My Profile &amp; Settings</span>
              </button>

              {/* Theme Toggle Button in Dropdown */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 transition font-medium"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Appearance Mode</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {(theme || 'dark').toUpperCase()}
                </span>
              </button>



              {/* Logout Option */}
              <div className="pt-2 mt-1 border-t border-slate-800">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-red-400 hover:bg-red-950/30 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
