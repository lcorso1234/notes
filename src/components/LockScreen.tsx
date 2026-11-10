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
  FileCheck2,
  Brain
} from 'lucide-react';
import { initializeVault, unlockVault, importEncryptedBackup, resetLocalVault } from '@/lib/vaultStorage';
import { VaultItem } from '@/types';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      <div className="w-full max-w-md bg-stone-900/90 border border-stone-800/80 rounded-2xl shadow-2xl backdrop-blur-xl p-8 space-y-6">
        
        {/* Header Icon & Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2 shadow-inner">
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif tracking-wide text-stone-100 font-semibold">
            {isInitialized ? 'Practitioner Sanctuary' : 'Create Your Sovereign Vault'}
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed">
            {isInitialized
              ? 'Confidential sanctuary for your memory, client breakthroughs, thoughts, and credentials.'
              : 'End-to-end encrypted notes and password vault for guiding competence, confidence, and self-awareness.'}
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Zero-Knowledge Encryption:</strong> Encrypted locally with AES-256-GCM. Only you hold the key.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300 uppercase tracking-wider flex items-center justify-between">
              <span>{isInitialized ? 'Master Passphrase' : 'New Master Passphrase'}</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-[11px]"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter master passphrase..."
                autoFocus
                disabled={loading}
                className="w-full px-4 py-3 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all pr-10"
              />
              <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-stone-500" />
            </div>
          </div>

          {!isInitialized && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                Confirm Passphrase
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-enter master passphrase..."
                disabled={loading}
                className="w-full px-4 py-3 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
              <p className="text-[11px] text-stone-400">
                Choose a strong passphrase that you can remember. Because this is zero-knowledge, it cannot be recovered if forgotten.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-stone-950 border-t-transparent" />
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
        <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="hover:text-stone-300 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Privacy & Security</span>
          </button>
        </div>

        {/* Backup Restore Panel */}
        {showImport && (
          <div className="p-4 bg-stone-950/90 border border-stone-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              Restore Encrypted Backup File
            </h4>
            <p className="text-[11px] text-stone-400">
              Select a previously exported `.json` vault backup file to restore on this device.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-xs text-stone-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-stone-800 file:text-stone-200 hover:file:bg-stone-700 cursor-pointer"
            />
          </div>
        )}

        {/* Help Panel */}
        {showHelp && (
          <div className="p-4 bg-stone-950/90 border border-stone-800 rounded-xl space-y-2 text-xs text-stone-300">
            <h4 className="font-semibold text-stone-200">How Your Data Is Kept Confidential:</h4>
            <ul className="list-disc pl-4 space-y-1 text-stone-400 text-[11px]">
              <li><strong>Local-only encryption:</strong> No cloud database, no tracking, no external server.</li>
              <li><strong>AES-GCM 256-bit:</strong> Standard military/banking grade cipher.</li>
              <li><strong>Master Key:</strong> Only you possess the passphrase. Even if someone inspects this browser, your data is an unreadable cipher.</li>
            </ul>
            {isInitialized && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Warning: This will clear the local encrypted vault on this browser. Ensure you have exported a backup. Proceed?')) {
                      resetLocalVault();
                      window.location.reload();
                    }
                  }}
                  className="text-rose-400 hover:text-rose-300 text-[11px] underline"
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

