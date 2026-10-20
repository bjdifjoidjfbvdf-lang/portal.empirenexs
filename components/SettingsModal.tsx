'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import {
  Settings,
  FileSpreadsheet,
  Bot,
  Key,
  Save,
  Check,
  RefreshCw,
  Sparkles,
  Globe,
  Lock,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, triggerGoogleSheetSync, isSyncingSheets, currentUser } = useApp();

  const isPrivileged = currentUser?.role === 'SUPER_ADMIN' || currentUser?.id === 'user-waqas';

  const [channelsUrl, setChannelsUrl] = useState(settings.googleSheetChannelsUrl);
  const [nichesUrl, setNichesUrl] = useState(settings.googleSheetNichesUrl);
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [systemPrompt, setSystemPrompt] = useState(settings.aiSystemPrompt);
  const [proxy6ApiKey, setProxy6ApiKey] = useState(settings.proxy6ApiKey || '');
  const [testingProxy6, setTestingProxy6] = useState(false);
  const [proxy6Feedback, setProxy6Feedback] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isPrivileged) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl max-w-lg mx-auto my-12 space-y-3">
        <Lock className="w-8 h-8 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400">
          API configurations and system settings are strictly reserved for Founder &amp; CEO Waqas Gill.
        </p>
      </div>
    );
  }

  const handleTestProxy6 = async () => {
    setTestingProxy6(true);
    setProxy6Feedback(null);
    try {
      if (proxy6ApiKey !== settings.proxy6ApiKey) {
        updateSettings({ proxy6ApiKey: proxy6ApiKey.trim() });
      }
      const res = await fetch(`/api/proxy6?action=balance&apiKey=${encodeURIComponent(proxy6ApiKey.trim())}`);
      const data = await res.json();
      if (data.status === 'yes' || data.balance !== undefined) {
        setProxy6Feedback(`Connected successfully! Current Dedicated IP Balance: $${Number(data.balance || 0).toFixed(2)} USD`);
        updateSettings({ proxyBalance: Number(data.balance || 0) });
      } else {
        setProxy6Feedback(`Notice: ${data.error || 'Failed to connect. Check API key.'}`);
      }
    } catch (err: any) {
      setProxy6Feedback(`Connection failed: ${err.message}`);
    } finally {
      setTestingProxy6(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      googleSheetChannelsUrl: channelsUrl,
      googleSheetNichesUrl: nichesUrl,
      geminiApiKey: apiKey,
      aiSystemPrompt: systemPrompt,
      proxy6ApiKey: proxy6ApiKey.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Settings &amp; Sheet Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure live Google Sheets URLs, AI model instructions, and Google Gemini API keys.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Google Sheets URLs */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Connected Google Sheets
            </h2>
            <button
              type="button"
              onClick={() => triggerGoogleSheetSync()}
              disabled={isSyncingSheets}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheets ? 'Testing Sync...' : 'Test Sheet Connection'}</span>
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Channels List Google Sheet URL:
            </label>
            <input
              type="url"
              value={channelsUrl}
              onChange={(e) => setChannelsUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/your-channel-sheet-id/edit"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Columns: Name/Link, Status, Email, Password, 2 FA, Managed By, Manager Mail, Backup Codes, Created Number, PUB ID, Owner, Dedicated IP.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Niches Hub Google Sheet URL (Multi-Tabs):
            </label>
            <input
              type="url"
              value={nichesUrl}
              onChange={(e) => setNichesUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/your-niches-sheet-id/edit"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Single master workbook containing dedicated worksheets (tabs) categorized by niche and content topic.
            </p>
          </div>
        </div>

        {/* AI Model System Prompt & Instructions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">AI Model Instructions &amp; System Prompt</h2>
          </div>
          <p className="text-slate-400 text-xs">
            Define custom operational instructions for the AI assistant (auto-replies, business rules, policies, tone):
          </p>

          <div>
            <textarea
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Gemini API Key */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Google Gemini API Key (Optional)</h2>
          </div>
          <p className="text-slate-400 text-xs">
            Enter your Google Gemini API key for real-time generative intelligence (fallback built-in assistant engine activates if left empty).
          </p>
          <div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Hero-SMS API Configuration */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Hero-SMS Integration (hero-sms.com)</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Philippines (+63) Direct Carrier Route
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Enter your Hero-SMS API Key to provision live phone numbers for YouTube and Gmail phone verification:
          </p>
          <div>
            <input
              type="password"
              value={settings.heroSmsApiKey || ''}
              onChange={(e) => updateSettings({ heroSmsApiKey: e.target.value })}
              placeholder="e.g. 74892019ab9281c9201..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Endpoint: <code>https://hero-sms.com/stubs/handler_api.php</code> • Service: <code>go</code> (Google/YouTube) • Country: <code>4</code> (Philippines)
            </p>
          </div>
        </div>

        {/* Dedicated Proxy API Configuration */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Dedicated Proxy Provider API (Private Datacenter Network)</h2>
            </div>
            <button
              type="button"
              onClick={handleTestProxy6}
              disabled={testingProxy6 || !proxy6ApiKey.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingProxy6 ? 'animate-spin' : ''}`} />
              <span>{testingProxy6 ? 'Checking...' : 'Check Balance'}</span>
            </button>
          </div>
          <p className="text-slate-400 text-xs">
            Enter your Private Datacenter Proxy Provider API Key to enable automated provisioning of dedicated IPv4 proxies for team YouTube channels:
          </p>
          <div>
            <input
              type="password"
              value={proxy6ApiKey}
              onChange={(e) => setProxy6ApiKey(e.target.value)}
              placeholder="e.g. 81a0b5f12e-9d22a8..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Automated 30-day dedicated IPv4 proxies with HTTP/SOCKS5 authentication. Zero provider branding visible to employees.
            </p>
          </div>

          {proxy6Feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono border ${
                proxy6Feedback.includes('successfully')
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
              }`}
            >
              {proxy6Feedback}
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Settings saved successfully!
            </span>
          )}
          {!savedSuccess && <div></div>}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
