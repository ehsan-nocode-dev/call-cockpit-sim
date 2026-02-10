import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, ArrowUpDown, Tag } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { Company } from '@/data/mockData';

const CallQueue: React.FC = () => {
  const { companies, selectedCompanyId, setSelectedCompanyId, role } = useAppState();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'nextContact' | 'callPriority' | 'companyPriority'>('nextContact');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Only show companies with nextContact set
  const queueItems = useMemo(() => {
    let items = companies.filter(c => c.nextContact !== null);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.decisionMaker.lastName.toLowerCase().includes(q) ||
        c.decisionMaker.firstName.toLowerCase().includes(q) ||
        c.campaignId.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nextContact') {
        cmp = (a.nextContact?.getTime() || 0) - (b.nextContact?.getTime() || 0);
      } else if (sortField === 'callPriority') {
        cmp = (a.callPriority || 99) - (b.callPriority || 99);
      } else if (sortField === 'companyPriority') {
        cmp = a.companyPriority.localeCompare(b.companyPriority);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [companies, search, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortHeader: React.FC<{ field: typeof sortField; children: React.ReactNode }> = ({ field, children }) => (
    <th className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
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

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search queue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded bg-surface-2 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              <SortHeader field="nextContact">Next Contact</SortHeader>
              <SortHeader field="callPriority">CP</SortHeader>
              <SortHeader field="companyPriority">Pr</SortHeader>
              <th>Company</th>
              <th>Status</th>
              <th>Campaign</th>
              <th>Decision Maker</th>
              {role === 'admin' && <th>Phone</th>}
            </tr>
          </thead>
          <tbody>
            {queueItems.map(company => (
              <QueueRow
                key={company.id}
                company={company}
                isSelected={company.id === selectedCompanyId}
                onClick={() => setSelectedCompanyId(company.id)}
                showPhone={role === 'admin'}
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
  const nc = company.nextContact!;

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
          <div className="text-muted-foreground text-xs">{company.city}, {company.country}</div>
        </div>
      </td>
      <td>
        <span className={`status-pill status-${company.status}`}>{company.status}</span>
      </td>
      <td className="text-xs text-muted-foreground">{campaignName}</td>
      <td className="text-xs">
        {company.decisionMaker.title} {company.decisionMaker.firstName} {company.decisionMaker.lastName}
      </td>
      {showPhone && (
        <td>
          <div className="flex flex-col gap-0.5">
            {company.decisionMaker.mobile && (
              <a href={`tel:${company.decisionMaker.mobile}`} className="phone-link text-xs">
                📱 {company.decisionMaker.mobile}
              </a>
            )}
            {company.decisionMaker.direct && (
              <a href={`tel:${company.decisionMaker.direct}`} className="phone-link text-xs">
                ☎️ {company.decisionMaker.direct}
              </a>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default CallQueue;
