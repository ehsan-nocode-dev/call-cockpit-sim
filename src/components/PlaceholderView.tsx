import React from 'react';
import { Building2, Megaphone, Target, Upload } from 'lucide-react';

const placeholders: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
  companies: { icon: <Building2 className="w-8 h-8" />, title: 'Companies', desc: 'Company management view — coming soon.' },
  campaigns: { icon: <Megaphone className="w-8 h-8" />, title: 'Campaigns', desc: 'Campaign management view — coming soon.' },
  opportunities: { icon: <Target className="w-8 h-8" />, title: 'Opportunities', desc: 'Opportunity tracking view — coming soon.' },
  import: { icon: <Upload className="w-8 h-8" />, title: 'Import', desc: 'Data import interface — coming soon.' },
};

const PlaceholderView: React.FC<{ viewId: string }> = ({ viewId }) => {
  const p = placeholders[viewId] || { icon: null, title: viewId, desc: 'Coming soon.' };
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <div className="text-muted-foreground mx-auto">{p.icon}</div>
        <h2 className="text-lg font-semibold text-foreground">{p.title}</h2>
        <p className="text-sm text-muted-foreground">{p.desc}</p>
      </div>
    </div>
  );
};

export default PlaceholderView;
