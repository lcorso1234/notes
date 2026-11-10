'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  Search, 
  Lock, 
  Plus, 
  Settings, 
  Sparkles, 
  Compass, 
  Trophy, 
  Key, 
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Lightbulb
} from 'lucide-react';
import { ItemType } from '@/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLockVault: () => void;
  onOpenSettings: () => void;
  onOpenPrompts: () => void;
  onNewItem: (type?: ItemType) => void;
  autoLockMinutes: number;
}

export function Header({
  searchQuery,
  onSearchChange,
  onLockVault,
  onOpenSettings,
  onOpenPrompts,
  onNewItem,
  autoLockMinutes,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clinical/Session Timer state (Default: 50 minute session)
  const DEFAULT_SECONDS = 50 * 60;
  const [sessionSeconds, setSessionSeconds] = useState(DEFAULT_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          if (timerMode === 'countdown') {
            if (prev <= 1) {
              setTimerRunning(false);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMode]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

      {/* Practitioner Center Tools: Session Timer & Prompts */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Session Timer Widget */}
        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800/80 rounded-xl px-2.5 py-1 text-xs">
          <Timer className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-stone-200 font-medium">
            {formatTimer(sessionSeconds)}
          </span>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className="p-1 text-stone-400 hover:text-stone-200 rounded hover:bg-stone-800 transition-colors"
            title={timerRunning ? 'Pause Session Timer' : 'Start Session Timer'}
          >
            {timerRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
          </button>
          <button
            onClick={() => {
              setTimerRunning(false);
              setSessionSeconds(DEFAULT_SECONDS);
            }}
            className="p-1 text-stone-500 hover:text-stone-300 rounded hover:bg-stone-800 transition-colors"
            title="Reset Timer (50m)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Prompts Drawer Button */}
        <button
          onClick={onOpenPrompts}
          className="py-1.5 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-300/90 text-xs font-medium flex items-center gap-1.5 transition-all"
          title="Practitioner Reflection Prompts"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Inquiry Prompts</span>
        </button>
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
