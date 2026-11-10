'use client';

import React from 'react';
import { 
  VaultItem, 
  PillarCategory 
} from '@/types';
import { 
  Star, 
  Key, 
  Compass, 
  Sparkles, 
  Trophy, 
  Users, 
  Clock, 
  Copy, 
  Check, 
  FileText,
  Lock
} from 'lucide-react';

interface ItemListProps {
  items: VaultItem[];
  selectedItem: VaultItem | null;
  onSelectItem: (item: VaultItem) => void;
  searchQuery: string;
}

export function ItemList({
  items,
  selectedItem,
  onSelectItem,
  searchQuery,
}: ItemListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyPassword = (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    if (!item.credential?.password) return;
    navigator.clipboard.writeText(item.credential.password);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPillarBadge = (pillar: PillarCategory) => {
    switch (pillar) {
      case 'competence':
        return {
          label: 'Competence',
          icon: Sparkles,
          color: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
        };
      case 'confidence':
        return {
          label: 'Confidence',
          icon: Trophy,
          color: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
        };
      case 'self_awareness':
        return {
          label: 'Self-Awareness',
          icon: Compass,
          color: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
        };
      case 'client':
        return {
          label: 'Client Record',
          icon: Users,
          color: 'bg-sky-950/40 text-sky-300 border-sky-800/40',
        };
      case 'credentials':
        return {
          label: 'Password',
          icon: Key,
          color: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
        };
      default:
        return {
          label: 'Personal',
          icon: FileText,
          color: 'bg-stone-900 text-stone-300 border-stone-800',
        };
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (items.length === 0) {
    return (
      <div className="w-80 border-r border-stone-800/80 bg-stone-950/40 flex flex-col items-center justify-center p-6 text-center text-stone-500">
        <Lock className="w-8 h-8 mb-2 opacity-40 text-amber-500" />
        <p className="text-sm font-medium text-stone-400">No matching entries</p>
        <p className="text-xs text-stone-600 mt-1">
          {searchQuery ? `No results for "${searchQuery}"` : 'Create a new entry to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 md:w-96 border-r border-stone-800/80 bg-stone-950/30 flex flex-col h-full overflow-hidden">
      {/* Items Count Header */}
      <div className="px-4 py-2.5 border-b border-stone-800/60 flex items-center justify-between text-xs text-stone-500 bg-stone-950/60">
        <span>{items.length} {items.length === 1 ? 'entry' : 'entries'}</span>
        {searchQuery && (
          <span className="text-amber-400/80 truncate max-w-[140px]">
            Filtering: &quot;{searchQuery}&quot;
          </span>
        )}
      </div>

      {/* Items Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-800/40 scrollbar-thin">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const badge = getPillarBadge(item.pillar);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`p-4 cursor-pointer transition-all select-none group relative ${
                isSelected
                  ? 'bg-stone-800/80 border-l-2 border-l-amber-500 shadow-sm'
                  : 'hover:bg-stone-900/50 border-l-2 border-l-transparent'
              }`}
            >
              {/* Header row: Badge, Pin, Date */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}
                >
                  <BadgeIcon className="w-2.5 h-2.5" />
                  <span>{badge.label}</span>
                </span>

                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  {item.pinned && (
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  )}
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-stone-200 line-clamp-1 group-hover:text-amber-300 transition-colors">
                {item.title || 'Untitled Entry'}
              </h3>

              {/* Snippet / Credential Info */}
              {item.type === 'password' && item.credential ? (
                <div className="mt-1.5 flex items-center justify-between bg-stone-950/70 border border-stone-800/80 rounded-md px-2 py-1 text-xs">
                  <span className="text-stone-400 font-mono text-[11px] truncate max-w-[160px]">
                    {item.credential.username || 'No username'}
                  </span>
                  <button
                    onClick={(e) => handleCopyPassword(e, item)}
                    title="Copy Password"
                    className="p-1 text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {item.clientName && (
                    <strong className="text-stone-300 mr-1">Client: {item.clientName} —</strong>
                  )}
                  {item.content || 'No additional content'}
                </p>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400"
                    >
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-[10px] text-stone-500">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

