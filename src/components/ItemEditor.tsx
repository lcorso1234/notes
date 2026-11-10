'use client';

import React, { useState, useEffect } from 'react';
import { 
  VaultItem, 
  PillarCategory, 
  ItemType 
} from '@/types';
import { 
  Star, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Wand2, 
  ExternalLink, 
  Sparkles, 
  Compass, 
  Trophy, 
  Users, 
  Key, 
  FileText,
  Tag as TagIcon,
  X,
  Code2,
  BookOpen
} from 'lucide-react';
import { generateStrongPassword } from '@/lib/crypto';

interface ItemEditorProps {
  item: VaultItem;
  onUpdateItem: (updated: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export function ItemEditor({ item, onUpdateItem, onDeleteItem }: ItemEditorProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Synchronize internal draft when item changes
  const [draft, setDraft] = useState<VaultItem>(item);

  useEffect(() => {
    setDraft(item);
  }, [item.id]);

  const handleChange = <K extends keyof VaultItem>(field: K, value: VaultItem[K]) => {
    const updated = {
      ...draft,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    setDraft(updated);
    onUpdateItem(updated);
  };

  const handleCredentialChange = (field: string, val: string) => {
    const cred = draft.credential || { username: '', password: '', website: '', notes: '' };
    const updatedCred = { ...cred, [field]: val };
    const updated = {
      ...draft,
      credential: updatedCred,
      updatedAt: new Date().toISOString(),
    };
    setDraft(updated);
    onUpdateItem(updated);
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGeneratePassword = () => {
    const newPass = generateStrongPassword({ length: 22, useSymbols: true });
    handleCredentialChange('password', newPass);
    setShowPassword(true);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !draft.tags.includes(clean)) {
        const nextTags = [...draft.tags, clean];
        handleChange('tags', nextTags);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(
      'tags',
      draft.tags.filter((t) => t !== tagToRemove)
    );
  };

  const pillarOptions: { id: PillarCategory; label: string; icon: React.ElementType }[] = [
    { id: 'self_awareness', label: 'Self-Awareness', icon: Compass },
    { id: 'competence', label: 'Competence', icon: Sparkles },
    { id: 'confidence', label: 'Confidence', icon: Trophy },
    { id: 'client', label: 'Client Record', icon: Users },
    { id: 'credentials', label: 'Password / Key', icon: Key },
    { id: 'personal', label: 'Personal Sanctuary', icon: FileText },
  ];

  const typeOptions: { id: ItemType; label: string }[] = [
    { id: 'note', label: 'Framework / Note' },
    { id: 'thought', label: 'Memory / Thought' },
    { id: 'client_insight', label: 'Client Breakthrough' },
    { id: 'password', label: 'Password / Login' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-950 text-stone-100 overflow-y-auto">
      {/* Top Toolbar */}
      <div className="px-6 py-3 border-b border-stone-800/80 flex items-center justify-between gap-4 bg-stone-950/80 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {/* Pillar Selector */}
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-0.5 text-xs">
            {pillarOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = draft.pillar === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const newType: ItemType = opt.id === 'credentials' ? 'password' : draft.type === 'password' ? 'note' : draft.type;
                    handleChange('pillar', opt.id);
                    if (newType !== draft.type) {
                      handleChange('type', newType);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {draft.type !== 'password' && (
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                previewMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
              title={previewMode ? 'Switch to Edit' : 'Switch to Markdown Preview'}
            >
              {previewMode ? <Code2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
          )}

          <button
            onClick={() => handleChange('pinned', !draft.pinned)}
            className={`p-2 rounded-lg border transition-all ${
              draft.pinned
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title={draft.pinned ? 'Unpin' : 'Pin to Top'}
          >
            <Star className={`w-4 h-4 ${draft.pinned ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this confidential entry?')) {
                onDeleteItem(draft.id);
              }
            }}
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-900/50 transition-all"
            title="Delete Entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Entry Title..."
            className="w-full text-2xl font-serif font-bold bg-transparent text-stone-100 placeholder-stone-600 focus:outline-none border-b border-transparent focus:border-stone-800 pb-2 transition-all"
          />
        </div>

        {/* Client Name Input (if applicable) */}
        {(draft.pillar === 'client' || draft.type === 'client_insight') && (
          <div className="flex items-center gap-2 p-3 bg-stone-900/60 border border-stone-800 rounded-xl text-xs">
            <Users className="w-4 h-4 text-sky-400" />
            <span className="text-stone-400 font-medium">Client / Subject:</span>
            <input
              type="text"
              value={draft.clientName || ''}
              onChange={(e) => handleChange('clientName', e.target.value)}
              placeholder="e.g. Eleanor Vance / Executive Leadership"
              className="flex-1 bg-transparent text-stone-200 placeholder-stone-600 focus:outline-none"
            />
          </div>
        )}

        {/* Dedicated Password / Credentials Section */}
        {draft.type === 'password' && (
          <div className="p-5 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
                <Key className="w-4 h-4 text-rose-400" />
                <span>Encrypted Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="py-1 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Strong Password</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs text-stone-400 font-medium">Username / Email / Identifier</label>
                <div className="relative">
                  <input
                    type="text"
                    value={draft.credential?.username || ''}
                    onChange={(e) => handleCredentialChange('username', e.target.value)}
                    placeholder="practitioner@example.com"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs pr-9 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleCopy(draft.credential?.username || '', 'username')}
                    className="absolute right-2 top-2 text-stone-500 hover:text-stone-300 p-0.5"
                    title="Copy Username"
                  >
                    {copiedField === 'username' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-stone-200 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={draft.credential?.password || ''}
                    onChange={(e) => handleCredentialChange('password', e.target.value)}
                    placeholder="Password..."
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs pr-9 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleCopy(draft.credential?.password || '', 'password')}
                    className="absolute right-2 top-2 text-stone-500 hover:text-stone-300 p-0.5"
                    title="Copy Password"
                  >
                    {copiedField === 'password' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-400 font-medium">Service / Login URL</label>
              <div className="relative">
                <input
                  type="url"
                  value={draft.credential?.website || ''}
                  onChange={(e) => handleCredentialChange('website', e.target.value)}
                  placeholder="https://client-portal.com"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs pr-9 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {draft.credential?.website && (
                  <a
                    href={draft.credential.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-amber-400"
                    title="Open Website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Credential Notes */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-400 font-medium">Security Details / 2FA Notes</label>
              <input
                type="text"
                value={draft.credential?.notes || ''}
                onChange={(e) => handleCredentialChange('notes', e.target.value)}
                placeholder="Recovery codes, answers to security questions, or PIN..."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="space-y-2">
          <label className="text-xs text-stone-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>
              {draft.type === 'password'
                ? 'Additional Notes & Context'
                : draft.type === 'client_insight'
                ? 'Breakthroughs, Observations & Next Actions'
                : draft.type === 'thought'
                ? 'Practitioner Reflections & Memory'
                : 'Content & Guidance'}
            </span>
            <span className="text-[11px] text-stone-500 lowercase">supports markdown</span>
          </label>

          {previewMode ? (
            <div className="min-h-[340px] p-5 rounded-2xl bg-stone-900/40 border border-stone-800 text-stone-200 prose prose-invert prose-stone max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {draft.content || <em className="text-stone-600">No content entered yet.</em>}
            </div>
          ) : (
            <textarea
              value={draft.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder={
                draft.pillar === 'self_awareness'
                  ? 'Record what is arising: internal dialogue, emotional triggers, realizations...'
                  : draft.pillar === 'competence'
                  ? 'Detail frameworks, coaching methodologies, or practice routines...'
                  : draft.pillar === 'confidence'
                  ? 'Log client breakthroughs, evidence of progress, and shifting self-beliefs...'
                  : 'Write confidential practitioner thoughts, session notes, or memories...'
              }
              rows={14}
              className="w-full p-4 bg-stone-900/50 border border-stone-800 rounded-2xl text-stone-100 placeholder-stone-600 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-y font-sans transition-all"
            />
          )}
        </div>

        {/* Tags Section */}
        <div className="pt-2 border-t border-stone-800/80 space-y-2">
          <label className="text-xs text-stone-400 font-medium flex items-center gap-1.5">
            <TagIcon className="w-3.5 h-3.5 text-stone-500" />
            <span>Tags & Keywords</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {draft.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-900 border border-stone-800 text-stone-300 text-xs"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-stone-500 hover:text-stone-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press Enter..."
              className="px-2.5 py-1 bg-transparent border-b border-stone-800 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="pt-4 text-[11px] text-stone-500 flex items-center justify-between">
          <span>
            Created: {new Date(draft.createdAt).toLocaleString()}
          </span>
          <span>
            Last updated: {new Date(draft.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

