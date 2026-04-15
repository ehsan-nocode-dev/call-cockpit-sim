import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { campaigns, Campaign, Company, statusList, Status } from '@/data/mockData';
import { Search, ChevronUp, ChevronDown, Plus, MoreVertical, Eye, SlidersHorizontal, X, Pencil, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const countryList = ['DE', 'SE', 'CH', 'UK', 'NO', 'AT', 'DK', 'FI', 'US', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'CZ', 'JP', 'AU', 'PK', 'CL', 'ZA', 'DO', 'DJ'];

const CampaignsView: React.FC = () => {
  const { companies, role, updateCompany } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  // Campaign list state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, 'Active' | 'Closed' | 'Archived'>>(() => {
    const map: Record<string, 'Active' | 'Closed' | 'Archived'> = {};
    campaigns.forEach(c => { map[c.id] = 'Active'; });
    return map;
  });

  // Campaign list filter
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'archived' | string>('all');

  // Add Campaign modal
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ name: '', pitchText: '', pitchLink: '' });

  // Edit Campaign modal
  const [editCampaignOpen, setEditCampaignOpen] = useState(false);
  const [editCampaignForm, setEditCampaignForm] = useState({ id: '', name: '', pitchText: '', pitchLink: '' });

  // Archive confirm
  const [archiveConfirm, setArchiveConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  // Add Company modal
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '', phonePrimary: '', phoneSecondary: '', website: '', city: '', country: '',
    employees: '', priority: '', description: '', ebitda: '', ebit: '', lfs: '', netProfit: '', revenue: '',
  });

  // Table state
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showColMenu, setShowColMenu] = useState(false);
  const [deleteCompanyConfirm, setDeleteCompanyConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  const allColumns = [
    { key: 'campaign', label: 'Campaign' },
    { key: 'priority', label: 'Priority' },
    { key: 'name', label: 'Name', alwaysVisible: true },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'website', label: 'Website' },
    { key: 'tags', label: 'Tags' },
    { key: 'lfs', label: 'LFS' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'ebitda', label: 'EBITDA' },
    { key: 'ebit', label: 'EBIT' },
    { key: 'netProfit', label: 'Net Profits' },
    { key: 'employees', label: 'Employees' },
    { key: 'lastContact', label: 'Last Contact' },
    { key: 'nextContact', label: 'Next Contact' },
    { key: 'status', label: 'Status' },
    { key: 'statusSpec', label: 'Status Specification' },
    { key: 'futurePotentialDate', label: 'Future Potential Date' },
    { key: 'statusComment', label: 'Status Comment' },
    { key: 'referral', label: 'Referral' },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(allColumns.map(c => c.key)));

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Filtered campaign list for left panel
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(camp => {
      const status = campaignStatuses[camp.id] || 'Active';
      if (campaignFilter === 'archived') return status === 'Archived';
      if (campaignFilter === 'all') return true;
      // filter by status value
      return status === campaignFilter;
    });
  }, [campaignStatuses, campaignFilter]);

  // Campaign left-panel sort
  const [campaignSortKey, setCampaignSortKey] = useState<string | null>(null);
  const [campaignSortDir, setCampaignSortDir] = useState<'asc' | 'desc'>('asc');

  const campaignListData = useMemo(() => {
    let list = filteredCampaigns.map(camp => {
      const companyCount = companies.filter(c => c.campaignId === camp.id).length;
      const status = campaignStatuses[camp.id] || 'Active';
      return { ...camp, companyCount, status, reach: companyCount > 0 ? `${Math.round(companyCount * 0.6)}` : '0', createdDate: '2024-01-15' };
    });
    if (campaignSortKey) {
      list.sort((a, b) => {
        let aVal = '', bVal = '';
        switch (campaignSortKey) {
          case 'name': aVal = a.name; bVal = b.name; break;
          case 'companies': aVal = String(a.companyCount); bVal = String(b.companyCount); break;
          case 'reach': aVal = a.reach; bVal = b.reach; break;
          case 'createdDate': aVal = a.createdDate; bVal = b.createdDate; break;
          case 'status': aVal = a.status; bVal = b.status; break;
          default: aVal = a.name; bVal = b.name;
        }
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return campaignSortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [filteredCampaigns, companies, campaignStatuses, campaignSortKey, campaignSortDir]);

  const toggleCampaignSort = (key: string) => {
    if (campaignSortKey === key) setCampaignSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setCampaignSortKey(key); setCampaignSortDir('asc'); }
  };

  // Companies filtered to selected campaign
  const campaignCompanies = useMemo(() => {
    let result = companies.filter(c => c.campaignId === selectedCampaignId);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.website.toLowerCase().includes(q)
      );
    }
    if (filters.country) result = result.filter(c => c.country === filters.country);
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let aVal = '', bVal = '';
        switch (sortKey) {
          case 'name': aVal = a.name; bVal = b.name; break;
          case 'country': aVal = a.country; bVal = b.country; break;
          case 'city': aVal = a.city; bVal = b.city; break;
          case 'priority': aVal = a.companyPriority; bVal = b.companyPriority; break;
          case 'ebit': aVal = a.ebit; bVal = b.ebit; break;
          case 'ebitda': aVal = a.ebitda; bVal = b.ebitda; break;
          case 'employees': aVal = String(a.employees); bVal = String(b.employees); break;
          case 'netProfit': aVal = a.netProfit; bVal = b.netProfit; break;
          case 'revenue': aVal = a.revenue; bVal = b.revenue; break;
          case 'lfs': aVal = a.lastAnnualFinancials; bVal = b.lastAnnualFinancials; break;
          case 'lastContact': {
            const aH = a.history.filter(h => h.type === 'call').sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())[0];
            const bH = b.history.filter(h => h.type === 'call').sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())[0];
            aVal = aH ? new Date(aH.timestamp).toISOString() : '';
            bVal = bH ? new Date(bH.timestamp).toISOString() : '';
            break;
          }
          case 'nextContact': {
            aVal = a.nextContact ? new Date(a.nextContact).toISOString() : '';
            bVal = b.nextContact ? new Date(b.nextContact).toISOString() : '';
            break;
          }
          case 'futurePotentialDate': {
            aVal = a.zukunftWirdInteressant ? new Date(a.zukunftWirdInteressant).toISOString() : '';
            bVal = b.zukunftWirdInteressant ? new Date(b.zukunftWirdInteressant).toISOString() : '';
            break;
          }
          default: aVal = a.name; bVal = b.name;
        }
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [companies, selectedCampaignId, search, filters, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const CampaignSortIcon = ({ col }: { col: string }) => {
    if (campaignSortKey !== col) return null;
    return campaignSortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const isVis = (key: string) => visibleCols.has(key);

  const ThSortable = ({ col, children }: { col: string; children: React.ReactNode }) => (
    <th onClick={() => toggleSort(col)} className="cursor-pointer select-none whitespace-nowrap">
      <div className="flex items-center gap-0.5">{children}<SortIcon col={col} /></div>
    </th>
  );

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return '—';
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (d: Date | string | null | undefined) => {
    if (!d) return '—';
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getLastContact = (c: Company) => {
    const callEntries = c.history.filter(h => h.type === 'call').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return callEntries[0] ? formatDateTime(callEntries[0].timestamp) : '—';
  };

  const handleAddCampaign = () => {
    toast({ title: 'Campaign Added', description: `"${campaignForm.name}" has been created.` });
    setAddCampaignOpen(false);
    setCampaignForm({ name: '', pitchText: '', pitchLink: '' });
  };

  const handleEditCampaign = () => {
    toast({ title: 'Campaign Updated', description: `"${editCampaignForm.name}" has been updated.` });
    setEditCampaignOpen(false);
  };

  const handleArchiveCampaign = (id: string) => {
    setCampaignStatuses(prev => ({ ...prev, [id]: prev[id] === 'Archived' ? 'Active' : 'Archived' }));
    const name = campaigns.find(c => c.id === id)?.name || '';
    const wasArchived = campaignStatuses[id] === 'Archived';
    toast({ title: wasArchived ? 'Campaign Restored' : 'Campaign Archived', description: `"${name}" has been ${wasArchived ? 'restored' : 'archived'}.` });
  };

  const handleAddCompany = () => {
    toast({ title: 'Company Added', description: `"${companyForm.name}" has been added to "${selectedCampaign?.name}".` });
    setAddCompanyOpen(false);
    setCompanyForm({ name: '', phonePrimary: '', phoneSecondary: '', website: '', city: '', country: '', employees: '', priority: '', description: '', ebitda: '', ebit: '', lfs: '', netProfit: '', revenue: '' });
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'text-green-400 bg-green-400/15',
      'Closed': 'text-yellow-400 bg-yellow-400/15',
      'Archived': 'text-muted-foreground bg-muted/30',
    };
    return colors[status] || colors['Active'];
  };

  return (
    <div className="h-full flex overflow-hidden w-full">
      {/* Left panel — Campaign table */}
      <div className="w-[340px] min-w-[280px] flex flex-col border-r border-border overflow-hidden" style={{ background: 'hsl(var(--surface-1))' }}>
        <div className="px-3 py-2.5 border-b border-border flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">Campaigns</span>
          <div className="flex items-center gap-1">
            <select
              value={campaignFilter}
              onChange={e => setCampaignFilter(e.target.value)}
              className="h-7 text-[11px] rounded border border-border px-1.5 text-foreground"
              style={{ background: 'hsl(var(--surface-2))' }}
            >
              <option value="all">All Campaigns</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            {isAdmin && (
              <Button size="sm" variant="ghost" onClick={() => setAddCampaignOpen(true)} className="h-7 w-7 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="dense-table w-full">
            <thead>
              <tr>
                <th onClick={() => toggleCampaignSort('name')} className="cursor-pointer select-none">
                  <div className="flex items-center gap-0.5">Name<CampaignSortIcon col="name" /></div>
                </th>
                <th onClick={() => toggleCampaignSort('companies')} className="cursor-pointer select-none text-center">
                  <div className="flex items-center gap-0.5 justify-center">Co.<CampaignSortIcon col="companies" /></div>
                </th>
                <th onClick={() => toggleCampaignSort('reach')} className="cursor-pointer select-none text-center">
                  <div className="flex items-center gap-0.5 justify-center">Reach<CampaignSortIcon col="reach" /></div>
                </th>
                <th onClick={() => toggleCampaignSort('createdDate')} className="cursor-pointer select-none">
                  <div className="flex items-center gap-0.5">Created<CampaignSortIcon col="createdDate" /></div>
                </th>
                <th onClick={() => toggleCampaignSort('status')} className="cursor-pointer select-none">
                  <div className="flex items-center gap-0.5">Status<CampaignSortIcon col="status" /></div>
                </th>
                {isAdmin && <th className="w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {campaignListData.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-6">No campaigns found</td></tr>
              ) : campaignListData.map(camp => {
                const isSelected = camp.id === selectedCampaignId;
                return (
                  <tr
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className={`cursor-pointer ${isSelected ? 'border-l-2 border-l-primary' : ''}`}
                    style={isSelected ? { background: 'hsl(var(--primary) / 0.08)' } : {}}
                  >
                    <td><span className="font-medium text-foreground text-xs">{camp.name}</span></td>
                    <td className="text-center text-xs">{camp.companyCount}</td>
                    <td className="text-center text-xs">{camp.reach}</td>
                    <td className="text-xs whitespace-nowrap">{formatDate(camp.createdDate)}</td>
                    <td>
                      <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${statusBadge(camp.status)}`}>
                        {camp.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground p-0.5">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => {
                              setEditCampaignForm({ id: camp.id, name: camp.name, pitchText: '', pitchLink: '' });
                              setEditCampaignOpen(true);
                            }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setArchiveConfirm({ open: true, id: camp.id, name: camp.name })}>
                              <Archive className="w-3.5 h-3.5 mr-2" />
                              {campaignStatuses[camp.id] === 'Archived' ? 'Restore' : 'Archive'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right panel — Companies in campaign */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
          <h2 className="text-sm font-semibold text-foreground">Campaign</h2>
          <span className="text-xs text-muted-foreground">— {selectedCampaign?.name || 'None'}</span>
          <span className="text-xs text-muted-foreground ml-1">({campaignCompanies.length} companies)</span>
          <div className="flex-1" />
          <div className="relative w-48">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-8 pl-7 text-xs" style={{ background: 'hsl(var(--surface-2))' }} />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>}
          </div>

          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 text-xs"><SlidersHorizontal className="w-3.5 h-3.5" /></Button>

          {/* Column visibility */}
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowColMenu(!showColMenu)} className="h-8 text-xs"><Eye className="w-3.5 h-3.5" /></Button>
            {showColMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded border border-border p-3 shadow-lg max-h-72 overflow-y-auto" style={{ background: 'hsl(var(--popover))' }}>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Show / Hide Columns</div>
                  <div className="space-y-1">
                    {allColumns.map(col => (
                      <label key={col.key} className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:bg-accent/10 rounded px-1 py-0.5">
                        <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => {
                          setVisibleCols(prev => { const n = new Set(prev); if (n.has(col.key) && n.size > 1) n.delete(col.key); else n.add(col.key); return n; });
                        }} className="rounded border-border" style={{ accentColor: 'hsl(var(--primary))' }} />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {isAdmin && (
            <>
              <Button size="sm" onClick={() => setAddCompanyOpen(true)} className="h-8 text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Company
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAddCampaignOpen(true)} className="h-8 text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Campaign
              </Button>
            </>
          )}
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
            <select value={filters.country || ''} onChange={e => setFilters(f => e.target.value ? { ...f, country: e.target.value } : (() => { const { country, ...r } = f; return r; })())}
              className="h-6 text-xs rounded border border-border px-1.5 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
              <option value="">All Countries</option>
              {[...new Set(campaignCompanies.map(c => c.country))].sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.status || ''} onChange={e => setFilters(f => e.target.value ? { ...f, status: e.target.value } : (() => { const { status, ...r } = f; return r; })())}
              className="h-6 text-xs rounded border border-border px-1.5 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
              <option value="">All Statuses</option>
              {statusList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {Object.keys(filters).length > 0 && <button onClick={() => setFilters({})} className="text-[10px] text-destructive hover:underline">Clear</button>}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="dense-table w-full">
            <thead>
              <tr>
                {isVis('campaign') && <th className="whitespace-nowrap">Campaign</th>}
                {isVis('priority') && <ThSortable col="priority">Priority</ThSortable>}
                {isVis('name') && <ThSortable col="name">Name</ThSortable>}
                {isVis('country') && <ThSortable col="country">Country</ThSortable>}
                {isVis('city') && <ThSortable col="city">City</ThSortable>}
                {isVis('website') && <th className="whitespace-nowrap">Website</th>}
                {isVis('tags') && <th>Tags</th>}
                {isVis('lfs') && <ThSortable col="lfs">LFS</ThSortable>}
                {isVis('revenue') && <ThSortable col="revenue">Revenue</ThSortable>}
                {isVis('ebitda') && <ThSortable col="ebitda">EBITDA</ThSortable>}
                {isVis('ebit') && <ThSortable col="ebit">EBIT</ThSortable>}
                {isVis('netProfit') && <ThSortable col="netProfit">Net Profits</ThSortable>}
                {isVis('employees') && <ThSortable col="employees">Employees</ThSortable>}
                {isVis('lastContact') && <ThSortable col="lastContact">Last Contact</ThSortable>}
                {isVis('nextContact') && <ThSortable col="nextContact">Next Contact</ThSortable>}
                {isVis('status') && <th>Status</th>}
                {isVis('statusSpec') && <th className="whitespace-nowrap">Status Spec</th>}
                {isVis('futurePotentialDate') && <ThSortable col="futurePotentialDate">Future Potential</ThSortable>}
                {isVis('statusComment') && <th className="whitespace-nowrap">Comment</th>}
                {isVis('referral') && <th>Referral</th>}
                <th className="w-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaignCompanies.length === 0 ? (
                <tr><td colSpan={30} className="text-center text-muted-foreground py-8">No companies in this campaign</td></tr>
              ) : campaignCompanies.map(c => {
                const campName = campaigns.find(ca => ca.id === c.campaignId)?.name || '—';
                return (
                  <tr key={c.id}>
                    {isVis('campaign') && <td className="text-xs whitespace-nowrap">{campName}</td>}
                    {isVis('priority') && (
                      <td>
                        <select value={c.companyPriority} onChange={e => updateCompany(c.id, { companyPriority: e.target.value as any })}
                          className="h-6 text-xs rounded border border-border px-1 text-foreground w-12" style={{ background: 'hsl(var(--surface-2))' }} disabled={!isAdmin}>
                          {['A', 'B', 'C', 'D', 'E'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                    )}
                    {isVis('name') && <td><span className="font-medium text-foreground">{c.name}</span></td>}
                    {isVis('country') && (
                      <td>
                        <select value={c.country} onChange={e => updateCompany(c.id, { country: e.target.value })}
                          className="h-6 text-xs rounded border border-border px-1 text-foreground" style={{ background: 'hsl(var(--surface-2))' }} disabled={!isAdmin}>
                          {countryList.map(co => <option key={co} value={co}>{co}</option>)}
                        </select>
                      </td>
                    )}
                    {isVis('city') && <td className="text-xs">{c.city}</td>}
                    {isVis('website') && (
                      <td><a href={`https://${c.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{c.website}</a></td>
                    )}
                    {isVis('tags') && (
                      <td>
                        <div className="flex flex-wrap gap-0.5">
                          {c.tags.map(t => (
                            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                              {t} {isAdmin && <X className="w-2.5 h-2.5 cursor-pointer opacity-70 hover:opacity-100" />}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                    {isVis('lfs') && <td className="text-xs whitespace-nowrap">{c.lastAnnualFinancials}</td>}
                    {isVis('revenue') && <td className="font-mono text-xs">{c.revenue}</td>}
                    {isVis('ebitda') && <td className="font-mono text-xs">{c.ebitda}</td>}
                    {isVis('ebit') && <td className="font-mono text-xs">{c.ebit}</td>}
                    {isVis('netProfit') && <td className="font-mono text-xs">{c.netProfit}</td>}
                    {isVis('employees') && <td className="font-mono text-xs">{c.employees}</td>}
                    {isVis('lastContact') && <td className="text-xs whitespace-nowrap">{getLastContact(c)}</td>}
                    {isVis('nextContact') && (
                      <td>{c.nextContact ? <span className="text-xs">{formatDate(c.nextContact)}</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    )}
                    {isVis('status') && (
                      <td>
                        <select value={c.status} onChange={e => updateCompany(c.id, { status: e.target.value as Status })}
                          className="h-6 text-xs rounded border border-border px-1 text-foreground" style={{ background: 'hsl(var(--surface-2))' }} disabled={!isAdmin}>
                          {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    )}
                    {isVis('statusSpec') && <td className="text-xs text-muted-foreground truncate max-w-[120px]">{c.statusSpec || '—'}</td>}
                    {isVis('futurePotentialDate') && <td className="text-xs">{c.zukunftWirdInteressant ? formatDate(c.zukunftWirdInteressant) : '—'}</td>}
                    {isVis('statusComment') && <td className="text-xs text-muted-foreground truncate max-w-[100px]">{c.statusComment || '—'}</td>}
                    {isVis('referral') && <td className="text-xs text-muted-foreground">—</td>}
                    <td>
                      <button onClick={() => setDeleteCompanyConfirm({ open: true, id: c.id, name: c.name })} className="text-muted-foreground hover:text-foreground p-0.5">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Campaign Modal */}
      <Dialog open={addCampaignOpen} onOpenChange={setAddCampaignOpen}>
        <DialogContent className="sm:max-w-lg" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle>Add Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">Campaign Name *</label><Input value={campaignForm.name} onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Text</label><textarea value={campaignForm.pitchText} onChange={e => setCampaignForm(f => ({ ...f, pitchText: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[80px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Link</label><Input value={campaignForm.pitchLink} onChange={e => setCampaignForm(f => ({ ...f, pitchLink: e.target.value }))} placeholder="https://..." className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddCampaignOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCampaign} disabled={!campaignForm.name}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Modal */}
      <Dialog open={editCampaignOpen} onOpenChange={setEditCampaignOpen}>
        <DialogContent className="sm:max-w-lg" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle>Edit Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">Campaign Name *</label><Input value={editCampaignForm.name} onChange={e => setEditCampaignForm(f => ({ ...f, name: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Text</label><textarea value={editCampaignForm.pitchText} onChange={e => setEditCampaignForm(f => ({ ...f, pitchText: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[80px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Link</label><Input value={editCampaignForm.pitchLink} onChange={e => setEditCampaignForm(f => ({ ...f, pitchLink: e.target.value }))} placeholder="https://..." className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditCampaignOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCampaign} disabled={!editCampaignForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Company Modal */}
      <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Linked to <span className="text-primary font-medium">{selectedCampaign?.name}</span>
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold">Name *</label><Input value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Phone# (primary) *</label><Input value={companyForm.phonePrimary} onChange={e => setCompanyForm(f => ({ ...f, phonePrimary: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Website *</label><Input value={companyForm.website} onChange={e => setCompanyForm(f => ({ ...f, website: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">City *</label><Input value={companyForm.city} onChange={e => setCompanyForm(f => ({ ...f, city: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Country *</label>
                <select value={companyForm.country} onChange={e => setCompanyForm(f => ({ ...f, country: e.target.value }))} className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">Choose Country</option>{countryList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-semibold">Priority</label>
                <select value={companyForm.priority} onChange={e => setCompanyForm(f => ({ ...f, priority: e.target.value }))} className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">Select</option>{['A', 'B', 'C', 'D', 'E'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-semibold">Employees</label><Input value={companyForm.employees} onChange={e => setCompanyForm(f => ({ ...f, employees: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Campaign</label><Input value={selectedCampaign?.name || ''} disabled className="mt-1 opacity-70" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            </div>
            <div><label className="text-sm font-semibold">Description</label>
              <textarea value={companyForm.description} onChange={e => setCompanyForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[80px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} />
            </div>
            <hr className="border-border" />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold">Revenue</label><Input value={companyForm.revenue} onChange={e => setCompanyForm(f => ({ ...f, revenue: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">EBITDA</label><Input value={companyForm.ebitda} onChange={e => setCompanyForm(f => ({ ...f, ebitda: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">EBIT</label><Input value={companyForm.ebit} onChange={e => setCompanyForm(f => ({ ...f, ebit: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Net Profit</label><Input value={companyForm.netProfit} onChange={e => setCompanyForm(f => ({ ...f, netProfit: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">LFS</label><Input value={companyForm.lfs} onChange={e => setCompanyForm(f => ({ ...f, lfs: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddCompanyOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCompany} disabled={!companyForm.name || !companyForm.phonePrimary || !companyForm.website || !companyForm.city || !companyForm.country}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Campaign Confirm */}
      <ConfirmDialog
        open={archiveConfirm.open}
        onOpenChange={open => setArchiveConfirm(p => ({ ...p, open }))}
        title={campaignStatuses[archiveConfirm.id] === 'Archived' ? 'Restore Campaign' : 'Archive Campaign'}
        description={`Are you sure you want to ${campaignStatuses[archiveConfirm.id] === 'Archived' ? 'restore' : 'archive'} "${archiveConfirm.name}"?`}
        confirmLabel={campaignStatuses[archiveConfirm.id] === 'Archived' ? 'Restore' : 'Archive'}
        variant="destructive"
        onConfirm={() => handleArchiveCampaign(archiveConfirm.id)}
      />

      {/* Remove Company Confirm */}
      <ConfirmDialog
        open={deleteCompanyConfirm.open}
        onOpenChange={open => setDeleteCompanyConfirm(p => ({ ...p, open }))}
        title="Remove Company"
        description={`Remove "${deleteCompanyConfirm.name}" from this campaign?`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => toast({ title: 'Company Removed', description: `"${deleteCompanyConfirm.name}" removed.`, variant: 'destructive' })}
      />
    </div>
  );
};

export default CampaignsView;
