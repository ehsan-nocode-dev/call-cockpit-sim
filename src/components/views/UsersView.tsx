import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { appUsers, AppUser } from '@/data/additionalMockData';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const UsersView: React.FC = () => {
  const { role } = useAppState();
  const isAdmin = role === 'admin';
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [form, setForm] = useState({ name: '', email: '', role: '' });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const filteredData = useMemo(() => {
    let result = [...appUsers];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (filters.status) result = result.filter(u => u.status === filters.status);
    if (filters.role) result = result.filter(u => u.role === filters.role);
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortKey] || '';
        const bVal = (b as any)[sortKey] || '';
        return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
      });
    }
    return result;
  }, [search, filters, sortKey, sortDir]);

  const handleInvite = () => {
    toast({ title: 'Invite Sent', description: `Invitation sent to "${form.email}".` });
    setInviteOpen(false);
    setForm({ name: '', email: '', role: '' });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-lg font-semibold text-foreground">Users</h2>
        <div className="flex-1" />
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Users"
            className="h-9 pl-8 text-sm" style={{ background: 'hsl(var(--surface-2))' }} />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9"><SlidersHorizontal className="w-4 h-4" /></Button>
        {isAdmin && <Button size="sm" onClick={() => setInviteOpen(true)} className="h-9 gap-1">Invite User</Button>}
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border" style={{ background: 'hsl(var(--surface-1))' }}>
          <select value={filters.status || ''} onChange={e => setFilters(f => e.target.value ? { ...f, status: e.target.value } : (() => { const { status, ...r } = f; return r; })())}
            className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
            <option value="">Choose Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={filters.role || ''} onChange={e => setFilters(f => e.target.value ? { ...f, role: e.target.value } : (() => { const { role: _r, ...r } = f; return r; })())}
            className="h-7 text-xs rounded border border-border px-2 text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
            <option value="">Choose Role</option>
            <option value="Admin">Admin</option>
            <option value="Assistant">Assistant</option>
          </select>
          {Object.keys(filters).length > 0 && <button onClick={() => setFilters({})} className="text-xs text-destructive hover:underline">Clear</button>}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Name <SortIcon col="name" /></div></th>
              <th onClick={() => toggleSort('email')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Email <SortIcon col="email" /></div></th>
              <th onClick={() => toggleSort('role')} className="cursor-pointer select-none"><div className="flex items-center gap-0.5">Role <SortIcon col="role" /></div></th>
              <th>Status</th>
              <th>Creation Date</th>
              <th className="w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No users found</td></tr>
            ) : filteredData.map(u => (
              <tr key={u.id}>
                <td><span className="font-medium text-foreground">{u.name}</span></td>
                <td><span className="text-muted-foreground text-sm">{u.email}</span></td>
                <td><span className="text-sm">{u.role}</span></td>
                <td>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: u.status === 'Active' ? 'hsl(150 60% 45% / 0.15)' : 'hsl(0 65% 50% / 0.15)',
                      color: u.status === 'Active' ? 'hsl(150 60% 45%)' : 'hsl(0 65% 50%)',
                    }}>
                    {u.status}
                  </span>
                </td>
                <td className="text-sm text-muted-foreground">{u.createdAt}</td>
                <td>
                  <button onClick={() => setDeleteConfirm({ open: true, id: u.id, name: u.name })} className="text-muted-foreground hover:text-foreground p-0.5">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite User Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'hsl(var(--surface-1))' }}>
          <DialogHeader><DialogTitle className="text-xl font-bold">Invite User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Full name</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Email Address</label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="assistant@callcockpit.com" className="mt-1" style={{ background: 'hsl(var(--surface-2))' }} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input px-3 text-sm text-foreground" style={{ background: 'hsl(var(--surface-2))' }}>
                <option value="">Choose Role</option>
                <option value="Admin">Admin</option>
                <option value="Assistant">Assistant</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!form.name || !form.email || !form.role}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={open => setDeleteConfirm(p => ({ ...p, open }))}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => toast({ title: 'User Deleted', description: `"${deleteConfirm.name}" has been deleted.`, variant: 'destructive' })}
      />
    </div>
  );
};

export default UsersView;
