import React from 'react';
import DataTable, { Column } from '@/components/DataTable';
import { useAppState } from '@/context/AppContext';
import { appUsers, AppUser } from '@/data/additionalMockData';

const UsersView: React.FC = () => {
  const { role } = useAppState();
  const isAdmin = role === 'admin';

  const columns: Column<AppUser>[] = [
    { key: 'name', label: 'Name', sortable: true,
      render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: 'email', label: 'Email', sortable: true,
      render: (r) => <a href={`mailto:${r.email}`} className="text-primary hover:underline text-xs">{r.email}</a> },
    { key: 'role', label: 'Role', sortable: true, filterable: true, filterOptions: ['admin', 'assistant'],
      render: (r) => (
        <span className={`status-pill ${r.role === 'admin' ? 'status-deal' : 'status-offen'}`}>{r.role}</span>
      ) },
    { key: 'status', label: 'Status', sortable: true, filterable: true, filterOptions: ['active', 'inactive'],
      render: (r) => (
        <span className={`status-pill ${r.status === 'active' ? 'status-diskussion' : 'status-kein-interesse'}`}>{r.status}</span>
      ) },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true, defaultVisible: false },
  ];

  return (
    <DataTable
      data={appUsers}
      columns={columns}
      idKey="id"
      title="Users"
      isAdmin={isAdmin}
      onAdd={isAdmin ? () => alert('Add user — simulated') : undefined}
      onEdit={isAdmin ? (r) => alert(`Edit user "${r.name}" — simulated`) : undefined}
      onDelete={isAdmin ? (id) => alert(`Delete user ${id} — simulated`) : undefined}
    />
  );
};

export default UsersView;
