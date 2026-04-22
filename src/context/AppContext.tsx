import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Company, UserRole, HistoryEntry, companies as initialCompanies } from '@/data/mockData';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Master seed list (per spec) + colors for any pre-existing tag names found in mock data.
const SEED_TAGS: Tag[] = [
  { id: '1', name: 'manufacturing', color: '#6366f1' },
  { id: '2', name: 'automation', color: '#10b981' },
  { id: '3', name: 'family-owned', color: '#f59e0b' },
  { id: '4', name: 'founder', color: '#3b82f6' },
  { id: '5', name: 'retiring-soon', color: '#ef4444' },
  { id: '6', name: 'evening-ok', color: '#8b5cf6' },
];

// Color palette cycled through when auto-creating new tags
const TAG_PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#a855f7',
  '#eab308', '#0ea5e9', '#f43f5e', '#22c55e',
];

// Discover any extra tag names already used in mock data and add them with cycled colors
const buildInitialTags = (cos: Company[]): Tag[] => {
  const tags: Tag[] = [...SEED_TAGS];
  const seen = new Set(tags.map(t => t.name.toLowerCase()));
  let nextId = tags.length + 1;
  let paletteIdx = tags.length;
  const consider = (name: string) => {
    const k = name.toLowerCase();
    if (!k || seen.has(k)) return;
    seen.add(k);
    tags.push({
      id: String(nextId++),
      name,
      color: TAG_PALETTE[paletteIdx++ % TAG_PALETTE.length],
    });
  };
  cos.forEach(c => {
    c.tags.forEach(consider);
    c.decisionMaker?.tags?.forEach(consider);
  });
  return tags;
};

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  companies: Company[];
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  selectedCompany: Company | null;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  addHistoryEntry: (companyId: string, entry: Omit<HistoryEntry, 'id'> & { id?: string }) => void;
  // Tags master list & filter
  allTags: Tag[];
  getTagByName: (name: string) => Tag | undefined;
  upsertTag: (name: string) => Tag; // create if missing, return existing otherwise
  tagFilterIds: string[]; // tag IDs currently active in the queue filter
  toggleTagFilter: (tagId: string) => void;
  clearTagFilter: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('admin');
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(initialCompanies[0]?.id || null);
  const [allTags, setAllTags] = useState<Tag[]>(() => buildInitialTags(initialCompanies));
  const [tagFilterIds, setTagFilterIds] = useState<string[]>([]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addHistoryEntry = useCallback((companyId: string, entry: Omit<HistoryEntry, 'id'> & { id?: string }) => {
    const entryId = entry.id || `h-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      const newEntry: HistoryEntry = { ...entry, id: entryId };
      return { ...c, history: [...c.history, newEntry] };
    }));
    return entryId;
  }, []);

  const tagsByName = useMemo(() => {
    const m = new Map<string, Tag>();
    allTags.forEach(t => m.set(t.name.toLowerCase(), t));
    return m;
  }, [allTags]);

  const getTagByName = useCallback((name: string) => {
    return tagsByName.get(name.toLowerCase());
  }, [tagsByName]);

  const upsertTag = useCallback((rawName: string): Tag => {
    const name = rawName.trim();
    const existing = tagsByName.get(name.toLowerCase());
    if (existing) return existing;
    const color = TAG_PALETTE[allTags.length % TAG_PALETTE.length];
    const tag: Tag = { id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, color };
    setAllTags(prev => [...prev, tag]);
    return tag;
  }, [allTags.length, tagsByName]);

  const toggleTagFilter = useCallback((tagId: string) => {
    setTagFilterIds(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  }, []);

  const clearTagFilter = useCallback(() => setTagFilterIds([]), []);

  return (
    <AppContext.Provider value={{
      role, setRole, companies, selectedCompanyId, setSelectedCompanyId,
      selectedCompany, updateCompany, addHistoryEntry,
      allTags, getTagByName, upsertTag,
      tagFilterIds, toggleTagFilter, clearTagFilter,
    }}>
      {children}
    </AppContext.Provider>
  );
};
