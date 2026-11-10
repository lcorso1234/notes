'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { VaultItem } from '@/types';

interface CleanNoteEditorProps {
  note: VaultItem;
  onUpdateNote: (updated: VaultItem) => void;
  onDeleteNote: (id: string) => void;
}

export function CleanNoteEditor({
  note,
  onUpdateNote,
  onDeleteNote,
}: CleanNoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [savedStatus, setSavedStatus] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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

  // Word & character stats
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="flex-1 bg-stone-100 flex flex-col h-full overflow-hidden">
      {/* Top Bar for Note Actions */}
      <div className="h-12 px-8 border-b border-stone-200 bg-white/70 backdrop-blur flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>Last edited: {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {savedStatus && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium ml-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-stone-400 font-mono">
            {words} {words === 1 ? 'word' : 'words'} · {chars} chars
          </span>

          <button
            onClick={() => {
              if (confirm('Delete this note permanently?')) {
                onDeleteNote(note.id);
              }
            }}
            className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-stone-100"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The White Blank Space To Write In */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-3xl bg-white border border-stone-200/90 rounded-2xl shadow-sm p-8 sm:p-12 flex flex-col min-h-full">
          {/* Note Title Input */}
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
            className="w-full text-3xl sm:text-4xl font-serif font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none border-b border-stone-100 pb-4 mb-6 transition-all"
          />

          {/* Note Content Blank Writing Canvas */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing here... Your thoughts, reflections, client breakthroughs, or memory..."
            autoFocus
            className="w-full flex-1 bg-transparent text-stone-800 placeholder:text-stone-300 text-base sm:text-lg leading-relaxed focus:outline-none resize-none font-sans"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  );
}

