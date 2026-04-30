import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { campaigns as initialCampaigns, Campaign } from '@/data/mockData';
import { Search, ChevronUp, ChevronDown, Eye, X, Plus, Pencil, Archive, MoreVertical, Upload } from 'lucide-react';
import ImportFlow from '@/components/import/ImportFlow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CampaignStatus = 'Active' | 'Closed' | 'Archived';

interface CampaignRow extends Campaign {
  description: string;
  status: CampaignStatus;
  companyCount: number;
  createdDate: string;
}

const CampaignsView: React.FC = () => {
  const { companies, role } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, CampaignStatus>>(() => {
    const map: Record<string, CampaignStatus> = {};
    initialCampaigns.forEach(c => { map[c.id] = 'Active'; });
    return map;
  });

  // Filter
  const [filter, setFilter] = useState<'all' | 'Active' | 'Closed' | 'Archived'>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Column visibility
  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'pitchText', label: 'Pitch' },
    { key: 'description', label: 'Description' },
    { key: 'companies', label: 'Companies' },
    { key: 'createdDate', label: 'Created' },
    { key: 'status', label: 'Status' },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(allColumns.map(c => c.key)));
  const [showColMenu, setShowColMenu] = useState(false);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', pitchText: '', pitchLink: '', description: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', pitchText: '', pitchLink: '', description: '' });
  const [archiveConfirm, setArchiveConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [importCampaign, setImportCampaign] = useState<{ open: boolean; name: string }>({ open: false, name: '' });

  const data = useMemo(() => {
    let list: CampaignRow[] = initialCampaigns.map(c => ({
      ...c,
      description: c.pitchText.slice(0, 80) + '…',
      status: campaignStatuses[c.id] || 'Active',
      companyCount: companies.filter(co => co.campaignId === c.id).length,
      createdDate: '2024-01-15',
    }));

    if (filter !== 'all') list = list.filter(c => c.status === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.pitchText.toLowerCase().includes(q));
    }

    if (sortKey) {
      list.sort((a, b) => {
        let aV = '', bV = '';
        switch (sortKey) {
          case 'name': aV = a.name; bV = b.name; break;
          case 'companies': aV = String(a.companyCount); bV = String(b.companyCount); break;
          case 'createdDate': aV = a.createdDate; bV = b.createdDate; break;
          case 'status': aV = a.status; bV = b.status; break;
          default: aV = a.name; bV = b.name;
        }
        const cmp = aV.localeCompare(bV, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [campaignStatuses, companies, filter, search, sortKey, sortDir]);

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
    const colors: Record<string, string> = {
      Active: 'text-green-400 bg-green-400/15',
      Closed: 'text-yellow-400 bg-yellow-400/15',
      Archived: 'text-muted-foreground bg-muted/30',
    };
    return colors[status] || colors.Active;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-sm font-semibold text-foreground mr-2">Campaigns</h2>
        <span className="text-xs text-muted-foreground">{data.length} records</span>
        <div className="flex-1" />

        <select value={filter} onChange={e => setFilter(e.target.value as any)}
          className="h-8 text-xs rounded border border-border px-1.5 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
          <option value="all">All</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
          <option value="Archived">Archived</option>
        </select>

        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-8 pl-7 text-xs" style={{ background: 'hsl(var(--surface-2))' }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>}
        </div>

        {/* Column visibility */}
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
          <Button size="sm" onClick={() => setAddOpen(true)} className="h-8 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> Add Campaign</Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              {isVis('name') && <th onClick={() => toggleSort('name')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Name<SortIcon col="name" /></div></th>}
              {isVis('pitchText') && <th>Pitch</th>}
              {isVis('description') && <th>Description</th>}
              {isVis('companies') && <th onClick={() => toggleSort('companies')} className="cursor-pointer select-none text-center"><div className="flex items-center gap-0.5 justify-center">Companies<SortIcon col="companies" /></div></th>}
              {isVis('createdDate') && <th onClick={() => toggleSort('createdDate')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Created<SortIcon col="createdDate" /></div></th>}
              {isVis('status') && <th onClick={() => toggleSort('status')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Status<SortIcon col="status" /></div></th>}
              {isAdmin && <th className="w-10">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-muted-foreground py-8">No campaigns found</td></tr>
            ) : data.map(c => (
              <tr key={c.id}>
                {isVis('name') && <td><span className="font-medium text-foreground">{c.name}</span></td>}
                {isVis('pitchText') && <td className="text-xs text-muted-foreground truncate max-w-[200px]">{c.pitchText}</td>}
                {isVis('description') && <td className="text-xs text-muted-foreground truncate max-w-[160px]">{c.description}</td>}
                {isVis('companies') && <td className="text-center text-xs">{c.companyCount}</td>}
                {isVis('createdDate') && <td className="text-xs whitespace-nowrap">{c.createdDate}</td>}
                {isVis('status') && (
                  <td>
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${statusBadge(c.status)}`}>{c.status}</span>
                  </td>
                )}
                {isAdmin && (
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground p-0.5"><MoreVertical className="w-3.5 h-3.5" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => { setEditForm({ id: c.id, name: c.name, pitchText: c.pitchText, pitchLink: c.pitchLink, description: '' }); setEditOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setImportCampaign({ open: true, name: c.name })}>
                          <Upload className="w-3.5 h-3.5 mr-2" /> Import Companies
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setArchiveConfirm({ open: true, id: c.id, name: c.name })}>
                          <Archive className="w-3.5 h-3.5 mr-2" /> {c.status === 'Archived' ? 'Restore' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteConfirm({ open: true, id: c.id, name: c.name })} className="text-destructive">
                          <X className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Campaign Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle>Add Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">Campaign Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Text</label><textarea value={form.pitchText} onChange={e => setForm(f => ({ ...f, pitchText: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[80px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Link</label><Input value={form.pitchLink} onChange={e => setForm(f => ({ ...f, pitchLink: e.target.value }))} placeholder="https://..." className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[60px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast({ title: 'Campaign Added', description: `"${form.name}" created.` }); setAddOpen(false); setForm({ name: '', pitchText: '', pitchLink: '', description: '' }); }} disabled={!form.name}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle>Edit Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">Campaign Name *</label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Text</label><textarea value={editForm.pitchText} onChange={e => setEditForm(f => ({ ...f, pitchText: e.target.value }))} className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm text-foreground min-h-[80px] resize-y" style={{ background: 'hsl(var(--surface-2))' }} /></div>
            <div><label className="text-sm font-semibold">Pitch Link</label><Input value={editForm.pitchLink} onChange={e => setEditForm(f => ({ ...f, pitchLink: e.target.value }))} placeholder="https://..." className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast({ title: 'Campaign Updated', description: `"${editForm.name}" saved.` }); setEditOpen(false); }} disabled={!editForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirm */}
      <ConfirmDialog
        open={archiveConfirm.open}
        onOpenChange={() => setArchiveConfirm({ open: false, id: '', name: '' })}
        onConfirm={() => {
          const was = campaignStatuses[archiveConfirm.id];
          setCampaignStatuses(prev => ({ ...prev, [archiveConfirm.id]: was === 'Archived' ? 'Active' : 'Archived' }));
          toast({ title: was === 'Archived' ? 'Campaign Restored' : 'Campaign Archived', description: `"${archiveConfirm.name}"` });
          setArchiveConfirm({ open: false, id: '', name: '' });
        }}
        title={campaignStatuses[archiveConfirm.id] === 'Archived' ? 'Restore Campaign?' : 'Archive Campaign?'}
        description={`Are you sure you want to ${campaignStatuses[archiveConfirm.id] === 'Archived' ? 'restore' : 'archive'} "${archiveConfirm.name}"?`}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={() => setDeleteConfirm({ open: false, id: '', name: '' })}
        onConfirm={() => {
          toast({ title: 'Campaign Deleted', description: `"${deleteConfirm.name}" has been removed.`, variant: 'destructive' });
          setDeleteConfirm({ open: false, id: '', name: '' });
        }}
        title="Delete Campaign?"
        description={`This will permanently delete "${deleteConfirm.name}" and remove all associated assignments. This action cannot be undone.`}
      />

      {/* Campaign-scoped CSV import */}
      <ImportFlow
        open={importCampaign.open}
        onOpenChange={(v) => setImportCampaign(s => ({ ...s, open: v }))}
        entity="company"
        campaignName={importCampaign.name}
        onComplete={() => toast({ title: 'Import Complete', description: `Companies imported into "${importCampaign.name}".` })}
      />
    </div>
  );
};

export default CampaignsView;
