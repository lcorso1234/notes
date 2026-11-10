'use client';

import React, { useRef, useEffect } from 'react';
import { Search, Lock, Download, Settings } from 'lucide-react';

interface CleanHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLockVault: () => void;
  onOpenSettings: () => void;
}

export function CleanHeader({
  searchQuery,
  onSearchChange,
  onLockVault,
  onOpenSettings,
}: CleanHeaderProps) {
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
    <header className="h-14 px-6 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-6 z-20">
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="font-serif text-base font-semibold text-stone-100 tracking-wide">
          Sovereign Mind
        </span>
        <span className="text-xs text-stone-500 font-sans hidden sm:inline">
          · Confidential Notes & Password Sanctuary
        </span>
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes, memory, passwords... (⌘K)"
          className="w-full pl-9 pr-8 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
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

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          title="Backup & Settings"
          className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onLockVault}
          title="Lock Vault (⌘L)"
          className="py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock</span>
        </button>
      </div>
    </header>
  );
}

