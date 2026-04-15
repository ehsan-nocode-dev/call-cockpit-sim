import React from 'react';
import DataTable, { Column } from '@/components/DataTable';
import { useAppState } from '@/context/AppContext';
import { opportunities, opportunityStages, Opportunity } from '@/data/additionalMockData';

const stageColor: Record<string, string> = {
  'Qualification': 'status-offen',
  'Discovery': 'status-diskussion',
  'Proposal': 'status-opportunity',
  'Negotiation': 'status-terminierung',
  'Due Diligence': 'status-nda',
  'Closing': 'status-loi',
  'Won': 'status-deal',
  'Lost': 'status-kein-interesse',
};

const OpportunitiesView: React.FC = () => {
  const { role } = useAppState();
  const isAdmin = role === 'admin';

  const columns: Column<Opportunity>[] = [
    { key: 'companyName', label: 'Company', sortable: true,
      render: (r) => <span className="font-medium text-foreground">{r.companyName}</span> },
    { key: 'contactName', label: 'Contact', sortable: true },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'stage', label: 'Stage', sortable: true, filterable: true, filterOptions: opportunityStages,
      render: (r) => <span className={`status-pill ${stageColor[r.stage] || 'status-offen'}`}>{r.stage}</span> },
    { key: 'probability', label: 'Probability', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1">
          <div className="w-12 h-1.5 rounded-full bg-surface-2" style={{background:'hsl(var(--surface-2))'}}>
            <div className="h-full rounded-full" style={{ width: `${r.probability}%`, background: 'hsl(var(--primary))' }} />
          </div>
          <span className="text-xs font-mono">{r.probability}%</span>
        </div>
      ) },
    { key: 'campaignName', label: 'Campaign', sortable: true, filterable: true,
      filterOptions: [...new Set(opportunities.map(o => o.campaignName))] },
    { key: 'assignedTo', label: 'Assigned To', sortable: true, filterable: true,
      filterOptions: [...new Set(opportunities.map(o => o.assignedTo))] },
    { key: 'expectedClose', label: 'Expected Close', sortable: true },
    { key: 'notes', label: 'Notes', defaultVisible: false,
      render: (r) => <span className="text-xs text-muted-foreground truncate max-w-xs block">{r.notes}</span> },
    { key: 'createdAt', label: 'Created', sortable: true, defaultVisible: false },
  ];

  return (
    <DataTable
      data={opportunities}
      columns={columns}
      idKey="id"
      title="Opportunities"
      isAdmin={isAdmin}
      onAdd={() => alert('Add opportunity — simulated')}
      onEdit={(r) => alert(`Edit opportunity for "${r.companyName}" — simulated`)}
      onDelete={(id) => alert(`Delete opportunity ${id} — simulated`)}
    />
  );
};

export default OpportunitiesView;
