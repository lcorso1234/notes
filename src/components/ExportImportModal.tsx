'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { exportNotesBackup, importNotesBackup } from '@/lib/vaultStorage';
import { VaultItem } from '@/types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: VaultItem[];
  onImportSuccess: (importedItems: VaultItem[]) => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  items,
  onImportSuccess,
}: ExportImportModalProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      exportNotesBackup(items);
    } catch {
      alert('Failed to export backup.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const newItems = importNotesBackup(text);
        setImportStatus('Backup restored successfully!');
        onImportSuccess(newItems);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: unknown) {
        setImportStatus(err instanceof Error ? err.message : 'Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base font-serif">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Backup & Restore Notes</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Notes */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Notes & Passwords Backup</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download a backup file (.json) containing all your notes, thoughts, and credentials to keep on your computer or drive.
          </p>
          <button
            onClick={handleExport}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Restore from Backup */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Upload className="w-4 h-4 text-amber-500" />
            <span>Restore From Backup File</span>
          </div>
          <p className="text-xs text-slate-500">
            Restore a previously exported backup file onto this device.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {importStatus && (
            <p className="text-xs text-emerald-600 font-medium">{importStatus}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
