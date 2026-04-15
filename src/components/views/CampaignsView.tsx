import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { campaigns, Campaign } from '@/data/mockData';
import { Search, ChevronUp, ChevronDown, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const CampaignsView: React.FC = () => {
  const { companies, role } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [form, setForm] = useState({ name: '', pitchText: '', pitchLink: '' });

  const enriched = campaigns.map(c => ({ ...c, companyCount: companies.filter(co => co.campaignId === c.id).length }));

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const filteredData = useMemo(() => {
    let result = [...enriched];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = String((a as any)[sortKey] || '');
        const bVal = String((b as any)[sortKey] || '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal, undefined, { numeric: true }) : bVal.localeCompare(aVal, undefined, { numeric: true });
      });
    }
    return result;
  }, [search, sortKey, sortDir, enriched]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-lg font-semibold text-foreground">Campaigns</h2>
        <div className="flex-1" />
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-9 pl-8 text-sm" style={{ background: 'hsl(var(--surface-2))' }} />
        </div>
        {isAdmin && <Button size="sm" onClick={() => setAddOpen(true)} className="h-9 gap-1"><Plus className="w-4 h-4" /> Add Campaign</Button>}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Campaign Name <SortIcon col="name" /></div></th>
              <th onClick={() => toggleSort('companyCount')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Companies <SortIcon col="companyCount" /></div></th>
              <th>Pitch Summary</th>
              <th>Pitch Link</th>
              <th className="w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(c => (
              <tr key={c.id}>
                <td><span className="font-medium text-foreground">{c.name}</span></td>
                <td><span className="text-xs font-mono text-primary">{c.companyCount}</span></td>
                <td><span className="text-xs text-muted-foreground truncate max-w-xs block">{c.pitchText.slice(0, 80)}…</span></td>
                <td><a href={c.pitchLink} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{c.pitchLink}</a></td>
                <td>
                  <button onClick={() => setDeleteConfirm({ open: true, id: c.id, name: c.name })} className="text-muted-foreground hover:text-foreground p-0.5">
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
          <DialogHeader><DialogTitle className="text-xl font-bold">Add Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">Campaign Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Text</label><textarea value={form.pitchText} onChange={e => setForm(f => ({ ...f, pitchText: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[80px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Link</label><Input value={form.pitchLink} onChange={e => setForm(f => ({ ...f, pitchLink: e.target.value }))} placeholder="https://..." className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast({ title: 'Campaign Added', description: `"${form.name}" has been created.` }); setAddOpen(false); }} disabled={!form.name}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={open => setDeleteConfirm(p => ({ ...p, open }))}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => toast({ title: 'Campaign Deleted', description: `"${deleteConfirm.name}" has been deleted.`, variant: 'destructive' })}
      />
    </div>
  );
};

export default CampaignsView;
