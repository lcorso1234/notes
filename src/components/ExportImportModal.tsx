'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Clock, 
  ShieldCheck, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { exportEncryptedBackup, importEncryptedBackup, resetLocalVault } from '@/lib/vaultStorage';
import { VaultItem, VaultSettings } from '@/types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: VaultItem[];
  settings: VaultSettings;
  onUpdateSettings: (settings: VaultSettings) => void;
  onVaultReload: () => void;
  onLockVault: () => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  items,
  settings,
  onUpdateSettings,
  onVaultReload,
  onLockVault,
}: ExportImportModalProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportEncrypted = () => {
    try {
      exportEncryptedBackup();
    } catch {
      alert('Failed to export encrypted backup.');
    }
  };

  const handleExportPlaintext = () => {
    if (!confirm('Warning: This will download an UNENCRYPTED JSON file containing your notes and passwords. Keep this file in an encrypted physical drive or safe place. Proceed?')) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      practitionerNotesCount: items.length,
      items,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practitioner-plaintext-archive-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        await importEncryptedBackup(text);
        setImportStatus('Backup imported successfully! Please unlock the vault with the backup master passphrase.');
        setTimeout(() => {
          onClose();
          onVaultReload();
          onLockVault();
        }, 1500);
      } catch (err: unknown) {
        setImportStatus(err instanceof Error ? err.message : 'Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-stone-100 font-semibold text-base font-serif">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Vault Security & Backup Management</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-Lock Settings */}
        <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-200">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Inactivity Auto-Lock Timer</span>
            </div>
            <select
              value={settings.autoLockMinutes}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  autoLockMinutes: Number(e.target.value),
                })
              }
              className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value={5}>Lock after 5 minutes</option>
              <option value={15}>Lock after 15 minutes (Default)</option>
              <option value={30}>Lock after 30 minutes</option>
              <option value={60}>Lock after 1 hour</option>
              <option value={0}>Never (Manual lock only)</option>
            </select>
          </div>
          <p className="text-[11px] text-stone-400">
            Automatically clears decrypted memory and returns to the master lock screen when inactive.
          </p>
        </div>

        {/* Backups: Encrypted */}
        <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-200">
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Encrypted Vault Backup</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Download your entire vault as an encrypted `.json` file. Safe to store anywhere (cloud drive, thumb drive, or email to yourself) because only someone with your master passphrase can decrypt it.
          </p>
          <button
            onClick={handleExportEncrypted}
            className="py-2 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Encrypted Backup (.json)</span>
          </button>
        </div>

        {/* Restore from Backup */}
        <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-200">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Restore From Encrypted Backup</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Restore a previous backup file to this browser.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="block w-full text-xs text-stone-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-stone-800 file:text-stone-200 hover:file:bg-stone-700 cursor-pointer"
          />
          {importStatus && (
            <p className="text-xs text-emerald-400 font-medium">{importStatus}</p>
          )}
        </div>

        {/* Plaintext Archive Option */}
        <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Plaintext Export (Unencrypted Archive)</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Exports your notes, insights, and passwords in clear text JSON format for personal hard-copy printing or migration.
          </p>
          <button
            onClick={handleExportPlaintext}
            className="py-2 px-4 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-200 font-medium rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Plaintext Archive</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
