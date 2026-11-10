'use client';

import React from 'react';
import { 
  Plus, 
  FileText, 
  Key, 
  Trash2, 
  ShieldCheck, 
  Lock,
  Download
} from 'lucide-react';
import { VaultItem } from '@/types';

interface CleanSidebarProps {
  activeTab: 'notes' | 'passwords';
  onTabChange: (tab: 'notes' | 'passwords') => void;
  items: VaultItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onNewNote: () => void;
  onNewPassword: () => void;
  onDeleteItem: (id: string) => void;
  onLockVault: () => void;
  onExportBackup: () => void;
  searchQuery: string;
}

export function CleanSidebar({
  activeTab,
  onTabChange,
  items,
  selectedItemId,
  onSelectItem,
  onNewNote,
  onNewPassword,
  onDeleteItem,
  onLockVault,
  onExportBackup,
  searchQuery,
}: CleanSidebarProps) {
  // Separate notes and passwords
  const noteItems = items.filter((it) => it.type !== 'password' && it.pillar !== 'credentials');
  const passwordItems = items.filter((it) => it.type === 'password' || it.pillar === 'credentials');

  const currentList = activeTab === 'notes' ? noteItems : passwordItems;

  const filteredList = currentList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchContent = item.content.toLowerCase().includes(q);
    const matchUsername = item.credential?.username.toLowerCase().includes(q);
    const matchWebsite = item.credential?.website?.toLowerCase().includes(q);
    return matchTitle || matchContent || matchUsername || matchWebsite;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-80 bg-stone-900 border-r border-stone-800 flex flex-col h-full select-none text-stone-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-serif font-bold text-xs">
            Ψ
          </div>
          <div>
            <h1 className="text-sm font-semibold text-stone-100 font-serif tracking-wide">
              Practitioner Vault
            </h1>
            <p className="text-[10px] text-stone-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Encrypted & Private</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLockVault}
          title="Lock Vault Now (⌘L)"
          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Section 3: Toggle for Password Section / Notes */}
      <div className="p-3 border-b border-stone-800">
        <div className="grid grid-cols-2 p-1 bg-stone-950 rounded-xl border border-stone-800">
          <button
            onClick={() => onTabChange('notes')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'notes'
                ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Notes ({noteItems.length})</span>
          </button>

          <button
            onClick={() => onTabChange('passwords')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'passwords'
                ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-rose-400" />
            <span>Passwords ({passwordItems.length})</span>
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={activeTab === 'notes' ? onNewNote : onNewPassword}
          className="mt-2.5 w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{activeTab === 'notes' ? 'New Note' : 'New Password'}</span>
        </button>
      </div>

      {/* Section 2: Sidebar List (Notes / Passwords) */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-800/50 scrollbar-thin">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            {searchQuery ? 'No matching entries found.' : activeTab === 'notes' ? 'No notes yet. Click "+ New Note" to begin.' : 'No passwords stored yet. Click "+ New Password" to add one.'}
          </div>
        ) : (
          filteredList.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`p-3.5 cursor-pointer transition-all select-none group relative border-l-2 ${
                  isSelected
                    ? 'bg-stone-800/90 text-stone-100 border-l-amber-500 shadow-inner'
                    : 'text-stone-300 hover:bg-stone-800/40 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold line-clamp-1 group-hover:text-amber-300 transition-colors flex-1">
                    {item.title || (activeTab === 'notes' ? 'Untitled Note' : 'Untitled Credential')}
                  </h3>

                  <span className="text-[10px] text-stone-500 shrink-0 font-mono">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>

                {activeTab === 'notes' ? (
                  <p className="mt-1 text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                    {item.content || <em className="text-stone-600">Blank note</em>}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] font-mono text-stone-400 truncate">
                    {item.credential?.username || 'No username set'}
                  </p>
                )}

                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this entry permanently?')) {
                      onDeleteItem(item.id);
                    }
                  }}
                  title="Delete"
                  className="absolute right-2.5 bottom-2.5 p-1 rounded opacity-0 group-hover:opacity-100 hover:text-rose-400 text-stone-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 bg-stone-950/70">
        <button
          onClick={onExportBackup}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[11px]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup Vault</span>
        </button>

        <span className="text-[10px] text-emerald-400 font-mono">
          ● Locked to Device
        </span>
      </div>
    </aside>
  );
}

