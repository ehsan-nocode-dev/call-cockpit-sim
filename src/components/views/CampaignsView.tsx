import React from 'react';
import DataTable, { Column } from '@/components/DataTable';
import { useAppState } from '@/context/AppContext';
import { campaigns, Campaign } from '@/data/mockData';

const CampaignsView: React.FC = () => {
  const { companies, role } = useAppState();
  const isAdmin = role === 'admin';

  const enriched = campaigns.map(c => ({
    ...c,
    companyCount: companies.filter(co => co.campaignId === c.id).length,
  }));

  type EnrichedCampaign = typeof enriched[number];

  const columns: Column<EnrichedCampaign>[] = [
    { key: 'name', label: 'Campaign Name', sortable: true,
      render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: 'companyCount', label: 'Companies', sortable: true,
      render: (r) => <span className="text-xs font-mono text-primary">{r.companyCount}</span> },
    { key: 'pitchText', label: 'Pitch Summary', sortable: false,
      render: (r) => <span className="text-xs text-muted-foreground truncate max-w-xs block">{r.pitchText.slice(0, 80)}…</span> },
    { key: 'pitchLink', label: 'Pitch Link', defaultVisible: false,
      render: (r) => <a href={r.pitchLink} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{r.pitchLink}</a> },
  ];

  return (
    <DataTable
      data={enriched}
      columns={columns}
      idKey="id"
      title="Campaigns"
      isAdmin={isAdmin}
      onAdd={() => alert('Add campaign — simulated')}
      onEdit={(r) => alert(`Edit campaign "${r.name}" — simulated`)}
      onDelete={(id) => alert(`Delete campaign ${id} — simulated`)}
    />
  );
};

export default CampaignsView;
