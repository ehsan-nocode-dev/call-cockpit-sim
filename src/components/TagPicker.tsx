import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

interface TagPickerProps {
  /** Tag names currently assigned to the record */
  assigned: string[];
  /** Called with the next list of tag names (already de-duplicated) */
  onChange: (next: string[]) => void;
}

/**
 * ClickUp-style search-or-create tag assignment popover.
 * Triggered by a small "+" button rendered inline after the chip list.
 */
const TagPicker: React.FC<TagPickerProps> = ({ assigned, onChange }) => {
  const { allTags, upsertTag } = useAppState();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  const assignedSet = useMemo(() => new Set(assigned.map(a => a.toLowerCase())), [assigned]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter(t => t.name.toLowerCase().includes(q));
  }, [allTags, query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allTags.find(t => t.name.toLowerCase() === q) ?? null;
  }, [allTags, query]);

  const toggleAssign = (name: string) => {
    if (assignedSet.has(name.toLowerCase())) {
      onChange(assigned.filter(a => a.toLowerCase() !== name.toLowerCase()));
    } else {
      onChange([...assigned, name]);
    }
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    // Edge case: if a tag with this name (case-insensitive) already exists, just assign it
    const tag = upsertTag(name);
    if (!assignedSet.has(tag.name.toLowerCase())) {
      onChange([...assigned, tag.name]);
    }
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (exactMatch) {
        toggleAssign(exactMatch.name);
        setQuery('');
      } else if (query.trim()) {
        handleCreate();
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-muted-foreground hover:text-primary text-xs"
        title="Add tag"
      >
        <Plus className="w-3 h-3" />
      </button>

      {open && (
        <div
          className="absolute z-50 top-5 left-0 w-56 rounded-md border border-border bg-popover shadow-lg p-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or create…"
              className="w-full pl-6 pr-2 py-1 text-xs rounded bg-surface-2 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="max-h-48 overflow-auto mt-1">
            {filtered.length === 0 && !query.trim() && (
              <div className="px-2 py-1.5 text-[11px] text-muted-foreground">No tags yet</div>
            )}
            {filtered.map(tag => {
              const isAssigned = assignedSet.has(tag.name.toLowerCase());
              const isExact = exactMatch?.id === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleAssign(tag.name)}
                  className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-xs hover:bg-surface-2 ${isExact ? 'bg-surface-2' : ''}`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span
                    className="flex-1 text-left truncate"
                    style={{ color: tag.color }}
                  >
                    {tag.name}
                  </span>
                  {isAssigned && <Check className="w-3 h-3 text-primary" />}
                </button>
              );
            })}
          </div>

          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleCreate}
              className="mt-1 w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-xs text-primary hover:bg-primary/10 border-t border-border pt-1.5"
            >
              <Plus className="w-3 h-3" />
              <span className="truncate">Create &amp; assign “{query.trim()}”</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TagPicker;
