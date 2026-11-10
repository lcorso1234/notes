'use client';

import React from 'react';
import { 
  Plus, 
  FileText, 
  Key, 
  Trash2, 
  ShieldCheck, 
  Lock,
  Download,
  Sun
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
    <aside className="w-full md:w-80 bg-slate-50 border-r border-slate-200/90 flex flex-col h-full select-none text-slate-800 shrink-0">
      {/* Section: Toggle for Password Section & Notes */}
      <div className="p-3 sm:p-4 border-b border-slate-200/90 bg-white/80">
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/70 shadow-inner">
          <button
            onClick={() => onTabChange('notes')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'notes'
                ? 'bg-white text-blue-900 shadow-[0_2px_6px_rgba(0,0,0,0.06)] border border-slate-200/60'
                : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Notes ({noteItems.length})</span>
          </button>

          <button
            onClick={() => onTabChange('passwords')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'passwords'
                ? 'bg-white text-blue-900 shadow-[0_2px_6px_rgba(0,0,0,0.06)] border border-slate-200/60'
                : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            <Key className="w-4 h-4 text-blue-600" />
            <span>Passwords ({passwordItems.length})</span>
          </button>
        </div>

        {/* Create Button with Logo Sun Gold Accent */}
        <button
          onClick={activeTab === 'notes' ? onNewNote : onNewPassword}
          className="mt-3 w-full py-2.5 px-4 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_2px_8px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.35)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{activeTab === 'notes' ? 'New Note' : 'New Password'}</span>
        </button>
      </div>

      {/* Section: Sidebar Note / Password Titles List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 scrollbar-thin">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs leading-relaxed">
            {searchQuery
              ? 'No matching entries found.'
              : activeTab === 'notes'
              ? 'No notes yet. Click "+ New Note" above to write in your clean white space.'
              : 'No passwords stored yet. Click "+ New Password" to add one.'}
          </div>
        ) : (
          filteredList.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`p-3.5 sm:p-4 cursor-pointer transition-all select-none group relative border-l-4 ${
                  isSelected
                    ? 'bg-white text-blue-950 border-l-blue-600 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100/70 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold line-clamp-1 group-hover:text-blue-700 transition-colors flex-1">
                    {item.title || (activeTab === 'notes' ? 'Untitled Note' : 'Untitled Credential')}
                  </h3>

                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>

                {activeTab === 'notes' ? (
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed font-sans">
                    {item.content || <em className="text-slate-400">Blank note</em>}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] font-mono text-blue-700 truncate">
                    {item.credential?.username || 'No username set'}
                  </p>
                )}

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this entry permanently?')) {
                      onDeleteItem(item.id);
                    }
                  }}
                  title="Delete"
                  className="absolute right-3 bottom-3 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 text-slate-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500 bg-white">
        <button
          onClick={onExportBackup}
          className="hover:text-blue-700 transition-colors flex items-center gap-1.5 text-[11px] font-medium"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Backup Vault</span>
        </button>

        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>AES-256 Encrypted</span>
        </span>
      </div>
    </aside>
  );
}
