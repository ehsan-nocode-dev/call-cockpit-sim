import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, ArrowUpDown, Tag, Filter, X } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { Company, Status, statusColorClass, statusList } from '@/data/mockData';

const CallQueue: React.FC = () => {
  const { companies, selectedCompanyId, setSelectedCompanyId, role } = useAppState();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'nextContact' | 'callPriority' | 'companyPriority' | 'status'>('nextContact');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [campaignFilter, setCampaignFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [editingTagCompanyId, setEditingTagCompanyId] = useState<string | null>(null);

  const isAdmin = role === 'admin';

  const queueItems = useMemo(() => {
    let items = companies.filter(c => c.nextContact !== null);

    if (search) {
      const q = search.toLowerCase().replace(/\s/g, '');
      items = items.filter(c => {
        const phoneConcat = `${c.decisionMaker.mobile}${c.decisionMaker.direct}${c.centralPhone}`.replace(/\s/g, '').toLowerCase();
        return (
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.decisionMaker.lastName.toLowerCase().includes(search.toLowerCase()) ||
          c.decisionMaker.firstName.toLowerCase().includes(search.toLowerCase()) ||
          c.campaignId.toLowerCase().includes(search.toLowerCase()) ||
          c.status.toLowerCase().includes(search.toLowerCase()) ||
          phoneConcat.includes(q)
        );
      });
    }

    if (statusFilter) items = items.filter(c => c.status === statusFilter);
    if (priorityFilter) items = items.filter(c => c.companyPriority === priorityFilter);
    if (campaignFilter) items = items.filter(c => c.campaignId === campaignFilter);

    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nextContact') {
        cmp = (a.nextContact?.getTime() || 0) - (b.nextContact?.getTime() || 0);
      } else if (sortField === 'callPriority') {
        cmp = (a.callPriority || 99) - (b.callPriority || 99);
      } else if (sortField === 'companyPriority') {
        cmp = a.companyPriority.localeCompare(b.companyPriority);
      } else if (sortField === 'status') {
        cmp = statusList.indexOf(a.status) - statusList.indexOf(b.status);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [companies, search, sortField, sortDir, statusFilter, priorityFilter, campaignFilter]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortHeader: React.FC<{ field: typeof sortField; children: React.ReactNode; className?: string }> = ({ field, children, className }) => (
    <th className={`cursor-pointer select-none ${className || ''}`} onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'opacity-100' : 'opacity-30'}`} />
      </div>
    </th>
  );

  const getCampaignName = (id: string) => {
    const names: Record<string, string> = {
      'camp-1': 'DACH M&A',
      'camp-2': 'Nordics GE',
      'camp-3': 'UK Succession',
    };
    return names[id] || id;
  };

  const activeFilterCount = [statusFilter, priorityFilter, campaignFilter].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filter */}
      <div className="p-2 border-b border-border space-y-1.5">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, status, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded bg-surface-2 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-2 py-1.5 text-xs rounded border transition-colors flex items-center gap-1 ${
              activeFilterCount > 0 ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-surface-2 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter className="w-3 h-3" />
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
        </div>
        {showFilters && (
          <div className="flex gap-1.5 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | '')} className="text-xs bg-surface-2 border border-border rounded px-1.5 py-1 text-foreground">
              <option value="">All Statuses</option>
              {statusList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="text-xs bg-surface-2 border border-border rounded px-1.5 py-1 text-foreground">
              <option value="">All Priorities</option>
              {['A','B','C','D','E'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} className="text-xs bg-surface-2 border border-border rounded px-1.5 py-1 text-foreground">
              <option value="">All Campaigns</option>
              <option value="camp-1">DACH M&A</option>
              <option value="camp-2">Nordics GE</option>
              <option value="camp-3">UK Succession</option>
            </select>
            {activeFilterCount > 0 && (
              <button onClick={() => { setStatusFilter(''); setPriorityFilter(''); setCampaignFilter(''); }} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              <SortHeader field="nextContact">Next</SortHeader>
              <SortHeader field="callPriority">CP</SortHeader>
              <SortHeader field="companyPriority">Pr</SortHeader>
              <th>Company</th>
              <th>Campaign</th>
              <th>Decision Maker</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {queueItems.map(company => (
              <QueueRow
                key={company.id}
                company={company}
                isSelected={company.id === selectedCompanyId}
                onClick={() => setSelectedCompanyId(company.id)}
                showPhone={isAdmin}
                campaignName={getCampaignName(company.campaignId)}
                editingTag={editingTagCompanyId === company.id}
                tagInput={editingTagCompanyId === company.id ? tagInput : ''}
                onTagInputChange={setTagInput}
                onStartEditTag={() => { setEditingTagCompanyId(company.id); setTagInput(''); }}
                onCancelEditTag={() => setEditingTagCompanyId(null)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border text-xs text-muted-foreground">
        {queueItems.length} items in queue
      </div>
    </div>
  );
};

const QueueRow: React.FC<{
  company: Company;
  isSelected: boolean;
  onClick: () => void;
  showPhone: boolean;
  campaignName: string;
  editingTag: boolean;
  tagInput: string;
  onTagInputChange: (v: string) => void;
  onStartEditTag: () => void;
  onCancelEditTag: () => void;
}> = ({ company, isSelected, onClick, showPhone, campaignName, editingTag, tagInput, onTagInputChange, onStartEditTag, onCancelEditTag }) => {
  const { updateCompany } = useAppState();
  const nc = company.nextContact!;

  const addTag = () => {
    if (tagInput.trim()) {
      updateCompany(company.id, { queueTags: [...company.queueTags, tagInput.trim()] });
      onTagInputChange('');
      onCancelEditTag();
    }
  };

  const removeTag = (tag: string) => {
    updateCompany(company.id, { queueTags: company.queueTags.filter(t => t !== tag) });
  };

  return (
    <tr className={isSelected ? 'selected' : ''} onClick={onClick} style={{ cursor: 'pointer' }}>
      <td>
        <div className="font-mono">
          <span className="text-foreground font-semibold">{format(nc, 'HH:mm')}</span>
          <span className="text-muted-foreground text-xs ml-1">{format(nc, 'dd.MM')}</span>
        </div>
      </td>
      <td>
        {company.callPriority && (
          <span className={`priority-badge call-priority-${company.callPriority}`}>
            {company.callPriority}
          </span>
        )}
      </td>
      <td>
        <span className={`priority-badge priority-${company.companyPriority.toLowerCase()}`}>
          {company.companyPriority}
        </span>
      </td>
      <td>
        <div>
          <div className="text-foreground font-medium text-xs">{company.name}</div>
          <span className={`status-pill ${statusColorClass[company.status]} text-[10px] py-0 px-1.5 mt-0.5 inline-block`}>{company.status}</span>
        </div>
      </td>
      <td className="text-xs text-muted-foreground">{campaignName}</td>
      <td className="text-xs">
        <div>
          <div>{company.decisionMaker.title} {company.decisionMaker.firstName} {company.decisionMaker.lastName}</div>
          {showPhone && (
            <div className="flex flex-col gap-0">
              {company.decisionMaker.mobile && (
                <a href={`tel:${company.decisionMaker.mobile}`} className="phone-link text-[10px]" onClick={e => e.stopPropagation()}>
                  📱 {company.decisionMaker.mobile}
                </a>
              )}
              {company.decisionMaker.direct && (
                <a href={`tel:${company.decisionMaker.direct}`} className="phone-link text-[10px]" onClick={e => e.stopPropagation()}>
                  ☎️ {company.decisionMaker.direct}
                </a>
              )}
            </div>
          )}
        </div>
      </td>
      <td onClick={e => e.stopPropagation()}>
        <div className="flex flex-wrap gap-0.5 items-center">
          {company.queueTags.map(tag => (
            <span key={tag} className="px-1 py-0 text-[10px] rounded bg-primary/10 text-primary flex items-center gap-0.5">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          {editingTag ? (
            <input
              autoFocus
              value={tagInput}
              onChange={e => onTagInputChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') onCancelEditTag(); }}
              onBlur={() => { if (tagInput.trim()) addTag(); else onCancelEditTag(); }}
              className="w-14 text-[10px] bg-surface-2 border border-border rounded px-1 py-0 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="tag"
            />
          ) : (
            <button onClick={onStartEditTag} className="text-muted-foreground hover:text-primary">
              <Tag className="w-3 h-3" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default CallQueue;
