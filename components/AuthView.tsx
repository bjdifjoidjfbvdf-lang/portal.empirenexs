'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import { BranchId } from '@/types';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Percent,
  Check,
  FileText,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  Award,
  Zap,
  TrendingUp,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
];

export const AuthView: React.FC = () => {
  const { login, registerUser } = useApp();

  // Modal / Drawer state for Login or Apply
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register / Application state
  const [regJoiningType, setRegJoiningType] = useState<'PERCENTAGE' | 'SALARY'>('PERCENTAGE');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regBranch, setRegBranch] = useState<BranchId>('bahawalpur');
  const [regDesignation, setRegDesignation] = useState('Senior Video Editor');
  const [regAvatar, setRegAvatar] = useState(AVATARS[0]);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'pending';
    message: string;
  } | null>(null);

  const openLoginModal = () => {
    setAuthMode('LOGIN');
    setFeedback(null);
    setIsAuthModalOpen(true);
  };

  const openApplyModal = (type: 'PERCENTAGE' | 'SALARY' = 'PERCENTAGE') => {
    setRegJoiningType(type);
    setAuthMode('REGISTER');
    setFeedback(null);
    setIsAuthModalOpen(true);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const res = await login(loginIdentifier, loginPass);
      setIsLoading(false);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({ type: 'error', message: err?.message || 'Login failed. Please try again.' });
    }
  };

  // Handle Application Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPass.trim()) {
      setFeedback({ type: 'error', message: 'Full Name, Username, Gmail, and Password are required.' });
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setFeedback({ type: 'error', message: 'Please enter a valid Gmail / Email address.' });
      return;
    }

    if (regPass.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        name: regName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPass,
        phone: regPhone.trim(),
        address: regAddress.trim(),
        branchId: regBranch,
        designation: regDesignation,
        avatar: regAvatar,
        joiningType: regJoiningType,
      });

      setIsLoading(false);

      if (res.success) {
        if (res.requiresApproval) {
          setFeedback({
            type: 'pending',
            message: res.message || '🎉 Application Received! Your application has been submitted to Founder & CEO Waqas Gill. Your portal login will be activated upon approval.',
          });
        } else {
          setFeedback({ type: 'success', message: res.message });
        }
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({ type: 'error', message: err?.message || 'Submission failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. TOP HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#090e1a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-300 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg md:text-xl tracking-tight text-white">EmpireNexs</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                YouTube Automation Operations • Musafirkhana • Bahawalpur • Rahim Yar Khan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => openApplyModal('PERCENTAGE')}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join Our Team</span>
            </button>
            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 active:scale-95 transition shadow-lg shadow-emerald-500/25 border border-emerald-300"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
            <Award className="w-3.5 h-3.5" />
            <span>We Are Hiring • Multi-Branch Expansion 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Build &amp; Scale High-Growth{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
              YouTube Automation
            </span>{' '}
            Channels
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            EmpireNexs is an enterprise media powerhouse producing high-retention faceless documentaries, luxury culture stories, and tech breakdowns. Join our elite production teams today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => openApplyModal('PERCENTAGE')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 border border-emerald-300"
            >
              <Percent className="w-4 h-4" />
              <span>Join on Percentage Basis</span>
            </button>
            <button
              onClick={() => openApplyModal('SALARY')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white transition shadow-lg border border-slate-700 flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Join on Salary Basis</span>
            </button>
            <button
              onClick={openLoginModal}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-slate-800/40 transition flex items-center justify-center gap-1.5"
            >
              <span>Already a Member? Log In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium">Production Hubs</p>
              <p className="text-xl font-black text-white mt-0.5">3 Active Branches</p>
              <span className="text-[10px] text-emerald-400 font-mono">MFK • BWP • RYK</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium">Compensation Options</p>
              <p className="text-xl font-black text-white mt-0.5">2 Pathways</p>
              <span className="text-[10px] text-teal-400 font-mono">Profit Share / Monthly Pay</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium">Daily Operations</p>
              <p className="text-xl font-black text-white mt-0.5">Automated</p>
              <span className="text-[10px] text-blue-400 font-mono">Google Sheets + Nexs AI</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium">SMS Verification</p>
              <p className="text-xl font-black text-white mt-0.5">Real-Time</p>
              <span className="text-[10px] text-amber-400 font-mono">Hero-SMS API Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TWO JOINING PATHWAYS (PERCENTAGE VS SALARY) */}
      <section className="py-16 md:py-20 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Choose Your Joining Model</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            We offer two flexible career models tailored to your experience, dedication, and earning ambitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* PATHWAY 1: ON PERCENTAGE BASIS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border-2 border-emerald-500/40 shadow-2xl relative flex flex-col justify-between group hover:border-emerald-400 transition">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider">
              High Upside Potential
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Join on Percentage Basis</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Partner with EmpireNexs directly on assigned YouTube automation channels. Earn a recurring profit share from AdSense, sponsorships, and monetization scaling.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">What You Get:</p>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Uncapped Revenue Share:</strong> Direct cut of net channel revenues as views grow.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>EmpireNexs Resource Suite:</strong> Studio topics, researched scripts, and AI assets provided.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Performance Bonuses:</strong> Extra payouts on viral videos exceeding 100K+ organic views.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Weekly Analytics &amp; Strategy:</strong> Direct guidance from Branch Heads and CEO Waqas Gill.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => openApplyModal('PERCENTAGE')}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Apply for Percentage Partnership</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PATHWAY 2: ON SALARY BASIS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border-2 border-blue-500/40 shadow-2xl relative flex flex-col justify-between group hover:border-blue-400 transition">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold uppercase tracking-wider">
              Guaranteed Monthly Pay
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Join on Salary Basis</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Join our production staff on a dependable, fixed monthly salary. Work within our Musafirkhana, Bahawalpur, or Rahim Yar Khan teams with structured weekly output.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">What You Get:</p>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Guaranteed On-Time Salary:</strong> Direct transfer on the 1st of every month without delays.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Transparent Task Quotas:</strong> Fixed video editing or script deliverables managed in Google Sheets.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Branch Office Environment:</strong> High-speed workstation internet and dedicated editing rigs.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Quarterly Promotions:</strong> Fast-track progression to Senior Editor or Branch Team Lead.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => openApplyModal('SALARY')}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-blue-500 hover:bg-blue-400 text-slate-950 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>Apply for Monthly Salary Position</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RULES & REGULATIONS */}
      <section className="py-14 px-4 lg:px-8 border-t border-slate-800/60 bg-[#060a12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard Operating Procedures</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Rules &amp; Regulations for All Team Members</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
              Compliance with these standards is mandatory to maintain data integrity, channel security, and payout eligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1.5">
                <Shield className="w-4 h-4" />
                <span>1. Strict Non-Disclosure</span>
              </div>
              <p className="text-xs text-slate-300">
                All YouTube channel links, email credentials, niche sheets, and proprietary editing templates are confidential property of EmpireNexs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1.5">
                <FileText className="w-4 h-4" />
                <span>2. Google Sheets Live Sync</span>
              </div>
              <p className="text-xs text-slate-300">
                Every video milestone (Script, Audio, Cut, Thumbnail, Review) must be updated in the synchronized Google Sheets within 2 hours of completion.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1.5">
                <Phone className="w-4 h-4" />
                <span>3. Zero Duplicate Phone Numbers</span>
              </div>
              <p className="text-xs text-slate-300">
                YouTube phone numbers provisioned via Hero-SMS are locked forever per channel. Attempting re-verification with duplicate numbers is strictly forbidden.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1.5">
                <Building className="w-4 h-4" />
                <span>4. Branch Data Isolation</span>
              </div>
              <p className="text-xs text-slate-300">
                Team members operate strictly inside their assigned branch (Musafirkhana, Bahawalpur, or Rahim Yar Khan) under the direct supervision of their Branch Head.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1.5">
                <Zap className="w-4 h-4" />
                <span>5. Founder Approval Required</span>
              </div>
              <p className="text-xs text-slate-300">
                Every newly registered account remains in pending review. Operational credentials are only activated after authorization by Founder &amp; CEO Waqas Gill.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>6. Quotas &amp; Quality Benchmark</span>
              </div>
              <p className="text-xs text-slate-300">
                Videos must meet minimum 50% audience retention standards. Daily niche claim quotas (max 2 topics/day) must be respected by all team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCTION HUBS & LEADERSHIP */}
      <section className="py-14 px-4 lg:px-8 border-t border-slate-800/60 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white">EmpireNexs Leadership &amp; Hubs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Our multi-branch operations structure driving YouTube automation excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto text-xs">
          {/* Musafirkhana HQ */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Waqas Gill"
                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400"
              />
              <div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Headquarters
                </span>
                <p className="font-bold text-white text-sm mt-1">Waqas Gill</p>
                <p className="text-slate-400 text-[11px]">Founder &amp; CEO</p>
              </div>
            </div>
            <p className="text-slate-300 mt-3 pt-3 border-t border-slate-800">
              Oversees master systems, finance, API integrations, and final approval of all creator &amp; staff onboarding.
            </p>
          </div>

          {/* Bahawalpur Branch */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-xl">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Saim Chaudhry"
                className="w-12 h-12 rounded-xl object-cover border-2 border-blue-400"
              />
              <div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Branch Hub
                </span>
                <p className="font-bold text-white text-sm mt-1">Saim Chaudhry</p>
                <p className="text-slate-400 text-[11px]">Co-Founder / Head of Bahawalpur</p>
              </div>
            </div>
            <p className="text-slate-300 mt-3 pt-3 border-t border-slate-800">
              Directs Bahawalpur production hub, manages dedicated video editing pipelines, and mentors local creator talent.
            </p>
          </div>

          {/* Rahim Yar Khan Branch */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-xl">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                alt="Zainab Akhtar"
                className="w-12 h-12 rounded-xl object-cover border-2 border-purple-400"
              />
              <div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Branch Hub
                </span>
                <p className="font-bold text-white text-sm mt-1">Zainab Akhtar</p>
                <p className="text-slate-400 text-[11px]">Co-Founder / Head of Rahim Yar Khan</p>
              </div>
            </div>
            <p className="text-slate-300 mt-3 pt-3 border-t border-slate-800">
              Directs Rahim Yar Khan operations, script research, voiceover synchronization, and quality assurance.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto py-8 px-4 border-t border-slate-800 bg-[#040810] text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">
          EmpireNexs Management System &copy; {new Date().getFullYear()} • Enterprise YouTube Automation ERP
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Musafirkhana (HQ) • Bahawalpur • Rahim Yar Khan • Founder &amp; CEO Waqas Gill
        </p>
      </footer>

      {/* 7. AUTH / APPLICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[#0b101d] border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Tabs: Login vs Register / Apply */}
            <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setFeedback(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  authMode === 'LOGIN'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setFeedback(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  authMode === 'REGISTER'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Apply to Join Team</span>
              </button>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl mb-6 text-xs flex items-start gap-3 border ${
                  feedback.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : feedback.type === 'pending'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {feedback.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                ) : feedback.type === 'pending' ? (
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{feedback.message}</p>
                </div>
              </div>
            )}

            {/* A. LOGIN FORM */}
            {authMode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">Staff Member Portal Login</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your authorized EmpireNexs credentials to access your branch dashboard.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">
                    Username or Gmail
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. waqasgill or saimchaudhry"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Authenticate &amp; Enter Portal</span>
                    </>
                  )}
                </button>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-center mt-3">
                  🔐 Master Founder Login: <code className="text-emerald-400 font-bold">waqasgill</code>
                </div>
              </form>
            )}

            {/* B. REGISTER / APPLY FORM */}
            {authMode === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div>
                  <h3 className="text-lg font-black text-white">Join EmpireNexs Team</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Submit your application. Your account will be activated after review by Founder &amp; CEO Waqas Gill.
                  </p>
                </div>

                {/* Joining Model Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">
                    Select Preferred Joining Model
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegJoiningType('PERCENTAGE')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        regJoiningType === 'PERCENTAGE'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Percent className="w-3.5 h-3.5" />
                        <span>Percentage Basis</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Profit share per channel</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegJoiningType('SALARY')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        regJoiningType === 'SALARY'
                          ? 'bg-blue-500/15 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Salary Basis</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Fixed monthly pay</p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ali Raza"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Unique Username</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="e.g. ali_editor"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Gmail Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Create Password</label>
                    <input
                      type="password"
                      required
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">WhatsApp / Phone</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Branch Office</label>
                    <select
                      value={regBranch}
                      onChange={(e) => setRegBranch(e.target.value as BranchId)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="bahawalpur">Bahawalpur Hub (Saim Chaudhry)</option>
                      <option value="rahim-yar-khan">Rahim Yar Khan Hub (Zainab Akhtar)</option>
                      <option value="musafirkhana">Musafirkhana HQ (Waqas Gill)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Target Role / Skill</label>
                  <select
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Senior Video Editor">Senior Video Editor (Premiere / After Effects)</option>
                    <option value="YouTube Scriptwriter">YouTube Scriptwriter (High-Retention Documentaries)</option>
                    <option value="Thumbnail Designer">Thumbnail Designer (Photoshop Master)</option>
                    <option value="Voiceover Artist">Voiceover Artist (Urdu / English)</option>
                    <option value="Channel Operations Manager">Channel Operations Manager</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Application for CEO Approval</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
