import React, { useState } from 'react';
import DataTable, { Column } from '@/components/DataTable';
import { useAppState } from '@/context/AppContext';
import { Company, statusList, statusColorClass, campaigns } from '@/data/mockData';

const CompaniesView: React.FC = () => {
  const { companies, updateCompany, role } = useAppState();
  const isAdmin = role === 'admin';

  const columns: Column<Company>[] = [
    { key: 'companyPriority', label: 'Priority', sortable: true, filterable: true, filterOptions: ['A', 'B', 'C', 'D', 'E'],
      render: (r) => <span className={`priority-badge priority-${r.companyPriority.toLowerCase()}`}>{r.companyPriority}</span> },
    { key: 'name', label: 'Company', sortable: true,
      render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: 'city', label: 'City', sortable: true },
    { key: 'country', label: 'Country', sortable: true, filterable: true, filterOptions: [...new Set(companies.map(c => c.country))] },
    { key: 'status', label: 'Status', sortable: true, filterable: true, filterOptions: [...statusList],
      render: (r) => (
        <span className={`status-pill ${statusColorClass[r.status]}`}>
          {r.status}{r.statusSpec ? ` · ${r.statusSpec}` : ''}
        </span>
      ) },
    { key: 'revenue', label: 'Revenue', sortable: true },
    { key: 'ebitda', label: 'EBITDA', sortable: true, defaultVisible: false },
    { key: 'employees', label: 'FTE', sortable: true },
    { key: 'campaignId', label: 'Campaign', sortable: true, filterable: true,
      filterOptions: campaigns.map(c => c.name),
      getValue: (r) => campaigns.find(c => c.id === r.campaignId)?.name || '',
      render: (r) => <span className="text-muted-foreground text-xs">{campaigns.find(c => c.id === r.campaignId)?.name || '—'}</span> },
    { key: 'website', label: 'Website', defaultVisible: false,
      render: (r) => <a href={`https://${r.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{r.website}</a> },
    { key: 'centralPhone', label: 'Phone', defaultVisible: false },
    { key: 'tags', label: 'Tags', defaultVisible: false,
      getValue: (r) => r.tags.join(', '),
      render: (r) => <div className="flex flex-wrap gap-0.5">{r.tags.map(t => <span key={t} className="px-1 py-0.5 text-[10px] rounded bg-surface-2 text-muted-foreground" style={{background:'hsl(var(--surface-2))'}}>{t}</span>)}</div> },
    { key: 'decisionMaker', label: 'Decision Maker', defaultVisible: false,
      getValue: (r) => `${r.decisionMaker.firstName} ${r.decisionMaker.lastName}`,
      render: (r) => <span className="text-xs">{r.decisionMaker.title} {r.decisionMaker.firstName} {r.decisionMaker.lastName}</span> },
  ];

  const handleDelete = (id: string) => {
    // In simulation, we can't truly delete from context easily, but we show the capability
    alert(`Delete company ${id} — simulated`);
  };

  const handleEdit = (row: Company) => {
    alert(`Edit company "${row.name}" — simulated. Use Call Cockpit for full editing.`);
  };

  const handleAdd = () => {
    alert('Add new company — simulated');
  };

  return (
    <DataTable
      data={companies}
      columns={columns}
      idKey="id"
      title="Companies"
      isAdmin={isAdmin}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default CompaniesView;
