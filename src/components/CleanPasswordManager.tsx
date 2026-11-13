'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Wand2, 
  ExternalLink, 
  Trash2, 
  CheckCircle2,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { VaultItem } from '@/types';
import { generateStrongPassword } from '@/lib/crypto';

interface CleanPasswordManagerProps {
  item: VaultItem;
  onUpdateItem: (updated: VaultItem) => void;
  onDeleteItem: (id: string) => void;
  onBack?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function CleanPasswordManager({
  item,
  onUpdateItem,
  onDeleteItem,
  onBack,
  isSidebarCollapsed,
  onToggleSidebar,
}: CleanPasswordManagerProps) {
  const [title, setTitle] = useState(item.title);
  const [username, setUsername] = useState(item.credential?.username || '');
  const [password, setPassword] = useState(item.credential?.password || '');
  const [website, setWebsite] = useState(item.credential?.website || '');
  const [notes, setNotes] = useState(item.credential?.notes || item.content || '');

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState(false);
  const titleRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  useEffect(() => {
    setTitle(item.title);
    setUsername(item.credential?.username || '');
    setPassword(item.credential?.password || '');
    setWebsite(item.credential?.website || '');
    setNotes(item.credential?.notes || item.content || '');
    setShowPassword(false);
  }, [item.id]);

  const handleUpdate = (updates: Partial<{
    title: string;
    username: string;
    password: string;
    website: string;
    notes: string;
  }>) => {
    const newTitle = updates.title !== undefined ? updates.title : title;
    const newUsername = updates.username !== undefined ? updates.username : username;
    const newPassword = updates.password !== undefined ? updates.password : password;
    const newWebsite = updates.website !== undefined ? updates.website : website;
    const newNotes = updates.notes !== undefined ? updates.notes : notes;

    if (updates.title !== undefined) setTitle(newTitle);
    if (updates.username !== undefined) setUsername(newUsername);
    if (updates.password !== undefined) setPassword(newPassword);
    if (updates.website !== undefined) setWebsite(newWebsite);
    if (updates.notes !== undefined) setNotes(newNotes);

    const updated: VaultItem = {
      ...item,
      title: newTitle,
      content: newNotes,
      credential: {
        username: newUsername,
        password: newPassword,
        website: newWebsite,
        notes: newNotes,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateItem(updated);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 1500);
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerate = () => {
    const newPass = generateStrongPassword({ length: 20, useSymbols: true });
    handleUpdate({ password: newPass });
    setShowPassword(true);
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-12 px-4 sm:px-8 border-b border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar (Full Screen)'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex items-center gap-1.5 py-1 px-2.5 -ml-1 text-blue-700 hover:text-blue-900 font-semibold text-xs rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Passwords</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-blue-900 font-medium">
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>Credential</span>
          </div>

          {savedStatus && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium ml-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Saved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs hidden sm:inline">
            Updated {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          <button
            onClick={() => {
              if (confirm('Delete this credential permanently?')) {
                onDeleteItem(item.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
            title="Delete Password"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full-Screen Pure White Password Space */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col px-6 sm:px-12 md:px-16 lg:px-20 py-8 sm:py-10 max-w-4xl">
        {/* Service Title */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Account / Service Name
          </label>
          <textarea
            ref={titleRef}
            rows={1}
            value={title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="e.g. Telehealth Client Portal, Work Email, EHR..."
            className="w-full text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none resize-none overflow-hidden bg-transparent mb-1 leading-snug break-words whitespace-pre-wrap transition-all"
          />
        </div>

        <div className="space-y-6">
          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => handleUpdate({ username: e.target.value })}
                placeholder="practitioner@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 pr-12"
              />
              <button
                type="button"
                onClick={() => handleCopy(username, 'username')}
                className="absolute right-3 top-3 p-1 text-slate-400 hover:text-blue-700 transition-colors"
                title="Copy Username"
              >
                {copiedField === 'username' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password with Generator & Copy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Generate Strong Password</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handleUpdate({ password: e.target.value })}
                placeholder="Enter or generate password..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 pr-20"
              />
              <div className="absolute right-3 flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-slate-700 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(password, 'password')}
                  className="p-1 hover:text-blue-700 transition-colors"
                  title="Copy password"
                >
                  {copiedField === 'password' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {password && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      password.length >= 16 && /[A-Z]/.test(password) && /[0-9]/.test(password)
                        ? 'w-full bg-emerald-500'
                        : password.length >= 10
                        ? 'w-2/3 bg-amber-500'
                        : 'w-1/3 bg-rose-500'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {password.length >= 16 && /[A-Z]/.test(password) && /[0-9]/.test(password)
                    ? 'Strong password'
                    : password.length >= 10
                    ? 'Moderate password'
                    : 'Weak password'}
                </span>
              </div>
            )}
          </div>

          {/* Website / Login URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Website URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={website}
                onChange={(e) => handleUpdate({ website: e.target.value })}
                placeholder="https://client-portal.example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 pr-12 font-mono text-xs"
              />
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-3 p-1 text-slate-400 hover:text-blue-600"
                  title="Open Link in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Confidential Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Security Notes (2FA recovery codes, PIN, security questions)
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleUpdate({ notes: e.target.value })}
              placeholder="Store additional private details, backup codes, or PINs..."
              rows={5}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed resize-none font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
