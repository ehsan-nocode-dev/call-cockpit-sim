import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { opportunities, opportunityStages, Opportunity } from '@/data/additionalMockData';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, Eye, X, Plus, MoreVertical } from 'lucide-react';
import CallCockpit from '@/components/CallCockpit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const stageColor: Record<string, string> = {
  'Qualification': 'status-offen', 'Discovery': 'status-diskussion', 'Proposal': 'status-opportunity',
  'Negotiation': 'status-terminierung', 'Due Diligence': 'status-nda', 'Closing': 'status-loi',
  'Won': 'status-deal', 'Lost': 'status-kein-interesse',
};

const OpportunitiesView: React.FC = () => {
  const { role, companies, setSelectedCompanyId, selectedCompanyId } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();
  const [detailOpen, setDetailOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('companyName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [form, setForm] = useState({ companyName: '', contactName: '', value: '', stage: '', probability: '', campaignName: '', assignedTo: '', expectedClose: '', notes: '' });

  const allColumns = [
    { key: 'companyName', label: 'Company' }, { key: 'contactName', label: 'Contact' },
    { key: 'value', label: 'Value' }, { key: 'stage', label: 'Stage' },
    { key: 'probability', label: 'Probability' }, { key: 'campaignName', label: 'Campaign' },
    { key: 'assignedTo', label: 'Assigned To' }, { key: 'expectedClose', label: 'Expected Close' },
    { key: 'notes', label: 'Notes' },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(allColumns.filter(c => c.key !== 'notes').map(c => c.key)));
  const [showColMenu, setShowColMenu] = useState(false);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const filteredData = useMemo(() => {
    let result = [...opportunities];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o => o.companyName.toLowerCase().includes(q) || o.contactName.toLowerCase().includes(q));
    }
    if (filters.stage) result = result.filter(o => o.stage === filters.stage);
    if (filters.assignedTo) result = result.filter(o => o.assignedTo === filters.assignedTo);
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = String((a as any)[sortKey] || '');
        const bVal = String((b as any)[sortKey] || '');
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [search, filters, sortKey, sortDir]);

  const isVis = (key: string) => visibleCols.has(key);

  const handleRowClick = (o: typeof filteredData[0]) => {
    const comp = companies.find(c => c.name === o.companyName);
    if (comp) {
      setSelectedCompanyId(comp.id);
      setDetailOpen(true);
    }
  };

  return (
    <div className={`h-full flex ${detailOpen ? 'flex-row' : 'flex-col'} overflow-hidden`}>
      <div className={`flex flex-col overflow-hidden ${detailOpen ? 'w-1/2 border-r border-border' : 'flex-1'}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-lg font-semibold text-foreground">Opportunities</h2>
        <div className="flex-1" />
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-9 pl-8 text-sm" style={{ background: 'hsl(var(--surface-2))' }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9"><SlidersHorizontal className="w-4 h-4" /></Button>
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowColMenu(!showColMenu)} className="h-9"><Eye className="w-4 h-4" /></Button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-border p-4 shadow-xl" style={{ background: 'hsl(var(--popover))' }}>
                <div className="text-sm font-semibold text-foreground mb-3">Show or Hide Columns</div>
                {allColumns.map(col => (
                  <label key={col.key} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer mb-1.5">
                    <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => {
                      setVisibleCols(prev => { const n = new Set(prev); if (n.has(col.key) && n.size > 1) n.delete(col.key); else n.add(col.key); return n; });
                    }} style={{ accentColor: 'hsl(var(--primary))' }} />
                    {col.label}
                  </label>
                ))}
                <Button size="sm" className="w-full mt-2" onClick={() => setShowColMenu(false)}>Apply</Button>
              </div>
            </>
          )}
        </div>
        {isAdmin && <Button size="sm" onClick={() => setAddOpen(true)} className="h-9 gap-1"><Plus className="w-4 h-4" /> Add</Button>}
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
          <select value={filters.stage || ''} onChange={e => setFilters(f => e.target.value ? { ...f, stage: e.target.value } : (() => { const { stage, ...r } = f; return r; })())}
            className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
            <option value="">All Stages</option>
            {opportunityStages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.assignedTo || ''} onChange={e => setFilters(f => e.target.value ? { ...f, assignedTo: e.target.value } : (() => { const { assignedTo, ...r } = f; return r; })())}
            className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
            <option value="">All Assignees</option>
            {[...new Set(opportunities.map(o => o.assignedTo))].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {Object.keys(filters).length > 0 && <button onClick={() => setFilters({})} className="text-xs text-destructive hover:underline">Clear</button>}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              {isVis('companyName') && <th onClick={() => toggleSort('companyName')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Company <SortIcon col="companyName" /></div></th>}
              {isVis('contactName') && <th onClick={() => toggleSort('contactName')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Contact <SortIcon col="contactName" /></div></th>}
              {isVis('value') && <th onClick={() => toggleSort('value')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Value <SortIcon col="value" /></div></th>}
              {isVis('stage') && <th onClick={() => toggleSort('stage')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Stage <SortIcon col="stage" /></div></th>}
              {isVis('probability') && <th onClick={() => toggleSort('probability')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Probability <SortIcon col="probability" /></div></th>}
              {isVis('campaignName') && <th onClick={() => toggleSort('campaignName')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Campaign <SortIcon col="campaignName" /></div></th>}
              {isVis('assignedTo') && <th onClick={() => toggleSort('assignedTo')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Assigned To <SortIcon col="assignedTo" /></div></th>}
              {isVis('expectedClose') && <th onClick={() => toggleSort('expectedClose')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Expected Close <SortIcon col="expectedClose" /></div></th>}
              {isVis('notes') && <th>Notes</th>}
              <th className="w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan={20} className="text-center text-muted-foreground py-8">No results found</td></tr>
            ) : filteredData.map(o => (
              <tr key={o.id} onClick={() => handleRowClick(o)} className={`cursor-pointer ${companies.find(c => c.name === o.companyName)?.id === selectedCompanyId && detailOpen ? 'bg-primary/10' : ''}`}>
                {isVis('companyName') && <td><span className="font-medium text-foreground">{o.companyName}</span></td>}
                {isVis('contactName') && <td>{o.contactName}</td>}
                {isVis('value') && <td className="font-mono text-xs">{o.value}</td>}
                {isVis('stage') && <td><span className={`status-pill ${stageColor[o.stage] || 'status-offen'}`}>{o.stage}</span></td>}
                {isVis('probability') && (
                  <td>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 rounded-full" style={{ background: 'hsl(var(--surface-2))' }}>
                        <div className="h-full rounded-full" style={{ width: `${o.probability}%`, background: 'hsl(var(--primary))' }} />
                      </div>
                      <span className="text-xs font-mono">{o.probability}%</span>
                    </div>
                  </td>
                )}
                {isVis('campaignName') && <td className="text-xs text-muted-foreground">{o.campaignName}</td>}
                {isVis('assignedTo') && <td className="text-xs">{o.assignedTo}</td>}
                {isVis('expectedClose') && <td className="text-xs">{o.expectedClose}</td>}
                {isVis('notes') && <td className="text-xs text-muted-foreground truncate max-w-xs">{o.notes}</td>}
                <td>
                  <button onClick={() => setDeleteConfirm({ open: true, id: o.id, name: o.companyName })} className="text-muted-foreground hover:text-foreground p-0.5">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle className="text-xl font-bold">Add Opportunity</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">Company *</label><Input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Contact *</label><Input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Value</label><Input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="e.g. €10-20M" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div>
                <label className="text-sm font-semibold">Stage</label>
                <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">Select</option>
                  {opportunityStages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-semibold">Expected Close</label><Input type="date" value={form.expectedClose} onChange={e => setForm(f => ({ ...f, expectedClose: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
              <div><label className="text-sm font-semibold">Assigned To</label><Input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            </div>
            <div><label className="text-sm font-semibold">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[60px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast({ title: 'Opportunity Added', description: `"${form.companyName}" opportunity created.` }); setAddOpen(false); }} disabled={!form.companyName || !form.contactName}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={open => setDeleteConfirm(p => ({ ...p, open }))}
        title="Delete Opportunity"
        description={`Are you sure you want to delete the opportunity for "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => toast({ title: 'Opportunity Deleted', description: `Opportunity for "${deleteConfirm.name}" has been deleted.`, variant: 'destructive' })}
      />
    </div>
  );
};

export default OpportunitiesView;
