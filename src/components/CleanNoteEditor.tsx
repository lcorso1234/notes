'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, 
  CheckCircle2, 
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Copy,
  Check
} from 'lucide-react';
import { VaultItem } from '@/types';

interface CleanNoteEditorProps {
  note: VaultItem;
  onUpdateNote: (updated: VaultItem) => void;
  onDeleteNote: (id: string) => void;
  onBack?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function CleanNoteEditor({
  note,
  onUpdateNote,
  onDeleteNote,
  onBack,
  isSidebarCollapsed,
  onToggleSidebar,
}: CleanNoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [savedStatus, setSavedStatus] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if selected note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

  // Auto-resize title textarea to prevent any text clipping or cutoff
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    const updated = {
      ...note,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    };
    onUpdateNote(updated);
    triggerSaved();
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    const updated = {
      ...note,
      content: newContent,
      updatedAt: new Date().toISOString(),
    };
    onUpdateNote(updated);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 1500);
  };

  const handleCopyNote = () => {
    const fullText = `${title}\n\n${content}`.trim();
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Format date like Apple Notes (e.g. October 22, 2026 at 10:20 AM)
  const formatNoteDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })} at ${d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  };

  // Word & character stats
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Apple Notes-Style Minimal Action Bar */}
      <div className="h-12 px-4 sm:px-8 border-b border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle Sidebar (Full Screen Mode) */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar (Full Screen)'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex items-center gap-1.5 py-1 px-2.5 -ml-1 text-blue-700 hover:text-blue-900 font-semibold text-xs rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Notes</span>
            </button>
          )}

          {savedStatus && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Saved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            {words} {words === 1 ? 'word' : 'words'} · {chars} chars
          </span>

          <button
            onClick={handleCopyNote}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50 flex items-center gap-1 text-xs"
            title="Copy Note Text"
          >
            {copiedStatus ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => {
              if (confirm('Delete this note permanently?')) {
                onDeleteNote(note.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full-Screen Pure White Writing Space (Apple Notes Flow) */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col px-6 sm:px-12 md:px-16 lg:px-20 py-6 sm:py-8">
        {/* Apple Notes Centered/Aligned Timestamp */}
        <div className="text-xs text-slate-400 font-medium mb-3 select-none">
          {formatNoteDate(note.updatedAt)}
        </div>

        {/* Auto-Wrapping Full-Width Title (Never cut off horizontally) */}
        <textarea
          ref={titleRef}
          rows={1}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              contentRef.current?.focus();
            }
          }}
          placeholder="Title"
          className="w-full text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none resize-none overflow-hidden bg-transparent mb-3 leading-snug break-words whitespace-pre-wrap transition-all"
        />

        {/* Full-Screen Note Content Canvas */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing..."
          autoFocus
          className="w-full flex-1 bg-transparent text-slate-800 placeholder:text-slate-300 text-base sm:text-lg leading-relaxed focus:outline-none resize-none font-sans min-h-[500px]"
        />
      </div>
    </div>
  );
}
