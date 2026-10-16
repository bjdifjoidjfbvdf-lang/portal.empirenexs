'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/storeContext';
import {
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Camera,
  Upload,
  Check,
  Lock,
  Moon,
  Sun,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

export const UserProfileSettings: React.FC = () => {
  const { currentUser, updateUserProfile, changeUserPassword, theme, setTheme } = useApp();

  // Profile form state
  const [name, setName] = useState(currentUser?.name || 'Waqas Gill');
  const [username, setUsername] = useState(currentUser?.username || 'waqasgill');
  const isWaqasUser = currentUser?.role === 'SUPER_ADMIN' || currentUser?.id === 'user-waqas';
  const [phone, setPhone] = useState(currentUser?.phone || (isWaqasUser ? '+923075203713' : ''));
  const [address, setAddress] = useState(currentUser?.address || '');
  const [designation, setDesignation] = useState(currentUser?.designation || 'Founder & CEO');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );
  const [personalSheetUrl, setPersonalSheetUrl] = useState(currentUser?.personalGoogleSheetUrl || '');
  const [personalSheetApiKey, setPersonalSheetApiKey] = useState(currentUser?.personalGoogleSheetApiKey || '');

  useEffect(() => {
    if (currentUser) {
      const isWaqas = currentUser.role === 'SUPER_ADMIN' || currentUser.id === 'user-waqas';
      setName(currentUser.name || 'Waqas Gill');
      setUsername(currentUser.username || 'waqasgill');
      setPhone(currentUser.phone && currentUser.phone !== '+92 300 0000000' ? currentUser.phone : (isWaqas ? '+923075203713' : ''));
      setAddress(currentUser.address || '');
      setDesignation(currentUser.designation || 'Founder & CEO');
      setAvatar(
        currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      );
      setPersonalSheetUrl(currentUser.personalGoogleSheetUrl || '');
      setPersonalSheetApiKey(currentUser.personalGoogleSheetApiKey || '');
    }
  }, [currentUser]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status and feedback
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileFeedback({ type: 'error', message: 'Please select a valid image file (PNG, JPG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileFeedback({ type: 'error', message: 'Image file size must be less than 5 MB.' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rawResult = reader.result as string;
        // Create an Image element to downscale for avatar size
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 256;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
              setAvatar(compressedDataUrl);
              setIsUploading(false);
              updateUserProfile({ avatar: compressedDataUrl });
              setProfileFeedback({ type: 'success', message: 'Profile picture uploaded and updated successfully!' });
            } else {
              setAvatar(rawResult);
              setIsUploading(false);
              updateUserProfile({ avatar: rawResult });
              setProfileFeedback({ type: 'success', message: 'Profile picture updated successfully!' });
            }
          } catch (canvasErr) {
            console.warn('Canvas resize error:', canvasErr);
            setAvatar(rawResult);
            setIsUploading(false);
            updateUserProfile({ avatar: rawResult });
            setProfileFeedback({ type: 'success', message: 'Profile picture updated successfully!' });
          }
        };
        img.onerror = () => {
          setIsUploading(false);
          setProfileFeedback({ type: 'error', message: 'Could not process the selected image.' });
        };
        img.src = rawResult;
      } catch (err) {
        setIsUploading(false);
        setProfileFeedback({ type: 'error', message: 'Failed to process image file.' });
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      setProfileFeedback({ type: 'error', message: 'Failed to read image file.' });
    };
    reader.readAsDataURL(file);
  };

  // Save profile info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    if (!name.trim()) {
      setProfileFeedback({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    if (!username.trim()) {
      setProfileFeedback({ type: 'error', message: 'Username cannot be empty.' });
      return;
    }

    const res = updateUserProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      designation: designation.trim(),
      avatar,
      personalGoogleSheetUrl: personalSheetUrl.trim(),
      personalGoogleSheetApiKey: personalSheetApiKey.trim(),
    });

    if (res.success) {
      setProfileFeedback({ type: 'success', message: res.message });
    } else {
      setProfileFeedback({ type: 'error', message: res.message });
    }
  };

  // Save password change
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Please enter your current password.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New passwords do not match. Please verify.' });
      return;
    }

    const res = changeUserPassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordFeedback({ type: 'success', message: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            User Profile &amp; Account Settings
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {(currentUser?.role || 'SUPER_ADMIN').replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal identity, upload or change your avatar, adjust system appearance (Light / Dark Mode), and maintain account security.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Appearance Card */}
        <div className="space-y-6">
          {/* Avatar Profile Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl text-center relative overflow-hidden">
            <div className="relative inline-block mx-auto mb-4 group">
              <img
                src={avatar}
                alt={name}
                className="w-28 h-28 rounded-3xl object-cover border-4 border-emerald-500/40 shadow-2xl transition group-hover:brightness-90"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition text-xs font-semibold gap-1 backdrop-blur-xs"
                title="Click to upload image"
              >
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Upload Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <h2 className="text-lg font-black text-white">{name}</h2>
            <p className="text-xs text-emerald-400 font-mono">@{username || 'user'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{designation}</p>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {currentUser?.role || 'SUPER_ADMIN'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                {(currentUser?.branchId || 'HQ').toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>

            {/* Quick Upload Button */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading Image...' : 'Upload New Picture'}</span>
              </button>

              {/* Preset Avatars Row */}
              <div className="pt-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                  Or Pick a Preset Avatar:
                </p>
                <div className="flex items-center justify-center gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset);
                        updateUserProfile({ avatar: preset });
                        setProfileFeedback({ type: 'success', message: 'Preset avatar selected!' });
                      }}
                      className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition hover:scale-110 ${
                        avatar === preset ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-slate-700'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theme & Display Mode Toggle Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                System Theme &amp; Appearance
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {theme.toUpperCase()} MODE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Toggle between Dark Mode (high contrast obsidian for video workflows) and Light Mode (crisp slate for day operations).
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Dark Mode</p>
                  <p className="text-[10px] text-slate-400">Deep obsidian &amp; neon</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  theme === 'light'
                    ? 'bg-white border-emerald-500 shadow-md shadow-emerald-500/20 text-slate-950'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Light Mode</p>
                  <p className="text-[10px] text-slate-500">Crisp slate &amp; clarity</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (2 spans): Personal Details & Password Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-emerald-400" />
              Personal &amp; Contact Details
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Update your corporate identity, contact coordinates, and branch information.
            </p>

            {profileFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  profileFeedback.type === 'success'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-950/40 text-red-300 border-red-500/30'
                }`}
              >
                {profileFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Waqas Gill"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username (@handle) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="waqasgill"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Verified Gmail Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed font-mono"
                    title="Email is verified and linked to your corporate security identity"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Verified with Google OTP authentication</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    WhatsApp / Contact Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Office Address / City
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="EmpireNexs HQ, Musafirkhana"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Founder & CEO"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Personal Google Sheet & Data Isolation Settings */}
                <div className="sm:col-span-2 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <label className="text-slate-200 font-bold">Personal Google Sheet (Your Private Isolation Sheet)</label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                      Strict Multi-User Isolation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    Students &amp; creators maintain their own dedicated Google Sheets. The channels you import or sync here belong strictly to your private workspace. Other creators cannot see your channels, passwords, or backup codes.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                        Personal Google Sheet Link (CSV / Share Link)
                      </label>
                      <input
                        type="url"
                        value={personalSheetUrl}
                        onChange={(e) => setPersonalSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/export?format=csv"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                        Personal API Key / Webhook (Optional)
                      </label>
                      <input
                        type="text"
                        value={personalSheetApiKey}
                        onChange={(e) => setPersonalSheetApiKey(e.target.value)}
                        placeholder="Optional Google Apps Script API token"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px] transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Form */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-emerald-400" />
              Security &amp; Password Update
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Change your login password. Passwords should be at least 6 characters long.
            </p>

            {passwordFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-950/40 text-red-300 border-red-500/30'
                }`}
              >
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
