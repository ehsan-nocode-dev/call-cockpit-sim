import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Company, campaigns, Campaign } from '@/data/mockData';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, Eye, X, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const countryList = ['DE', 'SE', 'CH', 'UK', 'NO', 'AT', 'DK', 'FI', 'US', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'CZ'];

const CompaniesView: React.FC = () => {
  const { companies, role, updateCompany } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  // Search & sort
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Column visibility
  // Campaign-company relationship tracking (prevents duplicates)
  const [campaignAssignments, setCampaignAssignments] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    companies.forEach(c => { map[c.id] = c.campaignId; });
    return map;
  });
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);

  const allColumns = [
    { key: 'name', label: 'Name', alwaysVisible: true },
    { key: 'campaign', label: 'Campaign' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'contact', label: 'Contact' },
    { key: 'ebit', label: 'EBIT' },
    { key: 'ebitda', label: 'EBITDA' },
    { key: 'employees', label: 'Employee' },
    { key: 'netProfit', label: 'Net Profit' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'lfs', label: 'LFS' },
    { key: 'decisionMaker', label: 'Decision Maker' },
    { key: 'tags', label: 'Tags' },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(allColumns.map(c => c.key)));
  const [showColMenu, setShowColMenu] = useState(false);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  // Add form
  const [form, setForm] = useState({
    name: '', phonePrimary: '', phoneSecondary: '', website: '', city: '', country: '',
    employees: '', priority: '', description: '', ebitda: '', ebit: '', lfs: '', netProfit: '', revenue: '', campaignId: '',
  });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const filteredData = useMemo(() => {
    let result = [...companies];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.centralPhone.includes(q) ||
        c.decisionMaker.firstName.toLowerCase().includes(q) ||
        c.decisionMaker.lastName.toLowerCase().includes(q)
      );
    }
    if (filters.country) result = result.filter(c => c.country === filters.country);
    if (sortKey) {
      result.sort((a, b) => {
        let aVal = '', bVal = '';
        switch (sortKey) {
          case 'name': aVal = a.name; bVal = b.name; break;
          case 'country': aVal = a.country; bVal = b.country; break;
          case 'city': aVal = a.city; bVal = b.city; break;
          case 'ebit': aVal = a.ebit; bVal = b.ebit; break;
          case 'ebitda': aVal = a.ebitda; bVal = b.ebitda; break;
          case 'employees': aVal = String(a.employees); bVal = String(b.employees); break;
          case 'netProfit': aVal = a.netProfit; bVal = b.netProfit; break;
          case 'revenue': aVal = a.revenue; bVal = b.revenue; break;
          case 'lfs': aVal = a.lastAnnualFinancials; bVal = b.lastAnnualFinancials; break;
          default: aVal = a.name; bVal = b.name;
        }
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [companies, search, filters, sortKey, sortDir]);

  const handleAdd = () => {
    if (form.campaignId) {
      // Track campaign assignment for the new company
      const newCompanyId = `comp-${Date.now()}`;
      setCampaignAssignments(prev => ({ ...prev, [newCompanyId]: form.campaignId }));
    }
    toast({ title: 'Company Added', description: `"${form.name}" has been added successfully.` });
    setAddOpen(false);
    setForm({ name: '', phonePrimary: '', phoneSecondary: '', website: '', city: '', country: '', employees: '', priority: '', description: '', ebitda: '', ebit: '', lfs: '', netProfit: '', revenue: '', campaignId: '' });
  };

  const handleCampaignChange = (companyId: string, newCampaignId: string) => {
    const currentCampaign = campaignAssignments[companyId];
    if (currentCampaign === newCampaignId) {
      // Relationship already exists, no duplicate record created
      toast({ title: 'No Change', description: 'This company is already assigned to that campaign.' });
      setEditingCampaign(null);
      return;
    }
    setCampaignAssignments(prev => ({ ...prev, [companyId]: newCampaignId }));
    updateCompany(companyId, { campaignId: newCampaignId });
    const campName = campaigns.find(c => c.id === newCampaignId)?.name || 'None';
    toast({ title: 'Campaign Updated', description: `Campaign changed to "${campName}".` });
    setEditingCampaign(null);
  };

  const handleDelete = () => {
    toast({ title: 'Company Deleted', description: `"${deleteConfirm.name}" has been deleted.`, variant: 'destructive' });
  };

  const isVis = (key: string) => visibleCols.has(key);

  const ThSortable = ({ col, children }: { col: string; children: React.ReactNode }) => (
    <th onClick={() => toggleSort(col)} className="cursor-pointer select-none">
      <div className="flex items-center gap-0.5">{children}<SortIcon col={col} /></div>
    </th>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-lg font-semibold text-foreground">Company</h2>
        <div className="flex-1" />
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search here..."
            className="h-9 pl-8 text-sm" style={{ background: 'hsl(var(--surface-2))' }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Column visibility */}
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowColMenu(!showColMenu)} className="h-9"><Eye className="w-4 h-4" /></Button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-border p-4 shadow-xl" style={{ background: 'hsl(var(--popover))' }}>
                <div className="text-sm font-semibold text-foreground mb-3">Show or Hide Columns</div>
                <div className="space-y-2">
                  {allColumns.map(col => (
                    <label key={col.key} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                      <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => {
                        setVisibleCols(prev => { const n = new Set(prev); if (n.has(col.key) && n.size > 1) n.delete(col.key); else n.add(col.key); return n; });
                      }} className="rounded border-border accent-primary" style={{ accentColor: 'hsl(var(--primary))' }} />
                      {col.label}
                    </label>
                  ))}
                </div>
                <Button size="sm" className="w-full mt-3" onClick={() => setShowColMenu(false)}>Apply</Button>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>

        {isAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)} className="h-9 gap-1">
            <Plus className="w-4 h-4" /> Add Company
          </Button>
        )}
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
          <select value={filters.country || ''} onChange={e => setFilters(f => e.target.value ? { ...f, country: e.target.value } : (() => { const { country, ...r } = f; return r; })())}
            className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
            <option value="">All Countries</option>
            {[...new Set(companies.map(c => c.country))].sort().map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {Object.keys(filters).length > 0 && <button onClick={() => setFilters({})} className="text-xs text-destructive hover:underline">Clear</button>}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              {isVis('name') && <ThSortable col="name">Name</ThSortable>}
              {isVis('campaign') && <ThSortable col="campaign">Campaign</ThSortable>}
              {isVis('country') && <ThSortable col="country">Country</ThSortable>}
              {isVis('city') && <ThSortable col="city">City</ThSortable>}
              {isVis('contact') && <th>Contact</th>}
              {isVis('ebit') && <ThSortable col="ebit">EBIT</ThSortable>}
              {isVis('ebitda') && <ThSortable col="ebitda">EBITDA</ThSortable>}
              {isVis('employees') && <ThSortable col="employees">Employee</ThSortable>}
              {isVis('netProfit') && <ThSortable col="netProfit">Net Profit</ThSortable>}
              {isVis('revenue') && <ThSortable col="revenue">Revenue</ThSortable>}
              {isVis('lfs') && <ThSortable col="lfs">LFS</ThSortable>}
              {isVis('decisionMaker') && <th>Decision Maker</th>}
              {isVis('tags') && <th>Tags</th>}
              <th className="w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan={20} className="text-center text-muted-foreground py-8">No results found</td></tr>
            ) : filteredData.map(c => (
              <tr key={c.id}>
                {isVis('name') && (
                  <td>
                    <div className="font-medium text-foreground">{c.name}</div>
                    <a href={`https://${c.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{c.website}</a>
                  </td>
                )}
                {isVis('campaign') && (
                  <td>
                    {editingCampaign === c.id ? (
                      <select
                        autoFocus
                        value={campaignAssignments[c.id] || c.campaignId}
                        onChange={e => handleCampaignChange(c.id, e.target.value)}
                        onBlur={() => setEditingCampaign(null)}
                        className="h-7 text-xs rounded border border-border px-1.5 text-foreground w-full"
                        style={{ background: 'hsl(var(--surface-2))' }}
                      >
                        <option value="">— None —</option>
                        {campaigns.map(camp => <option key={camp.id} value={camp.id}>{camp.name}</option>)}
                      </select>
                    ) : (
                      <span
                        onClick={() => isAdmin && setEditingCampaign(c.id)}
                        className={`text-xs px-1.5 py-0.5 rounded ${isAdmin ? 'cursor-pointer hover:bg-accent' : ''}`}
                        style={isAdmin ? {} : {}}
                        title={isAdmin ? 'Click to change campaign' : ''}
                      >
                        {campaigns.find(camp => camp.id === (campaignAssignments[c.id] || c.campaignId))?.name || '—'}
                      </span>
                    )}
                  </td>
                )}
                {isVis('city') && <td>{c.city}</td>}
                {isVis('contact') && (
                  <td>
                    <div className="text-xs"><span className="text-muted-foreground">📱</span> {c.centralPhone}</div>
                    <div className="text-xs text-muted-foreground">(primary)</div>
                  </td>
                )}
                {isVis('ebit') && <td className="font-mono text-xs">{c.ebit}</td>}
                {isVis('ebitda') && <td className="font-mono text-xs">{c.ebitda}</td>}
                {isVis('employees') && <td className="font-mono text-xs">{c.employees}</td>}
                {isVis('netProfit') && <td className="font-mono text-xs">{c.netProfit}</td>}
                {isVis('revenue') && <td className="font-mono text-xs">{c.revenue}</td>}
                {isVis('lfs') && <td className="text-xs">{c.lastAnnualFinancials}</td>}
                {isVis('decisionMaker') && (
                  <td>
                    <div className="text-xs">
                      <span className="text-muted-foreground">👤</span> {c.decisionMaker.title} {c.decisionMaker.firstName} {c.decisionMaker.lastName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">📱 {c.decisionMaker.mobile}</div>
                    <div className="text-[10px] text-muted-foreground">📞 {c.decisionMaker.direct}</div>
                  </td>
                )}
                {isVis('tags') && (
                  <td>
                    <div className="flex flex-wrap gap-0.5">
                      {c.tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded text-foreground" style={{ background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                          {t} <X className="w-2.5 h-2.5 cursor-pointer opacity-70 hover:opacity-100" />
                        </span>
                      ))}
                    </div>
                  </td>
                )}
                <td>
                  <div className="flex items-center gap-1">
                    <button className="text-muted-foreground hover:text-primary p-0.5"><Plus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteConfirm({ open: true, id: c.id, name: c.name })} className="text-muted-foreground hover:text-foreground p-0.5">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Company Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Name *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premio" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Phone# (primary) *</label>
                <Input value={form.phonePrimary} onChange={e => setForm(f => ({ ...f, phonePrimary: e.target.value }))} placeholder="e.g. 2345567656" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Phone# (secondary)</label>
                <Input value={form.phoneSecondary} onChange={e => setForm(f => ({ ...f, phoneSecondary: e.target.value }))} placeholder="e.g. 2345567656" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Website *</label>
                <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="e.g. premio.com" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">City *</label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Country *</label>
                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">Choose Country</option>
                  {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Employees</label>
                <Input value={form.employees} onChange={e => setForm(f => ({ ...f, employees: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">Select</option>
                  {['A', 'B', 'C', 'D', 'E'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Any information related to company or notes"
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[100px] resize-y"
                style={{ background: 'hsl(var(--surface-2))' }} />
            </div>
            <hr className="border-border" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground">EBITDA</label>
                <Input value={form.ebitda} onChange={e => setForm(f => ({ ...f, ebitda: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">EBIT</label>
                <Input value={form.ebit} onChange={e => setForm(f => ({ ...f, ebit: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Last Financial Statement</label>
                <Input value={form.lfs} onChange={e => setForm(f => ({ ...f, lfs: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Net Profit</label>
                <Input value={form.netProfit} onChange={e => setForm(f => ({ ...f, netProfit: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Revenue</label>
                <Input value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} placeholder="e.g. 200" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.phonePrimary || !form.website || !form.city || !form.country}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={open => setDeleteConfirm(p => ({ ...p, open }))}
        title="Delete Company"
        description={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CompaniesView;
