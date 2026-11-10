'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles, 
  Upload, 
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { initializeVault, unlockVault, importEncryptedBackup, resetLocalVault } from '@/lib/vaultStorage';
import { VaultItem } from '@/types';
import { Logo } from './Logo';

interface LockScreenProps {
  isInitialized: boolean;
  onUnlocked: (items: VaultItem[], passphrase: string) => void;
  onVaultImported: () => void;
}

export function LockScreen({ isInitialized, onUnlocked, onVaultImported }: LockScreenProps) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passphrase.trim()) {
      setError('Please enter your master passphrase.');
      return;
    }

    if (!isInitialized) {
      if (passphrase.length < 8) {
        setError('Master passphrase must be at least 8 characters long for adequate security.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setError('Master passphrases do not match. Please re-enter carefully.');
        return;
      }

      setLoading(true);
      try {
        const items = await initializeVault(passphrase);
        onUnlocked(items, passphrase);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to initialize vault.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const items = await unlockVault(passphrase);
        onUnlocked(items, passphrase);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Incorrect master passphrase.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        await importEncryptedBackup(content);
        setError(null);
        alert('Encrypted backup successfully restored. You may now enter your master passphrase to unlock.');
        onVaultImported();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.18)] p-6 sm:p-8 space-y-6">
        
        {/* Header Icon & Brand with Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-inner">
            <Logo size={64} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-blue-950 tracking-wide">
              {isInitialized ? 'Practitioner Sanctuary' : 'Create Your Sovereign Vault'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1">
              {isInitialized
                ? 'Confidential sanctuary for your memory, thoughts, and credentials.'
                : 'Zero-knowledge encrypted notes and password vault for guiding competence, confidence, and self-awareness.'}
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/90 border border-blue-200/60 text-blue-900 text-xs leading-relaxed">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
          <span>
            <strong>Zero-Knowledge:</strong> Encrypted locally with military-grade AES-256-GCM. Only you hold the key.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <span>{isInitialized ? 'Master Passphrase' : 'New Master Passphrase'}</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-1 text-[11px] font-medium"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter master passphrase..."
                autoFocus
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all pr-11"
              />
              <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {!isInitialized && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                Confirm Passphrase
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-enter master passphrase..."
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Choose a strong passphrase you will remember. Zero-knowledge encryption means it cannot be reset by any third party.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-[0_2px_10px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
            ) : isInitialized ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock Vault</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Secure Vault</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="hover:text-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Privacy & Security</span>
          </button>
        </div>

        {/* Restore Backup Panel */}
        {showImport && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-500" />
              Restore Encrypted Backup File
            </h4>
            <p className="text-[11px] text-slate-500">
              Select a previously exported `.json` vault backup file to restore onto this device.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>
        )}

        {/* Security Help Panel */}
        {showHelp && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
            <h4 className="font-semibold text-slate-900">Privacy Safeguards:</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li><strong>Local Encryption:</strong> Notes and passwords are encrypted in your browser with AES-GCM 256.</li>
              <li><strong>Zero Cloud Tracking:</strong> No third-party servers hold your decrypted keys.</li>
              <li><strong>Complete Control:</strong> You can export full backups anytime.</li>
            </ul>
            {isInitialized && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Warning: This will clear the local encrypted vault on this device. Ensure you have backed up if needed. Proceed?')) {
                      resetLocalVault();
                      window.location.reload();
                    }
                  }}
                  className="text-rose-600 hover:text-rose-700 text-[11px] underline"
                >
                  Reset local vault on this device
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
