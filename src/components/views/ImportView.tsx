import React, { useState } from 'react';
import { Building2, Contact, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportFlow, { ImportEntity } from '@/components/import/ImportFlow';

interface ImportViewProps {
  onNavigate?: (view: string) => void;
}

const ImportView: React.FC<ImportViewProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [entity, setEntity] = useState<ImportEntity>('company');

  const start = (e: ImportEntity) => { setEntity(e); setOpen(true); };

  return (
    <div className="h-full overflow-auto w-full">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Import
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Bulk-import companies and persons from CSV files. Duplicates are detected automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            icon={<Building2 className="w-5 h-5 text-primary" />}
            title="Import Companies"
            desc="Upload a CSV to import company records. Duplicate domains will be detected and skipped."
            onClick={() => start('company')}
          />
          <Card
            icon={<Contact className="w-5 h-5 text-primary" />}
            title="Import Persons"
            desc="Upload a CSV to import person records. Companies must already exist in the system."
            onClick={() => start('person')}
          />
        </div>
      </div>

      <ImportFlow
        open={open}
        onOpenChange={setOpen}
        entity={entity}
        onNavigateCompanies={() => onNavigate?.(entity === 'company' ? 'companies' : 'people')}
      />
    </div>
  );
};

const Card: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick: () => void }> = ({ icon, title, desc, onClick }) => (
  <div
    className="rounded-lg border border-border p-5 flex flex-col gap-3"
    style={{ background: 'hsl(var(--surface-1))' }}
  >
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
    <p className="text-xs text-muted-foreground flex-1">{desc}</p>
    <Button size="sm" onClick={onClick} className="self-start gap-1.5">
      <Upload className="w-3.5 h-3.5" /> Start Import
    </Button>
  </div>
);

export default ImportView;
