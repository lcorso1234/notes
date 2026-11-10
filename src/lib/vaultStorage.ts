import { VaultItem, VaultSettings, StoredVaultState } from '@/types';
import {
  encryptData,
  decryptData,
  createPasswordVerifier,
  verifyPassword,
  EncryptedPayload,
} from './crypto';
import { STARTER_ITEMS } from './starterData';

const STORAGE_KEY = 'practitioner_vault_store_v1';
const SETTINGS_KEY = 'practitioner_vault_settings_v1';

export const DEFAULT_SETTINGS: VaultSettings = {
  autoLockMinutes: 15,
  blurOnInactivity: true,
  theme: 'dark',
};

export function getStoredVaultState(): StoredVaultState {
  if (typeof window === 'undefined') {
    return { hasInitialized: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hasInitialized: false };
    return JSON.parse(raw);
  } catch {
    return { hasInitialized: false };
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
 * Initializes a new vault with a master passphrase.
 */
export async function initializeVault(passphrase: string): Promise<VaultItem[]> {
  const verifier = await createPasswordVerifier(passphrase);
  const items = [...STARTER_ITEMS];
  const encrypted = await encryptData(items, passphrase);

  const state: StoredVaultState = {
    hasInitialized: true,
    verifier,
    encryptedData: encrypted,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return items;
}

/**
 * Unlocks the vault using the master passphrase.
 */
export async function unlockVault(passphrase: string): Promise<VaultItem[]> {
  const state = getStoredVaultState();
  if (!state.hasInitialized || !state.verifier || !state.encryptedData) {
    throw new Error('Vault has not been set up yet.');
  }

  const isValid = await verifyPassword(
    passphrase,
    state.verifier.salt,
    state.verifier.hash
  );

  if (!isValid) {
    throw new Error('Incorrect master passphrase. Access denied.');
  }

  const items = await decryptData<VaultItem[]>(state.encryptedData, passphrase);
  return items;
}

/**
 * Saves updated items to encrypted storage.
 */
export async function saveVaultItems(items: VaultItem[], passphrase: string): Promise<void> {
  const state = getStoredVaultState();
  if (!state.hasInitialized || !state.verifier) {
    throw new Error('Vault state missing.');
  }

  const encrypted = await encryptData(items, passphrase);
  const updatedState: StoredVaultState = {
    ...state,
    encryptedData: encrypted,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
}

/**
 * Exports the raw encrypted backup object as a downloadable JSON file.
 */
export function exportEncryptedBackup(): void {
  const state = getStoredVaultState();
  if (!state.hasInitialized) {
    throw new Error('No vault to export.');
  }

  const payload = {
    type: 'PRACTITIONER_SOVEREIGN_VAULT_BACKUP',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `practitioner-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports a vault backup JSON file.
 */
export async function importEncryptedBackup(jsonString: string): Promise<void> {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.type !== 'PRACTITIONER_SOVEREIGN_VAULT_BACKUP' || !parsed.data) {
      throw new Error('Unrecognized backup file format.');
    }
    const state = parsed.data as StoredVaultState;
    if (!state.hasInitialized || !state.verifier || !state.encryptedData) {
      throw new Error('Invalid backup structure.');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to import backup.';
    throw new Error(message);
  }
}

/**
 * Resets the entire vault (clears local storage).
 */
export function resetLocalVault(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

