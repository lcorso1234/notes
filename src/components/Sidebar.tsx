'use client';

import React from 'react';
import { 
  FolderLock, 
  Sparkles, 
  Compass, 
  Trophy, 
  Key, 
  Users, 
  Star, 
  Lock, 
  Download, 
  Tag, 
  Plus,
  Shield,
  Layers,
  Zap
} from 'lucide-react';
import { PillarCategory } from '@/types';

export type NavigationFilter = 
  | 'all'
  | 'pinned'
  | 'credentials'
  | 'client'
  | PillarCategory;

interface SidebarProps {
  currentFilter: NavigationFilter;
  onSelectFilter: (filter: NavigationFilter) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  counts: {
    all: number;
    pinned: number;
    credentials: number;
    client: number;
    competence: number;
    confidence: number;
    self_awareness: number;
    personal: number;
  };
  onNewItem: (type?: 'note' | 'thought' | 'client_insight' | 'password') => void;
  onLockVault: () => void;
  onExportBackup: () => void;
  onOpenQuickThought: () => void;
}

export function Sidebar({
  currentFilter,
  onSelectFilter,
  selectedTag,
  onSelectTag,
  allTags,
  counts,
  onNewItem,
  onLockVault,
  onExportBackup,
  onOpenQuickThought,
}: SidebarProps) {
  const navItems = [
    { id: 'all' as NavigationFilter, label: 'All Entries', icon: Layers, count: counts.all },
    { id: 'pinned' as NavigationFilter, label: 'Pinned & Starred', icon: Star, count: counts.pinned },
  ];

  const pillarItems = [
    { 
      id: 'self_awareness' as NavigationFilter, 
      label: 'Self-Awareness', 
      subtitle: 'Reflections & Triggers',
      icon: Compass, 
      count: counts.self_awareness,
      color: 'text-indigo-400' 
    },
    { 
      id: 'competence' as NavigationFilter, 
      label: 'Competence', 
      subtitle: 'Skills & Frameworks',
      icon: Sparkles, 
      count: counts.competence,
      color: 'text-amber-400' 
    },
    { 
      id: 'confidence' as NavigationFilter, 
      label: 'Confidence', 
      subtitle: 'Victories & Evidence',
      icon: Trophy, 
      count: counts.confidence,
      color: 'text-emerald-400' 
    },
  ];

  const vaultItems = [
    { id: 'client' as NavigationFilter, label: 'Client Records', icon: Users, count: counts.client },
    { id: 'credentials' as NavigationFilter, label: 'Passwords & Keys', icon: Key, count: counts.credentials },
    { id: 'personal' as NavigationFilter, label: 'Personal Sanctuary', icon: FolderLock, count: counts.personal },
  ];

  return (
    <aside className="w-72 bg-stone-950 border-r border-stone-800/80 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-sm">
            Ψ
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-100 tracking-wide font-serif">
              Sovereign Mind
            </h2>
            <p className="text-[11px] text-stone-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Practitioner Vault</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLockVault}
          title="Lock Vault Now (⌘L)"
          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-all text-xs flex items-center gap-1"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-stone-800/80">
        <button
          onClick={() => onNewItem('note')}
          className="py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Entry</span>
        </button>

        <button
          onClick={onOpenQuickThought}
          className="py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Memory</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs scrollbar-thin">
        {/* Main Section */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentFilter === item.id && !selectedTag;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTag(null);
                  onSelectFilter(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-stone-800/90 text-stone-100 shadow-sm border border-stone-700/60'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono">{item.count}</span>
              </button>
            );
          })}
        </div>

        {/* The Practitioner Triad */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
            The Practitioner Triad
          </div>
          {pillarItems.map((item) => {
            const Icon = item.icon;
            const active = currentFilter === item.id && !selectedTag;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTag(null);
                  onSelectFilter(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-stone-800/90 text-stone-100 shadow-sm border border-stone-700/60'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <div className="text-left">
                    <div>{item.label}</div>
                    <div className="text-[10px] text-stone-500 font-normal leading-tight">{item.subtitle}</div>
                  </div>
                </div>
                <span className="text-[11px] text-stone-500 font-mono">{item.count}</span>
              </button>
            );
          })}
        </div>

        {/* Records & Confidential Vault */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
            Confidential Records
          </div>
          {vaultItems.map((item) => {
            const Icon = item.icon;
            const active = currentFilter === item.id && !selectedTag;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTag(null);
                  onSelectFilter(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-stone-800/90 text-stone-100 shadow-sm border border-stone-700/60'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono">{item.count}</span>
              </button>
            );
          })}
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div className="space-y-1 pt-2">
            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-stone-500 uppercase flex items-center justify-between">
              <span>Tags</span>
              {selectedTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="text-amber-400 hover:underline capitalize"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 px-3 py-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                  className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                    selectedTag === tag
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-stone-800/80 space-y-2 bg-stone-950/60">
        <button
          onClick={onExportBackup}
          className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800/90 border border-stone-800 text-stone-300 text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-stone-400" />
          <span>Export Encrypted Backup</span>
        </button>

        <div className="text-[10px] text-stone-500 text-center flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>AES-256-GCM Encrypted Locally</span>
        </div>
      </div>
    </aside>
  );
}

