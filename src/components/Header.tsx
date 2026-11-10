'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Lock, 
  Plus, 
  Settings, 
  Sparkles, 
  Compass, 
  Trophy, 
  Key, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { ItemType } from '@/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLockVault: () => void;
  onOpenSettings: () => void;
  onNewItem: (type?: ItemType) => void;
  autoLockMinutes: number;
}

export function Header({
  searchQuery,
  onSearchChange,
  onLockVault,
  onOpenSettings,
  onNewItem,
  autoLockMinutes,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Cmd/Ctrl+K to search, Cmd/Ctrl+L to lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onLockVault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLockVault]);

  return (
    <header className="h-14 px-4 bg-stone-950 border-b border-stone-800/80 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Search Input */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search thoughts, client breakthroughs, passwords, tags... (⌘K)"
          className="w-full pl-9 pr-8 py-1.5 bg-stone-900/80 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2 text-stone-500 hover:text-stone-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* New Item Dropdown */}
        <div className="relative">
          <div className="flex items-center rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold shadow-sm transition-all text-xs">
            <button
              onClick={() => onNewItem('note')}
              className="py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Entry</span>
            </button>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1.5 border-l border-amber-600 hover:bg-amber-600/30 rounded-r-xl transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-52 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl py-1.5 z-30 text-xs">
                <button
                  onClick={() => {
                    onNewItem('note');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-stone-200 hover:bg-stone-800"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-medium">Framework & Note</div>
                    <div className="text-[10px] text-stone-400">Coaching tools & techniques</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onNewItem('thought');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-stone-200 hover:bg-stone-800"
                >
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-medium">Reflection & Memory</div>
                    <div className="text-[10px] text-stone-400">Self-awareness & insights</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onNewItem('client_insight');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-stone-200 hover:bg-stone-800"
                >
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium">Client Breakthrough</div>
                    <div className="text-[10px] text-stone-400">Victories & session records</div>
                  </div>
                </button>

                <div className="my-1 border-t border-stone-800" />

                <button
                  onClick={() => {
                    onNewItem('password');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-stone-200 hover:bg-stone-800"
                >
                  <Key className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-medium">Password & Login</div>
                    <div className="text-[10px] text-stone-400">Encrypted portal credentials</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Settings & Backups */}
        <button
          onClick={onOpenSettings}
          title="Vault Settings & Backup"
          className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800 transition-all text-xs"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Lock Vault Button */}
        <button
          onClick={onLockVault}
          title="Lock Vault Now (⌘L)"
          className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-400 transition-all text-xs flex items-center gap-1.5 font-medium"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    </header>
  );
}
