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
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, triggerGoogleSheetSync, isSyncingSheets } = useApp();

  const [channelsUrl, setChannelsUrl] = useState(settings.googleSheetChannelsUrl);
  const [nichesUrl, setNichesUrl] = useState(settings.googleSheetNichesUrl);
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [systemPrompt, setSystemPrompt] = useState(settings.aiSystemPrompt);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      googleSheetChannelsUrl: channelsUrl,
      googleSheetNichesUrl: nichesUrl,
      geminiApiKey: apiKey,
      aiSystemPrompt: systemPrompt,
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
              Philippines (+63) Fixed @ $0.024
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
