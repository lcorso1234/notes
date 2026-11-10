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
  Lock,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { VaultItem } from '@/types';
import { generateStrongPassword } from '@/lib/crypto';

interface CleanPasswordManagerProps {
  item: VaultItem;
  onUpdateItem: (updated: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export function CleanPasswordManager({
  item,
  onUpdateItem,
  onDeleteItem,
}: CleanPasswordManagerProps) {
  const [title, setTitle] = useState(item.title);
  const [username, setUsername] = useState(item.credential?.username || '');
  const [password, setPassword] = useState(item.credential?.password || '');
  const [website, setWebsite] = useState(item.credential?.website || '');
  const [notes, setNotes] = useState(item.credential?.notes || item.content || '');

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState(false);

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
    <div className="flex-1 bg-stone-100 flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 px-8 border-b border-stone-200 bg-white/70 backdrop-blur flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-rose-500" />
          <span>Encrypted Credential</span>
          {savedStatus && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium ml-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-stone-400">
            Updated: {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          <button
            onClick={() => {
              if (confirm('Delete this credential permanently?')) {
                onDeleteItem(item.id);
              }
            }}
            className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-stone-100"
            title="Delete Password"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Password Content Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-2xl bg-white border border-stone-200/90 rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
          {/* Service Title */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Account / Service Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="e.g. Telehealth Client Portal, Work Email, EHR..."
              className="w-full text-2xl font-serif font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none border-b border-stone-200 pb-2"
            />
          </div>

          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => handleUpdate({ username: e.target.value })}
                placeholder="practitioner@example.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 pr-12"
              />
              <button
                type="button"
                onClick={() => handleCopy(username, 'username')}
                className="absolute right-3 top-3 p-1 text-stone-400 hover:text-stone-700 transition-colors"
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
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Strong Password</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handleUpdate({ password: e.target.value })}
                placeholder="Enter or generate password..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 pr-20"
              />
              <div className="absolute right-3 flex items-center gap-1 text-stone-400">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-stone-700 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(password, 'password')}
                  className="p-1 hover:text-stone-700 transition-colors"
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
                <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden flex">
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
                <span className="text-[10px] font-medium text-stone-400">
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
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Website URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={website}
                onChange={(e) => handleUpdate({ website: e.target.value })}
                placeholder="https://client-portal.example.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 pr-12 font-mono text-xs"
              />
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-3 p-1 text-stone-400 hover:text-amber-600"
                  title="Open Link in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Confidential Notes / Recovery Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Security Notes (2FA recovery codes, PIN, security questions)
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleUpdate({ notes: e.target.value })}
              placeholder="Store additional private details, backup codes, or PINs..."
              rows={4}
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 leading-relaxed resize-none font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

