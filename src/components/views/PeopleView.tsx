import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { people as initialPeople, Person, personTypes } from '@/data/additionalMockData';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, Eye, X, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const PeopleView: React.FC = () => {
  const { role } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const allColumns = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'phone', label: 'Phone #' },
    { key: 'typeStake', label: 'Type & Stake' },
    { key: 'tags', label: 'Tags' },
    { key: 'decisionMaker', label: 'Decision Maker?' },
    { key: 'company', label: 'Company' },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(allColumns.map(c => c.key)));
  const [showColMenu, setShowColMenu] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  const [form, setForm] = useState({ title: '', firstName: '', lastName: '', email: '', phone: '', mobile: '', company: '', position: '', type: 'Management' as string, stake: '', notes: '' });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const filteredData = useMemo(() => {
    let result = [...initialPeople];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        `${p.title} ${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.phone.includes(q) || p.mobile.includes(q)
      );
    }
    if (filters.type) result = result.filter(p => p.type === filters.type);
    if (sortKey) {
      result.sort((a, b) => {
        let aVal = '', bVal = '';
        switch (sortKey) {
          case 'lastName': aVal = a.lastName; bVal = b.lastName; break;
          case 'firstName': aVal = a.firstName; bVal = b.firstName; break;
          case 'company': aVal = a.company; bVal = b.company; break;
          case 'type': aVal = a.type; bVal = b.type; break;
          default: aVal = a.lastName; bVal = b.lastName;
        }
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [search, filters, sortKey, sortDir]);

  const handleAdd = () => {
    toast({ title: 'Person Added', description: `"${form.firstName} ${form.lastName}" has been added.` });
    setAddOpen(false);
    setForm({ title: '', firstName: '', lastName: '', email: '', phone: '', mobile: '', company: '', position: '', type: 'Management', stake: '', notes: '' });
  };

  const isVis = (key: string) => visibleCols.has(key);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-lg font-semibold text-foreground">Person</h2>
        <div className="flex-1" />
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Person"
            className="h-9 pl-8 text-sm" style={{ background: 'hsl(var(--surface-2))' }} />
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
        {isAdmin && <Button size="sm" onClick={() => setAddOpen(true)} className="h-9 gap-1">Add Person</Button>}
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
          <select value={filters.type || ''} onChange={e => setFilters(f => e.target.value ? { ...f, type: e.target.value } : (() => { const { type, ...r } = f; return r; })())}
            className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
            <option value="">All Types</option>
            {personTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {Object.keys(filters).length > 0 && <button onClick={() => setFilters({})} className="text-xs text-destructive hover:underline">Clear</button>}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              {isVis('fullName') && <th onClick={() => toggleSort('lastName')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Full Name <SortIcon col="lastName" /></div></th>}
              {isVis('phone') && <th>Phone #</th>}
              {isVis('typeStake') && <th onClick={() => toggleSort('type')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Type & Stake <SortIcon col="type" /></div></th>}
              {isVis('tags') && <th>Tags</th>}
              {isVis('decisionMaker') && <th>Decision Maker?</th>}
              {isVis('company') && <th onClick={() => toggleSort('company')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Company <SortIcon col="company" /></div></th>}
              <th className="w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan={20} className="text-center text-muted-foreground py-8">No results found</td></tr>
            ) : filteredData.map(p => (
              <tr key={p.id}>
                {isVis('fullName') && (
                  <td>
                    <div className="font-medium text-foreground">{p.title ? `${p.title} ` : ''}{p.firstName} {p.lastName}</div>
                    <a href={`mailto:${p.email}`} className="text-primary hover:underline text-xs">{p.email}</a>
                  </td>
                )}
                {isVis('phone') && (
                  <td>
                    <div className="text-xs">📱 {p.phone}</div>
                    <div className="text-xs text-muted-foreground">📞 {p.mobile}</div>
                  </td>
                )}
                {isVis('typeStake') && (
                  <td>
                    <div className="text-sm">{p.type}</div>
                    <div className="text-xs text-muted-foreground">{p.stake}</div>
                  </td>
                )}
                {isVis('tags') && (
                  <td>
                    <div className="flex flex-wrap gap-0.5 items-center">
                      {p.tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded text-foreground" style={{ background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                          {t} <X className="w-2.5 h-2.5 cursor-pointer opacity-70 hover:opacity-100" />
                        </span>
                      ))}
                      <button className="text-muted-foreground hover:text-primary"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                )}
                {isVis('decisionMaker') && (
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.isDecisionMaker ? 'text-green-400' : 'text-red-400'}`}
                      style={{ background: p.isDecisionMaker ? 'hsl(150 60% 45% / 0.15)' : 'hsl(0 65% 50% / 0.15)' }}>
                      {p.isDecisionMaker ? 'Yes' : 'No'}
                    </span>
                  </td>
                )}
                {isVis('company') && (
                  <td>
                    <div className="text-sm text-foreground">{p.company}</div>
                    <a href={`https://${p.companyWebsite}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{p.companyWebsite}</a>
                  </td>
                )}
                <td>
                  <button onClick={() => setDeleteConfirm({ open: true, id: p.id, name: `${p.firstName} ${p.lastName}` })} className="text-muted-foreground hover:text-foreground p-0.5">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Person Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle className="text-xl font-bold">Add Person</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold">Title</label>
                <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  <option value="">-</option>
                  {['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Mag.'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">First Name *</label>
                <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold">Last Name *</label>
                <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">Email *</label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold">Company</label>
                <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold">Phone</label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold">Mobile</label>
                <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
              <div>
                <label className="text-sm font-semibold">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                  {personTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Stake</label>
                <Input value={form.stake} onChange={e => setForm(f => ({ ...f, stake: e.target.value }))} placeholder="e.g. 30%" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.firstName || !form.lastName || !form.email}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={open => setDeleteConfirm(p => ({ ...p, open }))}
        title="Delete Person"
        description={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => toast({ title: 'Person Deleted', description: `"${deleteConfirm.name}" has been deleted.`, variant: 'destructive' })}
      />
    </div>
  );
};

export default PeopleView;
