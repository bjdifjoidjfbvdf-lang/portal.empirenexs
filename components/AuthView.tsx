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
  KeyRound,
  ShieldCheck,
  Phone,
  MapPin,
  AtSign,
  Image,
  RefreshCw,
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
  const { login, registerUser, sendEmailOTP, verifyEmailOTP, resetPasswordWithOTP } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form state
  const [registerStep, setRegisterStep] = useState<'FORM' | 'OTP' | 'PENDING_DONE'>('FORM');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regBranch, setRegBranch] = useState<BranchId>('bahawalpur');
  const [regDesignation, setRegDesignation] = useState('Senior Video Editor');
  const [regAvatar, setRegAvatar] = useState(AVATARS[0]);
  const [regOtp, setRegOtp] = useState('');
  const [sentOtpHint, setSentOtpHint] = useState<string | null>(null);

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP_NEW_PASS'>('EMAIL');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotOtpHint, setForgotOtpHint] = useState<string | null>(null);

  // Loading & Feedback messages
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'pending';
    message: string;
  } | null>(null);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = login(loginIdentifier, loginPass);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Step 1: Request OTP for Signup
  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPass.trim()) {
      setFeedback({ type: 'error', message: 'Full Name, Username, Gmail, and Password are required.' });
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setFeedback({ type: 'error', message: 'Please enter a valid Gmail address.' });
      return;
    }

    setIsLoading(true);
    const otpRes = await sendEmailOTP(regEmail.trim(), 'SIGNUP');
    setIsLoading(false);

    if (otpRes.success) {
      setSentOtpHint(otpRes.otp || null);
      setRegisterStep('OTP');
      setFeedback({
        type: 'success',
        message: otpRes.message + (otpRes.otp ? ` [Dev Mode OTP: ${otpRes.otp}]` : ''),
      });
    } else {
      setFeedback({ type: 'error', message: otpRes.message });
    }
  };

  // Step 2: Verify OTP & Submit Registration for Approval
  const handleVerifyRegisterOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!regOtp.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the 6-digit OTP verification code.' });
      return;
    }

    setIsLoading(true);
    const verifyRes = await verifyEmailOTP(regEmail.trim(), regOtp.trim(), 'SIGNUP');
    setIsLoading(false);

    if (!verifyRes.success) {
      setFeedback({ type: 'error', message: verifyRes.message });
      return;
    }

    // OTP Verified! Now register user as PENDING
    const regRes = registerUser({
      name: regName.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPass,
      phone: regPhone.trim(),
      address: regAddress.trim(),
      branchId: regBranch,
      designation: regDesignation,
      avatar: regAvatar,
    });

    if (regRes.success) {
      if (!regRes.requiresApproval) {
        // Direct Super Admin instant activation & login
        return;
      }
      setRegisterStep('PENDING_DONE');
      setFeedback({
        type: 'pending',
        message: regRes.message,
      });
    } else {
      setFeedback({ type: 'error', message: regRes.message });
    }
  };

  // Forgot Password Step 1: Send OTP
  const handleForgotSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!forgotEmail.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your registered Gmail address.' });
      return;
    }

    setIsLoading(true);
    const otpRes = await sendEmailOTP(forgotEmail.trim(), 'FORGOT_PASSWORD');
    setIsLoading(false);

    if (otpRes.success) {
      setForgotOtpHint(otpRes.otp || null);
      setForgotStep('OTP_NEW_PASS');
      setFeedback({
        type: 'success',
        message: otpRes.message + (otpRes.otp ? ` [Dev Mode OTP: ${otpRes.otp}]` : ''),
      });
    } else {
      setFeedback({ type: 'error', message: otpRes.message });
    }
  };

  // Forgot Password Step 2: Verify & Reset
  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!forgotOtp.trim() || !forgotNewPass.trim()) {
      setFeedback({ type: 'error', message: 'Please enter both the OTP code and your new password.' });
      return;
    }

    setIsLoading(true);
    const res = await resetPasswordWithOTP(forgotEmail.trim(), forgotOtp.trim(), forgotNewPass);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setMode('LOGIN');
        setLoginIdentifier(forgotEmail.trim());
        setLoginPass('');
        setForgotStep('EMAIL');
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleQuickLogin = (identifier: string, pass: string) => {
    setLoginIdentifier(identifier);
    setLoginPass(pass);
    login(identifier, pass);
  };

  return (
    <div className="min-h-screen bg-[#060911] flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#0b1120]/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-[2px] shadow-xl shadow-emerald-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-2xl">
              EN
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">EmpireNexs Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            YouTube Automation ERP • Secure Role-Based Access Control
          </p>
        </div>

        {/* Auth Mode Tabs */}
        {mode !== 'FORGOT_PASSWORD' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6 text-xs font-bold">
            <button
              onClick={() => {
                setMode('LOGIN');
                setFeedback(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'LOGIN'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('REGISTER');
                setRegisterStep('FORM');
                setFeedback(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'REGISTER'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Request Access (Sign Up)
            </button>
          </div>
        )}

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`mb-5 p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              feedback.type === 'error'
                ? 'bg-red-950/40 border-red-500/30 text-red-300'
                : feedback.type === 'pending'
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            {feedback.type === 'pending' && <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            <div className="flex-1">{feedback.message}</div>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-emerald-400" />
                Username or Gmail Address
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="waqasgill or muhammadwaqasmwg@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('FORGOT_PASSWORD');
                    setForgotStep('EMAIL');
                    setFeedback(null);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>Secure Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FLOW (Step 1: Form -> Step 2: OTP -> Step 3: Pending) */}
        {mode === 'REGISTER' && registerStep === 'FORM' && (
          <form onSubmit={handleRegisterFormSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Approval Workflow:</strong> An OTP verification code will be sent to your Gmail. Once verified, Founder <strong>Waqas Gill</strong> must approve your account before it is activated.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Mubashir Hassan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-emerald-400" />
                  Unique Username
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="mubashir_editor"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Gmail Address (For OTP Verification)
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="mubashir@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Create Password
              </label>
              <input
                type="password"
                required
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp / Phone
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Address / City
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Bahawalpur"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  Branch
                </label>
                <select
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value as BranchId)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="bahawalpur">Bahawalpur</option>
                  <option value="rahim-yar-khan">Rahim Yar Khan</option>
                  <option value="musafirkhana">Musafirkhana (HQ)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  Designation
                </label>
                <select
                  value={regDesignation}
                  onChange={(e) => setRegDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="Senior Video Editor">Senior Video Editor</option>
                  <option value="Scriptwriter">Scriptwriter</option>
                  <option value="Voiceover Specialist">Voiceover Specialist</option>
                  <option value="Thumbnail Designer">Thumbnail Designer</option>
                  <option value="Channel Manager">Channel Manager</option>
                </select>
              </div>
            </div>

            {/* Profile Avatar Selection */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-emerald-400" />
                Select Profile Avatar
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                {AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRegAvatar(av)}
                    className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all shrink-0 ${
                      regAvatar === av ? 'border-emerald-400 scale-110 shadow-lg shadow-emerald-500/30' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Sending Gmail OTP...</span>
              ) : (
                <>
                  <span>Send Verification OTP to Gmail</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTRATION STEP 2: ENTER GMAIL OTP */}
        {mode === 'REGISTER' && registerStep === 'OTP' && (
          <form onSubmit={handleVerifyRegisterOTP} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-center">
              <Mail className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              <p className="font-bold text-sm text-white">Gmail Verification</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                A 6-digit OTP code has been sent to your Gmail: <strong className="text-emerald-400">{regEmail}</strong>.
              </p>
              {sentOtpHint && (
                <div className="mt-2 py-1 px-3 bg-slate-900 border border-emerald-500/40 rounded-lg inline-block text-[11px] font-mono text-emerald-300">
                  Verification Code: <strong className="text-white text-xs">{sentOtpHint}</strong>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={regOtp}
                onChange={(e) => setRegOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRegisterStep('FORM')}
                className="w-1/3 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verifying...' : 'Verify & Submit'}
              </button>
            </div>
          </form>
        )}

        {/* REGISTRATION STEP 3: PENDING APPROVAL CONFIRMATION */}
        {mode === 'REGISTER' && registerStep === 'PENDING_DONE' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gmail Verified Successfully!</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed px-2">
                Your email has been verified. Under security policy, your profile has been submitted to Founder &amp; CEO <strong>Waqas Gill</strong> for approval.
              </p>
              <p className="text-[11px] text-amber-400 font-semibold mt-2">
                As soon as your account is approved, you will be able to log in with your username or email and password.
              </p>
            </div>
            <button
              onClick={() => {
                setMode('LOGIN');
                setFeedback(null);
              }}
              className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* 3. FORGOT PASSWORD FLOW */}
        {mode === 'FORGOT_PASSWORD' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Reset Password
              </h3>
              <button
                onClick={() => {
                  setMode('LOGIN');
                  setFeedback(null);
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            {forgotStep === 'EMAIL' && (
              <form onSubmit={handleForgotSendOTP} className="space-y-3.5">
                <p className="text-slate-300 text-xs">
                  Enter your registered Gmail address. We will send a 6-digit OTP code to verify and reset your password.
                </p>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@empirenexs.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? 'Sending OTP...' : 'Send Reset OTP to Gmail'}
                </button>
              </form>
            )}

            {forgotStep === 'OTP_NEW_PASS' && (
              <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                  OTP sent to <strong>{forgotEmail}</strong>
                  {forgotOtpHint && (
                    <div className="mt-1 font-mono text-[11px] text-white">
                      Dev Code: <strong>{forgotOtpHint}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? 'Resetting...' : 'Confirm & Reset Password'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>256-Bit Encrypted Google Sheets &amp; Channels Gateway</span>
          </p>
        </div>
      </div>
    </div>
  );
};
