import React, { createContext, useContext, useState, useCallback } from 'react';
import { Company, UserRole, HistoryEntry, companies as initialCompanies } from '@/data/mockData';

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  companies: Company[];
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  selectedCompany: Company | null;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  addHistoryEntry: (companyId: string, entry: Omit<HistoryEntry, 'id'>) => void;
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

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addHistoryEntry = useCallback((companyId: string, entry: Omit<HistoryEntry, 'id'>) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== companyId) return c;
      const newEntry: HistoryEntry = { ...entry, id: `h-${Date.now()}-${Math.random().toString(36).slice(2)}` };
      return { ...c, history: [...c.history, newEntry] };
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      role, setRole, companies, selectedCompanyId, setSelectedCompanyId,
      selectedCompany, updateCompany, addHistoryEntry,
    }}>
      {children}
    </AppContext.Provider>
  );
};
