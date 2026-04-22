import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, ArrowUpDown, Filter, X } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { Company, Status, statusColorClass, statusList } from '@/data/mockData';
import TagChip from './TagChip';
import TagPicker from './TagPicker';

const MAX_QUEUE_TAG_CHIPS = 3;

const CallQueue: React.FC = () => {
  const {
    companies, selectedCompanyId, setSelectedCompanyId, role,
    allTags, getTagByName, tagFilterIds, toggleTagFilter, clearTagFilter,
  } = useAppState();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'nextContact' | 'callPriority' | 'companyPriority' | 'status'>('nextContact');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [campaignFilter, setCampaignFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const isAdmin = role === 'admin';

  // Build a Set of tag NAMES (lower-cased) corresponding to active tag-id filters
  const activeTagNames = useMemo(() => {
    const names = new Set<string>();
    tagFilterIds.forEach(id => {
      const t = allTags.find(x => x.id === id);
      if (t) names.add(t.name.toLowerCase());
    });
    return names;
  }, [tagFilterIds, allTags]);

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

    // Tag filter: OR logic — record matches if it has ANY of the selected tags.
    // Records with no tags are hidden when the tag filter is active.
    if (activeTagNames.size > 0) {
      items = items.filter(c => {
        if (!c.tags || c.tags.length === 0) return false;
        return c.tags.some(t => activeTagNames.has(t.toLowerCase()));
      });
    }

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
  }, [companies, search, sortField, sortDir, statusFilter, priorityFilter, campaignFilter, activeTagNames]);

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

  const visibleTagsForFilter = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter(t => t.name.toLowerCase().includes(q));
  }, [allTags, tagSearch]);

  const activeFilterCount =
    [statusFilter, priorityFilter, campaignFilter].filter(Boolean).length + tagFilterIds.length;

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filter */}
      <div className="p-2 border-b border-border space-y-1.5">
        <div className="flex gap-1.5 relative">
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
          <div className="space-y-2">
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
                <button
                  onClick={() => { setStatusFilter(''); setPriorityFilter(''); setCampaignFilter(''); clearTagFilter(); }}
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            {/* Tag filter panel */}
            <div className="rounded border border-border bg-surface-2 p-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Tags</span>
                {tagFilterIds.length > 0 && (
                  <button onClick={clearTagFilter} className="text-[10px] text-primary hover:underline">Clear</button>
                )}
              </div>
              {allTags.length > 8 && (
                <input
                  type="text"
                  value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  placeholder="Search tags…"
                  className="w-full text-xs bg-background border border-border rounded px-1.5 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
              <div className="max-h-40 overflow-auto pr-1 space-y-0.5">
                {visibleTagsForFilter.length === 0 && (
                  <div className="text-[11px] text-muted-foreground py-1">No tags</div>
                )}
                {visibleTagsForFilter.map(tag => {
                  const checked = tagFilterIds.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-background cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTagFilter(tag.id)}
                        className="w-3 h-3 rounded border-border accent-primary"
                      />
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="text-foreground truncate">{tag.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
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
}> = ({ company, isSelected, onClick, showPhone, campaignName }) => {
  const { updateCompany } = useAppState();
  const nc = company.nextContact!;

  const visibleTags = company.tags.slice(0, MAX_QUEUE_TAG_CHIPS);
  const overflowCount = Math.max(0, company.tags.length - MAX_QUEUE_TAG_CHIPS);

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
          {visibleTags.map(tag => (
            <TagChip key={tag} name={tag} size="xs" />
          ))}
          {overflowCount > 0 && (
            <span
              className="px-1 py-0 text-[10px] rounded bg-surface-2 text-muted-foreground border border-border"
              title={company.tags.slice(MAX_QUEUE_TAG_CHIPS).join(', ')}
            >
              +{overflowCount}
            </span>
          )}
          <TagPicker
            assigned={company.tags}
            onChange={(next) => updateCompany(company.id, { tags: next })}
          />
        </div>
      </td>
    </tr>
  );
};

export default CallQueue;
