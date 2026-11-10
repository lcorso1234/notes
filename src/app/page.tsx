'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VaultItem, VaultSettings } from '@/types';
import { 
  getStoredVaultState, 
  getStoredSettings, 
  saveSettings, 
  saveVaultItems 
} from '@/lib/vaultStorage';
import { LockScreen } from '@/components/LockScreen';
import { CleanHeader } from '@/components/CleanHeader';
import { CleanSidebar } from '@/components/CleanSidebar';
import { CleanNoteEditor } from '@/components/CleanNoteEditor';
import { CleanPasswordManager } from '@/components/CleanPasswordManager';
import { ExportImportModal } from '@/components/ExportImportModal';

export default function CleanPractitionerApp() {
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassphrase, setMasterPassphrase] = useState<string>('');
  
  const [items, setItems] = useState<VaultItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'passwords'>('notes');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile responsiveness state: 'list' (sidebar) or 'editor' (main canvas)
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  const [settings, setSettings] = useState<VaultSettings>(getStoredSettings());
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Initialize client state
  useEffect(() => {
    setMounted(true);
    const state = getStoredVaultState();
    setIsInitialized(state.hasInitialized);
    setSettings(getStoredSettings());
  }, []);

  // Lock Vault
  const handleLockVault = useCallback(() => {
    setIsUnlocked(false);
    setMasterPassphrase('');
    setSelectedItemId(null);
    setMobileView('list');
  }, []);

  // Inactivity Auto-Lock
  useEffect(() => {
    if (!isUnlocked || settings.autoLockMinutes <= 0) return;

    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLockVault();
      }, settings.autoLockMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isUnlocked, settings.autoLockMinutes, handleLockVault]);

  // Handle successful unlock
  const handleUnlocked = (loadedItems: VaultItem[], passphrase: string) => {
    setItems(loadedItems);
    setMasterPassphrase(passphrase);
    setIsUnlocked(true);
    setIsInitialized(true);

    const firstNote = loadedItems.find((it) => it.type !== 'password' && it.pillar !== 'credentials');
    if (firstNote) {
      setSelectedItemId(firstNote.id);
      setActiveTab('notes');
    } else if (loadedItems.length > 0) {
      setSelectedItemId(loadedItems[0].id);
    }
    // On desktop start with editor open, on mobile start with list
    setMobileView('list');
  };

  // Encrypt and persist changes
  const persistItems = useCallback(
    async (updatedItems: VaultItem[]) => {
      if (!masterPassphrase) return;
      try {
        await saveVaultItems(updatedItems, masterPassphrase);
      } catch (err) {
        console.error('Failed to save encrypted items:', err);
      }
    },
    [masterPassphrase]
  );

  // Create New Note (Clean White Space to write in)
  const handleNewNote = () => {
    const newNote: VaultItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'note',
      title: '',
      content: '',
      pillar: 'competence',
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextItems = [newNote, ...items];
    setItems(nextItems);
    setSelectedItemId(newNote.id);
    setActiveTab('notes');
    setMobileView('editor');
    persistItems(nextItems);
  };

  // Create New Password
  const handleNewPassword = () => {
    const newPasswordItem: VaultItem = {
      id: `pwd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'password',
      title: 'New Account',
      content: '',
      pillar: 'credentials',
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      credential: {
        username: '',
        password: '',
        website: '',
        notes: '',
      },
    };

    const nextItems = [newPasswordItem, ...items];
    setItems(nextItems);
    setSelectedItemId(newPasswordItem.id);
    setActiveTab('passwords');
    setMobileView('editor');
    persistItems(nextItems);
  };

  // Update item
  const handleUpdateItem = (updated: VaultItem) => {
    const nextItems = items.map((it) => (it.id === updated.id ? updated : it));
    setItems(nextItems);
    persistItems(nextItems);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const nextItems = items.filter((it) => it.id !== id);
    setItems(nextItems);
    if (selectedItemId === id) {
      const remainingInTab = nextItems.filter((it) => 
        activeTab === 'notes' ? it.type !== 'password' : it.type === 'password'
      );
      setSelectedItemId(remainingInTab.length > 0 ? remainingInTab[0].id : null);
      if (remainingInTab.length === 0) {
        setMobileView('list');
      }
    }
    persistItems(nextItems);
  };

  // Switch tab (Notes vs Passwords)
  const handleTabChange = (tab: 'notes' | 'passwords') => {
    setActiveTab(tab);
    const candidate = items.find((it) => 
      tab === 'notes' 
        ? it.type !== 'password' && it.pillar !== 'credentials'
        : it.type === 'password' || it.pillar === 'credentials'
    );
    setSelectedItemId(candidate ? candidate.id : null);
  };

  // Select item handler (handles mobile view transition)
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setMobileView('editor');
  };

  // Active item
  const currentItem = useMemo(() => {
    return items.find((it) => it.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-serif text-sm">
        Preparing Practitioner Sanctuary...
      </div>
    );
  }

  // Master Lock Screen
  if (!isUnlocked) {
    return (
      <LockScreen
        isInitialized={isInitialized}
        onUnlocked={handleUnlocked}
        onVaultImported={() => {
          const state = getStoredVaultState();
          setIsInitialized(state.hasInitialized);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* 1. Top Header with Google Search Bar Style */}
      <CleanHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLockVault={handleLockVault}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onToggleMobileSidebar={() => setMobileView(mobileView === 'list' ? 'editor' : 'list')}
        isMobileListOpen={mobileView === 'list'}
      />

      {/* Main Responsive Workspace: Sidebar + White Blank Space / Password Manager */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2 & 3. Sidebar (visible on desktop, or on mobile when mobileView === 'list') */}
        <div
          className={`h-full ${
            mobileView === 'list' ? 'flex w-full md:w-80' : 'hidden md:flex md:w-80'
          }`}
        >
          <CleanSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
            onNewNote={handleNewNote}
            onNewPassword={handleNewPassword}
            onDeleteItem={handleDeleteItem}
            onLockVault={handleLockVault}
            onExportBackup={() => setSettingsModalOpen(true)}
            searchQuery={searchQuery}
          />
        </div>

        {/* 4. White Blank Space To Write In OR Password Section (visible on desktop, or mobile when mobileView === 'editor') */}
        <div
          className={`flex-1 h-full overflow-hidden ${
            mobileView === 'editor' ? 'flex flex-col w-full' : 'hidden md:flex md:flex-col'
          }`}
        >
          {activeTab === 'notes' ? (
            currentItem ? (
              <CleanNoteEditor
                key={currentItem.id}
                note={currentItem}
                onUpdateNote={handleUpdateItem}
                onDeleteNote={handleDeleteItem}
                onBack={() => setMobileView('list')}
              />
            ) : (
              <div className="flex-1 bg-slate-100/60 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-amber-500 mb-4 text-2xl font-serif">
                  ✎
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  A Clean White Canvas
                </h2>
                <p className="text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Click below to begin writing. All reflections and memory are encrypted locally on this device.
                </p>
                <button
                  onClick={handleNewNote}
                  className="mt-5 py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full text-xs shadow-md transition-all active:scale-95"
                >
                  + Create New Note
                </button>
              </div>
            )
          ) : (
            currentItem ? (
              <CleanPasswordManager
                key={currentItem.id}
                item={currentItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onBack={() => setMobileView('list')}
              />
            ) : (
              <div className="flex-1 bg-slate-100/60 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 mb-4 text-2xl">
                  🔑
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Password & Credential Sanctuary
                </h2>
                <p className="text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Store telehealth logins, client portals, and confidential access keys securely.
                </p>
                <button
                  onClick={handleNewPassword}
                  className="mt-5 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-md transition-all active:scale-95"
                >
                  + Add New Password
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Backup & Settings Modal */}
      <ExportImportModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        items={items}
        settings={settings}
        onUpdateSettings={(s) => {
          setSettings(s);
          saveSettings(s);
        }}
        onVaultReload={() => {
          const state = getStoredVaultState();
          setIsInitialized(state.hasInitialized);
        }}
        onLockVault={handleLockVault}
      />
    </div>
  );
}
