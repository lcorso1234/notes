'use client';

import React, { useState } from 'react';
import { Zap, X, Compass, Sparkles, Trophy, FileText } from 'lucide-react';
import { PillarCategory, VaultItem } from '@/types';

interface QuickThoughtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (thought: Partial<VaultItem>) => void;
}

export function QuickThoughtModal({ isOpen, onClose, onSave }: QuickThoughtModalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [pillar, setPillar] = useState<PillarCategory>('self_awareness');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSave({
      title: title.trim() || `Reflection — ${new Date().toLocaleDateString()}`,
      content: content.trim(),
      pillar,
      type: 'thought',
      tags: ['QuickMemory'],
      pinned: false,
    });

    setContent('');
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Zap className="w-4 h-4" />
            <span>Capture Memory / Fleeting Thought</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {[
              { id: 'self_awareness' as PillarCategory, label: 'Awareness', icon: Compass },
              { id: 'confidence' as PillarCategory, label: 'Confidence', icon: Trophy },
              { id: 'competence' as PillarCategory, label: 'Competence', icon: Sparkles },
              { id: 'personal' as PillarCategory, label: 'Personal', icon: FileText },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPillar(p.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                    pillar === p.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief Title (optional)..."
            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the realization, insight, or memory that just surfaced..."
            rows={5}
            autoFocus
            className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed resize-none"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl text-xs transition-all shadow-md disabled:opacity-40"
            >
              Save to Sanctuary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
