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
    <header className="sticky top-0 z-40 bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-emerald-400 text-lg">
              EN
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                EmpireNexs
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                HQ OS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              YouTube Automation ERP • 3 Branches Unified
            </p>
          </div>
        </div>

        {/* Middle: Active Branch Switcher (Enabled for CEO, restricted for branch heads) */}
        <div className="flex items-center gap-2">
          {currentUser?.canAccessAllBranches ? (
            <div className="flex items-center bg-slate-900/80 border border-slate-700/80 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-2 font-medium flex items-center gap-1.5 hidden md:flex">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Branch:
              </span>
              <button
                onClick={() => setSelectedBranchId('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedBranchId === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Branches (HQ)
              </button>
              {BRANCHES.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all hidden lg:block ${
                    selectedBranchId === branch.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {branch.city}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200">
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
        <div className="flex items-center gap-2.5">
          {/* Quick Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors shadow-sm flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Google Sheets Live Sync Button */}
          <button
            onClick={async () => {
              await triggerGoogleSheetSync();
            }}
            disabled={isSyncingSheets}
            title="Sync with Google Sheets"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
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
