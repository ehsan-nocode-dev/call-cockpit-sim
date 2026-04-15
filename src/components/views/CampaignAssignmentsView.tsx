import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { campaigns, Campaign, Company, statusList, Status } from '@/data/mockData';
import { Search, ChevronUp, ChevronDown, Eye, X, Plus, Pencil, Trash2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Assignment {
  id: string;
  campaignId: string;
  companyId: string;
  status: 'Active' | 'Paused' | 'Completed';
  createdDate: string;
  notes: string;
}

const CampaignAssignmentsView: React.FC = () => {
  const { companies, role, updateCompany } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  // Build assignments from companies' campaignId
  const [extraAssignments, setExtraAssignments] = useState<Assignment[]>([]);
  const [assignmentStatuses, setAssignmentStatuses] = useState<Record<string, 'Active' | 'Paused' | 'Completed'>>({});

  const assignments = useMemo(() => {
    const fromCompanies: Assignment[] = companies.map(c => ({
      id: `asgn-${c.id}-${c.campaignId}`,
      campaignId: c.campaignId,
      companyId: c.id,
      status: assignmentStatuses[`asgn-${c.id}-${c.campaignId}`] || 'Active',
      createdDate: '2024-01-15',
      notes: '',
    }));
    return [...fromCompanies, ...extraAssignments];
  }, [companies, extraAssignments, assignmentStatuses]);

  // Table state
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('campaignName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const allColumns = [
    { key: 'campaignName', label: 'Campaign' },
    { key: 'companyName', label: 'Company' },
    { key: 'companyCountry', label: 'Country' },
    { key: 'companyCity', label: 'City' },
    { key: 'companyStatus', label: 'Company Status' },
    { key: 'assignmentStatus', label: 'Assignment Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'createdDate', label: 'Assigned Date' },
    { key: 'notes', label: 'Notes' },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(allColumns.map(c => c.key)));
  const [showColMenu, setShowColMenu] = useState(false);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ campaignId: '', companyId: '', notes: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ id: string; status: string; notes: string }>({ id: '', status: 'Active', notes: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; label: string }>({ open: false, id: '', label: '' });

  const enriched = useMemo(() => {
    return assignments.map(a => {
      const camp = campaigns.find(c => c.id === a.campaignId);
      const comp = companies.find(c => c.id === a.companyId);
      return {
        ...a,
        campaignName: camp?.name || '—',
        companyName: comp?.name || '—',
        companyCountry: comp?.country || '—',
        companyCity: comp?.city || '—',
        companyStatus: comp?.status || '—',
        priority: comp?.companyPriority || '—',
      };
    });
  }, [assignments, companies]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => r.campaignName.toLowerCase().includes(q) || r.companyName.toLowerCase().includes(q) || r.companyCity.toLowerCase().includes(q));
    }
    if (filters.campaign) result = result.filter(r => r.campaignId === filters.campaign);
    if (filters.assignmentStatus) result = result.filter(r => r.status === filters.assignmentStatus);
    if (filters.country) result = result.filter(r => r.companyCountry === filters.country);

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aV = String((a as any)[sortKey] || '');
        const bV = String((b as any)[sortKey] || '');
        const cmp = aV.localeCompare(bV, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [enriched, search, filters, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };
  const isVis = (key: string) => visibleCols.has(key);

  const statusBadge = (status: string) => {
    const c: Record<string, string> = {
      Active: 'text-green-400 bg-green-400/15',
      Paused: 'text-yellow-400 bg-yellow-400/15',
      Completed: 'text-blue-400 bg-blue-400/15',
    };
    return c[status] || c.Active;
  };

  // Check for duplicates on add
  const handleAdd = () => {
    const exists = assignments.some(a => a.campaignId === addForm.campaignId && a.companyId === addForm.companyId);
    if (exists) {
      toast({ title: 'Assignment Exists', description: 'This company is already assigned to this campaign.', variant: 'destructive' });
      return;
    }
    const newA: Assignment = {
      id: `asgn-extra-${Date.now()}`,
      campaignId: addForm.campaignId,
      companyId: addForm.companyId,
      status: 'Active',
      createdDate: new Date().toISOString().slice(0, 10),
      notes: addForm.notes,
    };
    setExtraAssignments(prev => [...prev, newA]);
    toast({ title: 'Assignment Created', description: `Company linked to campaign.` });
    setAddOpen(false);
    setAddForm({ campaignId: '', companyId: '', notes: '' });
  };

  const handleEdit = () => {
    setAssignmentStatuses(prev => ({ ...prev, [editForm.id]: editForm.status as any }));
    toast({ title: 'Assignment Updated' });
    setEditOpen(false);
  };

  const handleDelete = (id: string) => {
    setExtraAssignments(prev => prev.filter(a => a.id !== id));
    toast({ title: 'Assignment Removed', variant: 'destructive' });
    setDeleteConfirm({ open: false, id: '', label: '' });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-sm font-semibold text-foreground mr-2">Campaign Assignments</h2>
        <span className="text-xs text-muted-foreground">{filtered.length} / {enriched.length}</span>
        <div className="flex-1" />

        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-8 pl-7 text-xs" style={{ background: 'hsl(var(--surface-2))' }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>}
        </div>

        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 text-xs gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          {Object.keys(filters).length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary">{Object.keys(filters).length}</span>}
        </Button>

        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowColMenu(!showColMenu)} className="h-8 text-xs"><Eye className="w-3.5 h-3.5" /></Button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded border border-border p-2 shadow-lg" style={{ background: 'hsl(var(--popover))' }}>
                <div className="text-xs font-medium text-muted-foreground mb-1">Columns</div>
                {allColumns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:bg-accent/10 rounded px-1 py-0.5">
                    <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => {
                      setVisibleCols(prev => { const n = new Set(prev); if (n.has(col.key) && n.size > 1) n.delete(col.key); else n.add(col.key); return n; });
                    }} style={{ accentColor: 'hsl(var(--primary))' }} />
                    {col.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {isAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)} className="h-8 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> Assign</Button>
        )}
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border flex-wrap" style={{ background: 'hsl(var(--surface-1))' }}>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground uppercase">Campaign:</span>
            <select value={filters.campaign || ''} onChange={e => setFilters(f => e.target.value ? { ...f, campaign: e.target.value } : (() => { const { campaign, ...r } = f; return r; })())}
              className="h-6 text-xs rounded border border-border px-1.5 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
              <option value="">All</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground uppercase">Status:</span>
            <select value={filters.assignmentStatus || ''} onChange={e => setFilters(f => e.target.value ? { ...f, assignmentStatus: e.target.value } : (() => { const { assignmentStatus, ...r } = f; return r; })())}
              className="h-6 text-xs rounded border border-border px-1.5 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground uppercase">Country:</span>
            <select value={filters.country || ''} onChange={e => setFilters(f => e.target.value ? { ...f, country: e.target.value } : (() => { const { country, ...r } = f; return r; })())}
              className="h-6 text-xs rounded border border-border px-1.5 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
              <option value="">All</option>
              {[...new Set(enriched.map(r => r.companyCountry))].sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {Object.keys(filters).length > 0 && <button onClick={() => setFilters({})} className="text-[10px] text-destructive hover:underline ml-2">Clear all</button>}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              {isVis('campaignName') && <th onClick={() => toggleSort('campaignName')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Campaign<SortIcon col="campaignName" /></div></th>}
              {isVis('companyName') && <th onClick={() => toggleSort('companyName')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Company<SortIcon col="companyName" /></div></th>}
              {isVis('companyCountry') && <th onClick={() => toggleSort('companyCountry')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Country<SortIcon col="companyCountry" /></div></th>}
              {isVis('companyCity') && <th onClick={() => toggleSort('companyCity')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">City<SortIcon col="companyCity" /></div></th>}
              {isVis('companyStatus') && <th onClick={() => toggleSort('companyStatus')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Company Status<SortIcon col="companyStatus" /></div></th>}
              {isVis('assignmentStatus') && <th onClick={() => toggleSort('status')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Assignment Status<SortIcon col="status" /></div></th>}
              {isVis('priority') && <th onClick={() => toggleSort('priority')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Priority<SortIcon col="priority" /></div></th>}
              {isVis('createdDate') && <th onClick={() => toggleSort('createdDate')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Assigned Date<SortIcon col="createdDate" /></div></th>}
              {isVis('notes') && <th>Notes</th>}
              {isAdmin && <th className="w-16">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={12} className="text-center text-muted-foreground py-8">No assignments found</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id}>
                {isVis('campaignName') && <td className="text-xs font-medium text-foreground">{r.campaignName}</td>}
                {isVis('companyName') && <td className="text-xs font-medium text-foreground">{r.companyName}</td>}
                {isVis('companyCountry') && <td className="text-xs">{r.companyCountry}</td>}
                {isVis('companyCity') && <td className="text-xs">{r.companyCity}</td>}
                {isVis('companyStatus') && <td className="text-xs">{r.companyStatus}</td>}
                {isVis('assignmentStatus') && (
                  <td><span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${statusBadge(r.status)}`}>{r.status}</span></td>
                )}
                {isVis('priority') && <td className="text-xs">{r.priority}</td>}
                {isVis('createdDate') && <td className="text-xs whitespace-nowrap">{r.createdDate}</td>}
                {isVis('notes') && <td className="text-xs text-muted-foreground truncate max-w-[120px]">{r.notes || '—'}</td>}
                {isAdmin && (
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditForm({ id: r.id, status: r.status, notes: r.notes }); setEditOpen(true); }} className="text-muted-foreground hover:text-primary p-0.5">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm({ open: true, id: r.id, label: `${r.companyName} → ${r.campaignName}` })} className="text-muted-foreground hover:text-destructive p-0.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Assignment Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Campaign *</label>
              <select value={addForm.campaignId} onChange={e => setAddForm(f => ({ ...f, campaignId: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                <option value="">Select Campaign</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Company *</label>
              <select value={addForm.companyId} onChange={e => setAddForm(f => ({ ...f, companyId: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Notes</label>
              <textarea value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[60px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!addForm.campaignId || !addForm.companyId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle>Edit Assignment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Status</label>
              <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Notes</label>
              <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[60px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: '', label: '' })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Remove Assignment?"
        description={`Remove the assignment "${deleteConfirm.label}"? This will unlink the company from the campaign.`}
      />
    </div>
  );
};

export default CampaignAssignmentsView;
