import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { campaigns, Campaign, Company, statusList, Status } from '@/data/mockData';
import { Search, ChevronUp, ChevronDown, Plus, MoreVertical, Eye, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const countryList = ['DE', 'SE', 'CH', 'UK', 'NO', 'AT', 'DK', 'FI', 'US', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'CZ', 'JP', 'AU', 'PK', 'CL', 'ZA', 'DO', 'DJ'];

const CampaignsView: React.FC = () => {
  const { companies, role, updateCompany } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  // Campaign list state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, 'Active' | 'Closed'>>(() => {
    const map: Record<string, 'Active' | 'Closed'> = {};
    campaigns.forEach(c => { map[c.id] = 'Active'; });
    return map;
  });

  // Add Campaign modal
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ name: '', pitchText: '', pitchLink: '' });
  const [deleteCampaignConfirm, setDeleteCampaignConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

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
      result.sort((a, b) => {
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

  const handleAddCompany = () => {
    toast({ title: 'Company Added', description: `"${companyForm.name}" has been added to "${selectedCampaign?.name}".` });
    setAddCompanyOpen(false);
    setCompanyForm({ name: '', phonePrimary: '', phoneSecondary: '', website: '', city: '', country: '', employees: '', priority: '', description: '', ebitda: '', ebit: '', lfs: '', netProfit: '', revenue: '' });
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left panel — Campaign list */}
      <div className="w-[280px] min-w-[220px] flex flex-col border-r border-border overflow-hidden" style={{ background: 'hsl(var(--surface-1))' }}>
        <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Campaigns</span>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => setAddCampaignOpen(true)} className="h-7 w-7 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {campaigns.map(camp => {
            const isSelected = camp.id === selectedCampaignId;
            const status = campaignStatuses[camp.id] || 'Active';
            const companyCount = companies.filter(c => c.campaignId === camp.id).length;
            return (
              <div
                key={camp.id}
                onClick={() => setSelectedCampaignId(camp.id)}
                className={`px-3 py-3 cursor-pointer border-b border-border transition-colors ${isSelected ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent hover:bg-accent/30'}`}
                style={isSelected ? { background: 'hsl(var(--primary) / 0.08)' } : {}}
              >
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-sm mb-1 ${status === 'Active' ? 'text-green-400 bg-green-400/15' : 'text-yellow-400 bg-yellow-400/15'}`}>
                  {status}
                </span>
                <div className="text-sm font-medium text-foreground">{camp.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{companyCount} companies</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel — Companies in campaign */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
          <h2 className="text-lg font-semibold text-foreground">Campaign</h2>
          <span className="text-sm text-muted-foreground">— {selectedCampaign?.name || 'None'}</span>
          <div className="flex-1" />
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search here..." className="h-9 pl-8 text-sm" style={{ background: 'hsl(var(--surface-2))' }} />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
          </div>

          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9"><SlidersHorizontal className="w-4 h-4" /></Button>

          {/* Column visibility */}
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowColMenu(!showColMenu)} className="h-9"><Eye className="w-4 h-4" /></Button>
            {showColMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-border p-4 shadow-xl max-h-80 overflow-y-auto" style={{ background: 'hsl(var(--popover))' }}>
                  <div className="text-sm font-semibold text-foreground mb-3">Show or Hide Columns</div>
                  <div className="space-y-2">
                    {allColumns.map(col => (
                      <label key={col.key} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => {
                          setVisibleCols(prev => { const n = new Set(prev); if (n.has(col.key) && n.size > 1) n.delete(col.key); else n.add(col.key); return n; });
                        }} className="rounded border-border" style={{ accentColor: 'hsl(var(--primary))' }} />
                        {col.label}
                      </label>
                    ))}
                  </div>
                  <Button size="sm" className="w-full mt-3" onClick={() => setShowColMenu(false)}>Apply</Button>
                </div>
              </>
            )}
          </div>

          {isAdmin && (
            <>
              <Button size="sm" onClick={() => setAddCompanyOpen(true)} className="h-9 gap-1">
                <Plus className="w-4 h-4" /> Add Company
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAddCampaignOpen(true)} className="h-9 gap-1">
                <Plus className="w-4 h-4" /> Add Campaign
              </Button>
            </>
          )}
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
            <select value={filters.country || ''} onChange={e => setFilters(f => e.target.value ? { ...f, country: e.target.value } : (() => { const { country, ...r } = f; return r; })())}
              className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
              <option value="">All Countries</option>
              {[...new Set(campaignCompanies.map(c => c.country))].sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.status || ''} onChange={e => setFilters(f => e.target.value ? { ...f, status: e.target.value } : (() => { const { status, ...r } = f; return r; })())}
              className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
              <option value="">All Statuses</option>
              {statusList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {Object.keys(filters).length > 0 && <button onClick={() => setFilters({})} className="text-xs text-destructive hover:underline">Clear</button>}
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
                {isVis('statusSpec') && <th className="whitespace-nowrap">Status Specification</th>}
                {isVis('futurePotentialDate') && <ThSortable col="futurePotentialDate">Future Potential Date</ThSortable>}
                {isVis('statusComment') && <th className="whitespace-nowrap">Status Comment</th>}
                {isVis('referral') && <th>Referral</th>}
                <th className="w-12">Actions</th>
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
                        <select
                          value={c.companyPriority}
                          onChange={e => updateCompany(c.id, { companyPriority: e.target.value as any })}
                          className="h-7 text-xs rounded border border-border px-1 text-foreground w-14"
                          style={{ background: 'hsl(var(--surface-2))' }}
                          disabled={!isAdmin}
                        >
                          {['A', 'B', 'C', 'D', 'E'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                    )}
                    {isVis('name') && <td><span className="font-medium text-foreground">{c.name}</span></td>}
                    {isVis('country') && (
                      <td>
                        <select
                          value={c.country}
                          onChange={e => updateCompany(c.id, { country: e.target.value })}
                          className="h-7 text-xs rounded border border-border px-1 text-foreground"
                          style={{ background: 'hsl(var(--surface-2))' }}
                          disabled={!isAdmin}
                        >
                          {countryList.map(co => <option key={co} value={co}>{co}</option>)}
                        </select>
                      </td>
                    )}
                    {isVis('city') && <td className="text-xs">{c.city}</td>}
                    {isVis('website') && (
                      <td>
                        <a href={`https://${c.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{c.website}</a>
                      </td>
                    )}
                    {isVis('tags') && (
                      <td>
                        <div className="flex flex-wrap gap-0.5">
                          {c.tags.map(t => (
                            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                              {t} {isAdmin && <X className="w-2.5 h-2.5 cursor-pointer opacity-70 hover:opacity-100" />}
                            </span>
                          ))}
                          {isAdmin && <button className="text-muted-foreground hover:text-primary"><Plus className="w-3 h-3" /></button>}
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
                      <td>
                        {c.nextContact ? (
                          <span className="inline-block px-2 py-1 text-xs rounded border border-border" style={{ background: 'hsl(var(--surface-2))' }}>
                            {formatDate(c.nextContact)}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    )}
                    {isVis('status') && (
                      <td>
                        <select
                          value={c.status}
                          onChange={e => updateCompany(c.id, { status: e.target.value as Status })}
                          className="h-7 text-xs rounded border border-border px-1 text-foreground"
                          style={{ background: 'hsl(var(--surface-2))' }}
                          disabled={!isAdmin}
                        >
                          {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    )}
                    {isVis('statusSpec') && (
                      <td className="text-xs text-muted-foreground max-w-[160px]">
                        <div className="truncate">{c.statusSpec || '—'}</div>
                        {c.certainPotential !== undefined && (
                          <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                            {c.certainPotential ? 'Certain Potential (max 100%)' : 'Certain Potential'}
                          </div>
                        )}
                      </td>
                    )}
                    {isVis('futurePotentialDate') && (
                      <td>
                        {c.zukunftWirdInteressant ? (
                          <span className="inline-block px-2 py-1 text-xs rounded border border-border" style={{ background: 'hsl(var(--surface-2))' }}>
                            {formatDate(c.zukunftWirdInteressant)}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    )}
                    {isVis('statusComment') && (
                      <td>
                        <div className="text-xs text-muted-foreground max-w-[140px]">
                          <span className="inline-block px-2 py-1 rounded border border-border truncate" style={{ background: 'hsl(var(--surface-2))' }}>
                            {c.statusComment || 'Status Comments'}
                          </span>
                        </div>
                      </td>
                    )}
                    {isVis('referral') && <td className="text-xs text-muted-foreground">Referral</td>}
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
          <DialogHeader><DialogTitle className="text-xl font-bold">Add Campaign</DialogTitle></DialogHeader>
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

      {/* Add Company Modal (auto-linked to selected campaign) */}
      <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Company</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              This company will be linked to <span className="text-primary font-medium">{selectedCampaign?.name}</span>
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Name *</label>
                <Input value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premio" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Phone# (primary) *</label>
                <Input value={companyForm.phonePrimary} onChange={e => setCompanyForm(f => ({ ...f, phonePrimary: e.target.value }))} placeholder="e.g. 2345567656" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Website *</label>
                <Input value={companyForm.website} onChange={e => setCompanyForm(f => ({ ...f, website: e.target.value }))} placeholder="e.g. premio.com" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">City *</label>
                <Input value={companyForm.city} onChange={e => setCompanyForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Country *</label>
                <select value={companyForm.country} onChange={e => setCompanyForm(f => ({ ...f, country: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">Choose Country</option>
                  {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Priority</label>
                <select value={companyForm.priority} onChange={e => setCompanyForm(f => ({ ...f, priority: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">Select</option>
                  {['A', 'B', 'C', 'D', 'E'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Employees</label>
                <Input value={companyForm.employees} onChange={e => setCompanyForm(f => ({ ...f, employees: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Campaign</label>
                <Input value={selectedCampaign?.name || ''} disabled className="mt-1 opacity-70" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Description</label>
              <textarea value={companyForm.description} onChange={e => setCompanyForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Any information related to company or notes"
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[80px] resize-y"
                style={{ background: 'hsl(var(--surface-2))' }} />
            </div>
            <hr className="border-border" />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-foreground">Revenue</label><Input value={companyForm.revenue} onChange={e => setCompanyForm(f => ({ ...f, revenue: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold text-foreground">EBITDA</label><Input value={companyForm.ebitda} onChange={e => setCompanyForm(f => ({ ...f, ebitda: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold text-foreground">EBIT</label><Input value={companyForm.ebit} onChange={e => setCompanyForm(f => ({ ...f, ebit: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold text-foreground">Net Profit</label><Input value={companyForm.netProfit} onChange={e => setCompanyForm(f => ({ ...f, netProfit: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold text-foreground">LFS</label><Input value={companyForm.lfs} onChange={e => setCompanyForm(f => ({ ...f, lfs: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddCompanyOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCompany} disabled={!companyForm.name || !companyForm.phonePrimary || !companyForm.website || !companyForm.city || !companyForm.country}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Confirm */}
      <ConfirmDialog
        open={deleteCampaignConfirm.open}
        onOpenChange={open => setDeleteCampaignConfirm(p => ({ ...p, open }))}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${deleteCampaignConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => toast({ title: 'Campaign Deleted', description: `"${deleteCampaignConfirm.name}" has been deleted.`, variant: 'destructive' })}
      />

      {/* Delete Company Confirm */}
      <ConfirmDialog
        open={deleteCompanyConfirm.open}
        onOpenChange={open => setDeleteCompanyConfirm(p => ({ ...p, open }))}
        title="Remove Company"
        description={`Are you sure you want to remove "${deleteCompanyConfirm.name}" from this campaign? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => toast({ title: 'Company Removed', description: `"${deleteCompanyConfirm.name}" has been removed.`, variant: 'destructive' })}
      />
    </div>
  );
};

export default CampaignsView;
