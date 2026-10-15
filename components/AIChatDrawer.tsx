'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/storeContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ExternalLink,
  Shield,
  FileSpreadsheet,
  Trash2,
  HelpCircle,
  Users,
  Search,
  RefreshCw,
  MessageSquare,
  Calendar,
  User,
  Clock,
  Filter,
} from 'lucide-react';
import { ChatLogEntry } from '@/types';

export const AIChatDrawer: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    sendMessageToAI,
    clearChatHistory,
    currentUser,
    availableUsers,
    teamChatLogs,
    fetchTeamChatLogs,
  } = useApp();

  // Mode: 'my-chat' or 'team-monitor' (Admin exclusive)
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [activeMode, setActiveMode] = useState<'my-chat' | 'team-monitor'>('my-chat');

  // Input query & sending state
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Team Chat Monitor filter states (for Founder & CEO Waqas Gill)
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen && activeMode === 'my-chat') {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen, activeMode]);

  // Load team logs when switching to monitor mode or changing filters
  useEffect(() => {
    if (isChatOpen && activeMode === 'team-monitor' && isSuperAdmin) {
      loadLogs();
    }
  }, [isChatOpen, activeMode, selectedUserId, selectedMonth]);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      await fetchTeamChatLogs(selectedUserId, selectedMonth);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  if (!isChatOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isSending) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setIsSending(true);

    try {
      await sendMessageToAI(query);
    } finally {
      setIsSending(false);
    }
  };

  const quickQuestions = [
    'Assalam o Alaikum! Kaise hain?',
    'Give me a Tech niche topic',
    'Request YouTube verification OTP number',
    'Kitne channel sell huay? (Monthly Sales)',
    'EmpireNexs branches hierarchy & SOPs',
  ];

  // Filter team chat logs by search query
  const filteredTeamLogs = teamChatLogs.filter((log) => {
    if (!logSearchQuery.trim()) return true;
    const q = logSearchQuery.toLowerCase();
    return (
      log.text.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.userEmail.toLowerCase().includes(q) ||
      (log.branchId && log.branchId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0b1120] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Nexs AI Assistant</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Sheets &amp; DB Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to Channels Vault, Niches &amp; Real OTP Numbers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeMode === 'my-chat' && (
              <button
                onClick={clearChatHistory}
                title="Clear my chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Super Admin Tab Switcher: My Chat vs Team Chat Monitor */}
        {isSuperAdmin && (
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/80 flex items-center gap-2">
            <button
              onClick={() => setActiveMode('my-chat')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeMode === 'my-chat'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>My AI Chat</span>
            </button>
            <button
              onClick={() => setActiveMode('team-monitor')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeMode === 'team-monitor'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-amber-300/80 hover:text-amber-200 border border-amber-500/30'
              }`}
              title="Founder & CEO View: Monitor all team chat history with AI"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Team Chat Monitor (CEO)</span>
            </button>
          </div>
        )}

        {/* MODE 1: MY ACTIVE AI CHAT */}
        {activeMode === 'my-chat' && (
          <>
            {/* User Profile Banner */}
            <div className="px-4 py-2 bg-emerald-950/20 border-b border-emerald-500/10 flex items-center justify-between text-[11px] text-emerald-300/90">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Active User: <strong>{currentUser?.name || 'User'}</strong> ({currentUser?.role || 'SUPER_ADMIN'})
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                Persistent Chat
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 text-xs leading-relaxed ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                        isUser
                          ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                        <span className="font-bold">{isUser ? (currentUser?.name || 'User') : 'Nexs AI'}</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Message Text with markdown line breaks */}
                      <div className="whitespace-pre-wrap space-y-1">
                        {msg.text.split('\n').map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>

                      {/* Rich Fetched Items Cards (Channel links or sheet rows) */}
                      {msg.fetchedItems && msg.fetchedItems.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <FileSpreadsheet className="w-3 h-3" />
                            Fetched From Sheet / DB:
                          </p>
                          {msg.fetchedItems.map((item, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                            >
                              <div className="truncate">
                                <p className="font-bold text-white truncate">{item.title}</p>
                                {item.details && (
                                  <p className="text-[10px] text-slate-400 truncate">{item.details}</p>
                                )}
                              </div>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] flex items-center gap-1 shrink-0"
                                >
                                  <span>Open</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <img
                        src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={currentUser?.name || 'User'}
                        className="w-7 h-7 rounded-lg object-cover border border-emerald-400/40 shrink-0 mt-0.5"
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Question Interactive Pills */}
            <div className="p-3 border-t border-slate-800 bg-[#090d16]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-400" />
                Quick Suggestions:
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(q);
                      sendMessageToAI(q);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Salam kahein, OTP number mangain, ya niche topic poochein..."
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isSending}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {/* MODE 2: TEAM CHAT MONITOR (EXCLUSIVE FOR FOUNDER WAQAS GILL) */}
        {activeMode === 'team-monitor' && isSuperAdmin && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Controls Header */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Team Conversations Cloud Archive
                </span>
                <button
                  onClick={loadLogs}
                  disabled={isLoadingLogs}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Refresh from cloud database"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Select Employee & Month Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Select Team Member:
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Team Members ({availableUsers.length})</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (@{u.username || 'user'}) - {u.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Select Month:
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={currentMonthStr}>Current Month ({currentMonthStr})</option>
                    <option value="2026-09">September 2026</option>
                    <option value="2026-08">August 2026</option>
                    <option value="all">All Time Records</option>
                  </select>
                </div>
              </div>

              {/* Keyword Search in Chat */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Search in team messages (e.g. OTP, Vikzai, Password, Channel)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Team Messages Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080c14]">
              {isLoadingLogs ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <p>Loading team chat transcripts from Cloud DB...</p>
                </div>
              ) : filteredTeamLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-semibold text-slate-300">No Chat Records Found</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {selectedUserId !== 'all'
                      ? `Selected team member has not interacted with Nexs AI in ${selectedMonth}.`
                      : 'No conversation history logged for the selected period.'}
                  </p>
                </div>
              ) : (
                filteredTeamLogs.map((log) => {
                  const isUser = log.sender === 'user';
                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                        isUser
                          ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                          : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      }`}
                    >
                      {/* Log Header: User identity, Branch & Timestamp */}
                      <div className="flex items-center justify-between text-[10px] border-b border-slate-800/80 pb-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          {isUser ? (
                            <User className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Bot className="w-3 h-3 text-emerald-400" />
                          )}
                          <span className={isUser ? 'text-white' : 'text-emerald-400'}>
                            {isUser ? log.userName : 'Nexs AI Bot'}
                          </span>
                          {isUser && log.branchId && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono text-[9px] uppercase">
                              {log.branchId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{log.timestamp}</span>
                          {log.createdAt && (
                            <span className="opacity-60">({log.createdAt.split('T')[0]})</span>
                          )}
                        </div>
                      </div>

                      {/* Log Message Content */}
                      <div className="whitespace-pre-wrap text-[11px]">
                        {log.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Status */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>
                Total Messages: <strong className="text-white">{filteredTeamLogs.length}</strong>
              </span>
              <span className="text-amber-400 font-medium">
                Founder Supervision Active
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
