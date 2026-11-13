import { VaultItem, VaultSettings } from '@/types';
import { STARTER_ITEMS } from './starterData';

const DIRECT_STORAGE_KEY = 'tamillow_notes_store_v1';
const SETTINGS_KEY = 'tamillow_notes_settings_v1';

export const DEFAULT_SETTINGS: VaultSettings = {
  autoLockMinutes: 0,
  blurOnInactivity: false,
  theme: 'light',
};

/**
 * Directly retrieve notes without requiring a passcode.
 */
export function getStoredNotes(): VaultItem[] {
  if (typeof window === 'undefined') {
    return STARTER_ITEMS;
  }
  try {
    const raw = localStorage.getItem(DIRECT_STORAGE_KEY);
    if (!raw) {
      // First time loading: initialize with starter items
      localStorage.setItem(DIRECT_STORAGE_KEY, JSON.stringify(STARTER_ITEMS));
      return STARTER_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : STARTER_ITEMS;
  } catch {
    return STARTER_ITEMS;
  }
}

/**
 * Directly save notes to local storage.
 */
export function saveStoredNotes(items: VaultItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DIRECT_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save notes:', err);
  }
}

export function getStoredSettings(): VaultSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: VaultSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Exports notes and passwords backup as a downloadable JSON file.
 */
export function exportNotesBackup(items: VaultItem[]): void {
  const payload = {
    type: 'TAMILLOW_THERAPY_NOTES_BACKUP',
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tamillow-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports notes from a backup JSON file.
 */
export function importNotesBackup(jsonString: string): VaultItem[] {
  try {
    const parsed = JSON.parse(jsonString);
    let itemsToImport: VaultItem[] = [];

    if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else if (parsed && Array.isArray(parsed.items)) {
      itemsToImport = parsed.items;
    } else {
      throw new Error('Unrecognized backup file format.');
    }

    saveStoredNotes(itemsToImport);
    return itemsToImport;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to import backup.';
    throw new Error(message);
  }
}

/**
 * Clears stored notes from browser.
 */
export function resetStoredNotes(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DIRECT_STORAGE_KEY);
  }
}
