import React from 'react';
import DataTable, { Column } from '@/components/DataTable';
import { useAppState } from '@/context/AppContext';
import { people, Person } from '@/data/additionalMockData';

const PeopleView: React.FC = () => {
  const { role } = useAppState();
  const isAdmin = role === 'admin';

  const columns: Column<Person>[] = [
    { key: 'title', label: 'Title', sortable: true, defaultVisible: false },
    { key: 'firstName', label: 'First Name', sortable: true,
      render: (r) => <span className="font-medium text-foreground">{r.title ? `${r.title} ` : ''}{r.firstName}</span> },
    { key: 'lastName', label: 'Last Name', sortable: true,
      render: (r) => <span className="font-medium text-foreground">{r.lastName}</span> },
    { key: 'company', label: 'Company', sortable: true, filterable: true,
      filterOptions: [...new Set(people.map(p => p.company))] },
    { key: 'position', label: 'Position', sortable: true },
    { key: 'email', label: 'Email', sortable: true,
      render: (r) => <a href={`mailto:${r.email}`} className="text-primary hover:underline text-xs">{r.email}</a> },
    { key: 'phone', label: 'Phone', defaultVisible: false },
    { key: 'mobile', label: 'Mobile', defaultVisible: false },
    { key: 'tags', label: 'Tags',
      getValue: (r) => r.tags.join(', '),
      render: (r) => <div className="flex flex-wrap gap-0.5">{r.tags.map(t => <span key={t} className="px-1 py-0.5 text-[10px] rounded text-muted-foreground" style={{background:'hsl(var(--surface-2))'}}>{t}</span>)}</div> },
    { key: 'notes', label: 'Notes', defaultVisible: false,
      render: (r) => <span className="text-xs text-muted-foreground truncate max-w-xs block">{r.notes}</span> },
    { key: 'createdAt', label: 'Created', sortable: true, defaultVisible: false },
  ];

  return (
    <DataTable
      data={people}
      columns={columns}
      idKey="id"
      title="People"
      isAdmin={isAdmin}
      onAdd={() => alert('Add person — simulated')}
      onEdit={(r) => alert(`Edit "${r.firstName} ${r.lastName}" — simulated`)}
      onDelete={(id) => alert(`Delete person ${id} — simulated`)}
    />
  );
};

export default PeopleView;
