'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, 
  Clock, 
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if selected note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

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

  // Word & character stats
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Top Action Bar */}
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

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Edited {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {savedStatus && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium ml-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Saved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
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

      {/* Full-Screen Pure White Writing Space */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col px-6 sm:px-12 md:px-16 lg:px-20 py-8 sm:py-10">
        {/* Full-Screen Note Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              textareaRef.current?.focus();
            }
          }}
          placeholder="Note Title..."
          className="w-full text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none border-b border-slate-100 pb-4 mb-6 transition-all bg-transparent"
        />

        {/* Full-Screen Note Content Blank Writing Canvas */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing here... Your thoughts, memory, client breakthroughs, or reflections..."
          autoFocus
          className="w-full flex-1 bg-transparent text-slate-800 placeholder:text-slate-300 text-base sm:text-lg leading-relaxed focus:outline-none resize-none font-sans min-h-[500px]"
        />
      </div>
    </div>
  );
}
