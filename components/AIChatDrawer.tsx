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
  Lock,
  Layers,
  HelpCircle,
  Settings,
} from 'lucide-react';

export const AIChatDrawer: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    sendMessageToAI,
    clearChatHistory,
    currentUser,
    settings,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen]);

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
    'Give me a Tech niche topic (Quota: 2/day)',
    'Request a YouTube verification OTP number',
    'Channels Vault latest summary',
    'Give me a Luxury niche topic',
    'EmpireNexs branches hierarchy and SOPs',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0b1120] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
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
                  Sheets Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to Channels Vault &amp; Niches Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChatHistory}
              title="Clear chat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* System Instructions Banner */}
        <div className="px-4 py-2 bg-emerald-950/20 border-b border-emerald-500/10 flex items-center justify-between text-[11px] text-emerald-300/90">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              Active User: <strong>{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            RBAC Protected
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
                    <span className="font-bold">{isUser ? currentUser.name : 'Nexs AI'}</span>
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
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-400/40 shrink-0 mt-0.5"
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Pills */}
        <div className="p-3 border-t border-slate-800 bg-[#090d16]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            Quick Sheet Lookups:
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
            placeholder="Ask AI (e.g. Find channel credentials, Luxury video status, OTP rules)..."
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
      </div>
    </div>
  );
};
