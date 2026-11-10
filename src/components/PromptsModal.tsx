'use client';

import React, { useState } from 'react';
import { X, Sparkles, Compass, Trophy, Heart, Plus, ArrowRight } from 'lucide-react';
import { PRACTITIONER_PROMPTS, PractitionerPrompt } from '@/lib/prompts';
import { PillarCategory } from '@/types';

interface PromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: PractitionerPrompt) => void;
}

export function PromptsModal({ isOpen, onClose, onSelectPrompt }: PromptsModalProps) {
  const [selectedPillar, setSelectedPillar] = useState<string>('all');

  if (!isOpen) return null;

  const filteredPrompts = PRACTITIONER_PROMPTS.filter((p) => {
    if (selectedPillar === 'all') return true;
    return p.pillar === selectedPillar;
  });

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'self_awareness':
        return <Compass className="w-4 h-4 text-indigo-400" />;
      case 'competence':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'confidence':
        return <Trophy className="w-4 h-4 text-emerald-400" />;
      default:
        return <Heart className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-base font-serif font-semibold text-stone-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Practitioner Reflection & Inquiry Prompts</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Deepen client inquiry, track subtle psychological patterns, or anchor personal boundaries.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pillar Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto py-1 text-xs">
          {[
            { id: 'all', label: 'All Prompts' },
            { id: 'self_awareness', label: 'Self-Awareness' },
            { id: 'competence', label: 'Competence' },
            { id: 'confidence', label: 'Confidence' },
            { id: 'personal', label: 'Practitioner Wellbeing' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPillar(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedPillar === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Prompts Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-4 bg-stone-950/70 border border-stone-800/80 rounded-xl hover:border-stone-700 hover:bg-stone-950 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-200 mb-1.5">
                  {getPillarIcon(prompt.pillar)}
                  <span>{prompt.title}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  &ldquo;{prompt.inquiry}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => {
                    onSelectPrompt(prompt);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Entry with this Prompt</span>
                  <ArrowRight className="w-3 h-3 ml-0.5 opacity-60" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

