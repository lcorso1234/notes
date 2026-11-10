'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  VaultItem, 
  VaultSettings, 
  ItemType, 
  PillarCategory 
} from '@/types';
import { 
  getStoredVaultState, 
  getStoredSettings, 
  saveSettings, 
  saveVaultItems 
} from '@/lib/vaultStorage';
import { LockScreen } from '@/components/LockScreen';
import { Sidebar, NavigationFilter } from '@/components/Sidebar';
import { ItemList } from '@/components/ItemList';
import { ItemEditor } from '@/components/ItemEditor';
import { Header } from '@/components/Header';
import { QuickThoughtModal } from '@/components/QuickThoughtModal';
import { ExportImportModal } from '@/components/ExportImportModal';

export default function PractitionerVaultApp() {
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassphrase, setMasterPassphrase] = useState<string>('');
  const [items, setItems] = useState<VaultItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [currentFilter, setCurrentFilter] = useState<NavigationFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [settings, setSettings] = useState<VaultSettings>(getStoredSettings());
  const [quickThoughtOpen, setQuickThoughtOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Check initial state on client mount
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
  }, []);

  // Auto-lock inactivity listener
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

  // Handle successful unlock from LockScreen
  const handleUnlocked = (loadedItems: VaultItem[], passphrase: string) => {
    setItems(loadedItems);
    setMasterPassphrase(passphrase);
    setIsUnlocked(true);
    setIsInitialized(true);
    if (loadedItems.length > 0) {
      setSelectedItemId(loadedItems[0].id);
    }
  };

  // Persist items to encrypted storage whenever items change and vault is unlocked
  const persistItems = useCallback(
    async (updatedItems: VaultItem[]) => {
      if (!masterPassphrase) return;
      try {
        await saveVaultItems(updatedItems, masterPassphrase);
      } catch (err) {
        console.error('Failed to encrypt and save vault items:', err);
      }
    },
    [masterPassphrase]
  );

  // Create New Item
  const handleCreateNewItem = (type: ItemType = 'note') => {
    let pillar: PillarCategory = 'self_awareness';
    if (type === 'password') pillar = 'credentials';
    if (type === 'client_insight') pillar = 'client';
    if (currentFilter === 'competence') pillar = 'competence';
    if (currentFilter === 'confidence') pillar = 'confidence';
    if (currentFilter === 'personal') pillar = 'personal';

    const newItem: VaultItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      title: type === 'password' ? 'New Secure Credential' : type === 'client_insight' ? 'New Client Breakthrough' : 'Untitled Note',
      content: '',
      pillar,
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      credential: type === 'password' ? { username: '', password: '', website: '', notes: '' } : undefined,
    };

    const nextItems = [newItem, ...items];
    setItems(nextItems);
    setSelectedItemId(newItem.id);
    persistItems(nextItems);
  };

  // Update Item
  const handleUpdateItem = (updated: VaultItem) => {
    const nextItems = items.map((it) => (it.id === updated.id ? updated : it));
    setItems(nextItems);
    persistItems(nextItems);
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    const nextItems = items.filter((it) => it.id !== id);
    setItems(nextItems);
    if (selectedItemId === id) {
      setSelectedItemId(nextItems.length > 0 ? nextItems[0].id : null);
    }
    persistItems(nextItems);
  };

  // Save Quick Thought
  const handleSaveQuickThought = (partial: Partial<VaultItem>) => {
    const newItem: VaultItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: partial.type || 'thought',
      title: partial.title || 'Fleeting Thought',
      content: partial.content || '',
      pillar: partial.pillar || 'self_awareness',
      tags: partial.tags || ['QuickMemory'],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextItems = [newItem, ...items];
    setItems(nextItems);
    setSelectedItemId(newItem.id);
    persistItems(nextItems);
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: VaultSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Compute all tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  // Compute category counts
  const counts = useMemo(() => {
    return {
      all: items.length,
      pinned: items.filter((it) => it.pinned).length,
      credentials: items.filter((it) => it.pillar === 'credentials' || it.type === 'password').length,
      client: items.filter((it) => it.pillar === 'client' || it.type === 'client_insight').length,
      competence: items.filter((it) => it.pillar === 'competence').length,
      confidence: items.filter((it) => it.pillar === 'confidence').length,
      self_awareness: items.filter((it) => it.pillar === 'self_awareness').length,
      personal: items.filter((it) => it.pillar === 'personal').length,
    };
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Filter by category
        if (currentFilter === 'pinned' && !item.pinned) return false;
        if (currentFilter === 'credentials' && item.pillar !== 'credentials' && item.type !== 'password') return false;
        if (currentFilter === 'client' && item.pillar !== 'client' && item.type !== 'client_insight') return false;
        if (currentFilter === 'competence' && item.pillar !== 'competence') return false;
        if (currentFilter === 'confidence' && item.pillar !== 'confidence') return false;
        if (currentFilter === 'self_awareness' && item.pillar !== 'self_awareness') return false;
        if (currentFilter === 'personal' && item.pillar !== 'personal') return false;

        // Filter by tag
        if (selectedTag && !item.tags.includes(selectedTag)) return false;

        // Filter by search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchContent = item.content.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          const matchClient = item.clientName?.toLowerCase().includes(q);
          const matchUsername = item.credential?.username.toLowerCase().includes(q);
          const matchWebsite = item.credential?.website?.toLowerCase().includes(q);
          if (!matchTitle && !matchContent && !matchTags && !matchClient && !matchUsername && !matchWebsite) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned on top
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [items, currentFilter, selectedTag, searchQuery]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return items.find((it) => it.id === selectedItemId) || filteredItems[0] || null;
  }, [items, selectedItemId, filteredItems]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500 font-serif text-sm">
        Preparing Sovereign Vault...
      </div>
    );
  }

  // If locked, render LockScreen
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
    <div className="min-h-screen h-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLockVault={handleLockVault}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onNewItem={handleCreateNewItem}
        autoLockMinutes={settings.autoLockMinutes}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentFilter={currentFilter}
          onSelectFilter={setCurrentFilter}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          allTags={allTags}
          counts={counts}
          onNewItem={handleCreateNewItem}
          onLockVault={handleLockVault}
          onExportBackup={() => setSettingsModalOpen(true)}
          onOpenQuickThought={() => setQuickThoughtOpen(true)}
        />

        {/* Item List */}
        <ItemList
          items={filteredItems}
          selectedItem={selectedItem}
          onSelectItem={(item) => setSelectedItemId(item.id)}
          searchQuery={searchQuery}
        />

        {/* Editor Area */}
        {selectedItem ? (
          <ItemEditor
            key={selectedItem.id}
            item={selectedItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-950 text-stone-500">
            <p className="text-base font-serif text-stone-400">Select an entry or create a new one.</p>
            <button
              onClick={() => handleCreateNewItem('note')}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition-all"
            >
              + Create New Entry
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <QuickThoughtModal
        isOpen={quickThoughtOpen}
        onClose={() => setQuickThoughtOpen(false)}
        onSave={handleSaveQuickThought}
      />

      <ExportImportModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        items={items}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onVaultReload={() => {
          const state = getStoredVaultState();
          setIsInitialized(state.hasInitialized);
        }}
        onLockVault={handleLockVault}
      />
    </div>
  );
}
