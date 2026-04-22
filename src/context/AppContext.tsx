import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Company, UserRole, HistoryEntry, companies as initialCompanies } from '@/data/mockData';
import { Tag, SEED_TAGS, TAG_PALETTE } from './tags';

export type { Tag } from './tags';

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
  upsertTag: (name: string) => Tag;
  tagFilterIds: string[];
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
