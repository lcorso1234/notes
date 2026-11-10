'use client';

import React, { useRef, useEffect } from 'react';
import { Search, Lock, Settings, Menu, Shield } from 'lucide-react';
import { Logo } from './Logo';

interface CleanHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLockVault: () => void;
  onOpenSettings: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileListOpen?: boolean;
}

export function CleanHeader({
  searchQuery,
  onSearchChange,
  onLockVault,
  onOpenSettings,
  onToggleMobileSidebar,
  isMobileListOpen,
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
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/90 flex items-center justify-between gap-3 sm:gap-6 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left: Mobile Toggle + Logo Branding */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Toggle List"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Logo size={42} showText={true} />
      </div>

      {/* Center: Google Search Bar Style */}
      <div className="flex-1 max-w-lg mx-2 sm:mx-4">
        <div className="relative flex items-center w-full bg-white rounded-full border border-slate-200/90 shadow-[0_1px_6px_rgba(32,33,36,0.12)] hover:shadow-[0_2px_8px_rgba(32,33,36,0.20)] focus-within:shadow-[0_2px_8px_rgba(32,33,36,0.24)] focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, memory, passwords..."
            className="w-full px-3 py-2 sm:py-2.5 bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none rounded-full"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="mr-3 text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Security & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={onOpenSettings}
          title="Backup & Vault Settings"
          className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onLockVault}
          title="Lock Vault Now (⌘L)"
          className="py-1.5 px-3 sm:px-4 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <Lock className="w-3.5 h-3.5 text-blue-700" />
          <span className="hidden sm:inline">Lock Vault</span>
        </button>
      </div>
    </header>
  );
}
