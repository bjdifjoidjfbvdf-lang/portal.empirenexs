'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DashboardOverview } from '@/components/DashboardOverview';
import { ChannelsVault } from '@/components/ChannelsVault';
import { NichesHub } from '@/components/NichesHub';
import { BranchesAndTeams } from '@/components/BranchesAndTeams';
import { SettingsView } from '@/components/SettingsModal';
import { OTPManager } from '@/components/OTPManager';
import { AIChatDrawer } from '@/components/AIChatDrawer';
import { AuthView } from '@/components/AuthView';
import { UserProfileSettings } from '@/components/UserProfileSettings';
import { MonthlyCalculations } from '@/components/MonthlyCalculations';
import { BranchComparisonAnalytics } from '@/components/BranchComparisonAnalytics';
import { useApp } from '@/lib/storeContext';
import { Sparkles, Bot } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { setIsChatOpen, isAuthenticated } = useApp();

  // If visitor is not logged in, render the official public landing & team onboarding page
  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardOverview onNavigate={setActiveTab} />}
            {activeTab === 'branch-analytics' && <BranchComparisonAnalytics />}
            {activeTab === 'monthly-calc' && <MonthlyCalculations />}
            {activeTab === 'channels' && <ChannelsVault />}
            {activeTab === 'niches' && <NichesHub />}
            {activeTab === 'team' && <BranchesAndTeams />}
            {activeTab === 'otp' && <OTPManager />}
            {activeTab === 'profile' && <UserProfileSettings />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Floating AI Chat Trigger Pill */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-emerald-300"
      >
        <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
        </div>
        <span className="text-xs uppercase tracking-wider font-extrabold">Ask Nexs AI</span>
        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
      </button>

      {/* AI Assistant Chat Drawer */}
      <AIChatDrawer />
    </div>
  );
}
