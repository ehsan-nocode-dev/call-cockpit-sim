import React, { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check, Upload, Lock, AlertTriangle, AlertCircle,
  CheckCircle2, Loader2, X,
} from 'lucide-react';
import {
  COMPANY_REQUIRED, PERSON_REQUIRED,
  EXISTING_DOMAINS, SAMPLE_COMPANY_CSV, SAMPLE_PERSON_CSV,
} from './sampleCsv';
import { parseCsv, extractDomain } from './csvUtils';

export type ImportEntity = 'company' | 'person';

interface ImportFlowProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entity: ImportEntity;
  campaignName?: string; // when set → campaign-scoped flow
  onComplete?: () => void;
  onNavigateCompanies?: () => void;
}

type StepId = 'upload' | 'preview' | 'done';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'preview', label: 'Preview' },
  { id: 'done', label: 'Done' },
];

const ImportFlow: React.FC<ImportFlowProps> = ({
  open, onOpenChange, entity, campaignName, onComplete, onNavigateCompanies,
}) => {
  const isCampaignScoped = !!campaignName;
  const isCompany = entity === 'company';
  const requiredCols = isCompany ? COMPANY_REQUIRED : PERSON_REQUIRED;
  const sampleCsv = isCompany ? SAMPLE_COMPANY_CSV : SAMPLE_PERSON_CSV;

  const [step, setStep] = useState<StepId>('upload');

  // Upload state
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [parsing, setParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [missingCols, setMissingCols] = useState<string[] | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);

  // Import / done state
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulateError, setSimulateError] = useState(false);
  const [importError, setImportError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef(false);

  const reset = () => {
    setStep('upload');
    setFileName(null); setFileSize(0); setParsing(false);
    setUploadError(null); setMissingCols(null);
    setParsedHeaders([]); setParsedRows([]);
    setImporting(false); setProgress(0); setImportError(false);
  };

  // ---- Duplicate detection ----
  const rowsWithStatus = useMemo(() => {
    return parsedRows.map(r => {
      const domainSrc = isCompany ? r['Website/Domain'] : r['Company Website'];
      const domain = extractDomain(domainSrc || '');
      const isDuplicate = !!domain && EXISTING_DOMAINS.includes(domain);
      return { row: r, domain, isDuplicate };
    });
  }, [parsedRows, isCompany]);

  const dupCount = rowsWithStatus.filter(r => r.isDuplicate).length;
  const newCount = rowsWithStatus.length - dupCount;
  const allDuplicates = rowsWithStatus.length > 0 && newCount === 0;

  // ---- File handling ----
  const handleFile = (file: File) => {
    setUploadError(null);
    setMissingCols(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only .csv files are accepted.');
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);
    setParsing(true);
    file.text().then(text => {
      setTimeout(() => processCsvText(text), 1500);
    });
  };

  const processCsvText = (text: string) => {
    const { headers, rows } = parseCsv(text);
    const missing = requiredCols.filter(c => !headers.includes(c));
    setParsing(false);
    if (missing.length > 0) {
      setMissingCols(missing);
      setParsedHeaders(headers);
      setParsedRows([]);
      return;
    }
    setParsedHeaders(headers);
    setParsedRows(rows);
    setStep('preview');
  };

  const loadSample = () => {
    setUploadError(null); setMissingCols(null);
    setFileName(`sample-${entity}-import.csv`);
    setFileSize(sampleCsv.length);
    setParsing(true);
    setTimeout(() => processCsvText(sampleCsv), 1500);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); dragRef.current = false;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // ---- Confirm import ----
  const startImport = () => {
    setImporting(true);
    setProgress(0);
    setImportError(false);
    setStep('done');
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / 2500) * 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          if (simulateError) {
            setImporting(false); setImportError(true);
          } else {
            setImporting(false);
            onComplete?.();
          }
        }, 200);
      }
    };
    requestAnimationFrame(tick);
  };

  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent
        className="max-w-5xl w-[95vw] p-0 gap-0 overflow-hidden"
        style={{ background: 'hsl(var(--surface-1))', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Import {isCompany ? 'Companies' : 'Persons'}
            </h2>
            {isCampaignScoped && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Lock className="w-3 h-3" />
                Campaign: <span className="text-foreground font-medium">{campaignName}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => { reset(); onOpenChange(false); }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                    active ? 'text-foreground font-semibold' :
                    done ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                    done ? 'bg-primary text-primary-foreground' :
                    active ? 'bg-primary/20 text-primary border border-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {done ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  {s.label}
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Body */}
        <div className="overflow-auto px-5 py-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {step === 'upload' && (
            <UploadStep
              fileName={fileName} fileSize={fileSize} parsing={parsing}
              uploadError={uploadError} missingCols={missingCols}
              dragRef={dragRef} fileInputRef={fileInputRef}
              onFile={handleFile} onDrop={onDrop} onLoadSample={loadSample}
              onRetry={() => { setMissingCols(null); setFileName(null); setUploadError(null); }}
            />
          )}

          {step === 'preview' && (
            <PreviewStep
              isCompany={isCompany} headers={parsedHeaders} rows={rowsWithStatus}
              dupCount={dupCount} newCount={newCount} allDuplicates={allDuplicates}
              campaignName={campaignName}
              simulateError={simulateError} setSimulateError={setSimulateError}
              onConfirm={startImport}
            />
          )}

          {step === 'done' && (
            <DoneStep
              isCompany={isCompany} newCount={newCount}
              campaignName={campaignName}
              importing={importing} progress={progress}
              importError={importError}
              onAnother={reset}
              onView={() => { onOpenChange(false); reset(); onNavigateCompanies?.(); }}
              onRetry={() => { reset(); }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =================== Step components ===================

const UploadStep: React.FC<{
  fileName: string | null; fileSize: number; parsing: boolean;
  uploadError: string | null; missingCols: string[] | null;
  dragRef: React.MutableRefObject<boolean>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFile: (f: File) => void; onDrop: (e: React.DragEvent) => void;
  onLoadSample: () => void;
  onRetry: () => void;
}> = ({ fileName, fileSize, parsing, uploadError, missingCols, dragRef, fileInputRef, onFile, onDrop, onLoadSample, onRetry }) => (
  <div className="space-y-4">
    <div
      onDragOver={(e) => { e.preventDefault(); dragRef.current = true; }}
      onDragLeave={() => { dragRef.current = false; }}
      onDrop={onDrop}
      className="border-2 border-dashed border-border rounded-lg p-10 text-center transition-colors hover:border-primary/60"
      style={{ background: 'hsl(var(--surface-2))' }}
    >
      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <div className="text-sm text-foreground mb-1">Drag &amp; drop your CSV file here</div>
      <div className="text-xs text-muted-foreground mb-4">.csv files only</div>
      <Button size="sm" onClick={() => fileInputRef.current?.click()}>Browse</Button>
      <input
        ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
    </div>

    {uploadError && (
      <div className="text-xs text-destructive flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
      </div>
    )}

    {parsing && (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Parsing {fileName}…
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    )}

    {missingCols && missingCols.length > 0 && (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertTitle>Required columns are missing</AlertTitle>
        <AlertDescription>
          {missingCols.join(', ')}.
          <Button variant="link" className="px-1 h-auto text-xs" onClick={onRetry}>Try another file</Button>
        </AlertDescription>
      </Alert>
    )}

    <div className="flex items-center justify-between pt-1">
      <button
        onClick={onLoadSample}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        Load Sample Data
      </button>
      {fileName && !parsing && !missingCols && !uploadError && (
        <div className="text-xs text-muted-foreground">{fileName} • {(fileSize / 1024).toFixed(1)} KB</div>
      )}
    </div>
  </div>
);

const PreviewStep: React.FC<{
  isCompany: boolean;
  headers: string[];
  rows: { row: Record<string, string>; domain: string; isDuplicate: boolean }[];
  dupCount: number; newCount: number; allDuplicates: boolean;
  campaignName?: string;
  simulateError: boolean; setSimulateError: (v: boolean) => void;
  onConfirm: () => void;
}> = ({ isCompany, headers, rows, dupCount, newCount, allDuplicates, campaignName, simulateError, setSimulateError, onConfirm }) => {
  const firstCol = isCompany ? 'Company Name' : 'First Name';
  const otherHeaders = headers.filter(h => h !== firstCol);

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        {newCount} new · {dupCount} duplicate{dupCount === 1 ? '' : 's'} will be skipped
      </div>

      {campaignName && newCount > 0 && (
        <div className="text-xs text-muted-foreground">
          Assignments will be created for all new companies under <span className="text-foreground font-medium">{campaignName}</span>.
        </div>
      )}

      <div className="border border-border rounded-md overflow-hidden">
        <div className="overflow-auto max-h-[420px] relative">
          <table className="text-xs w-full border-collapse">
            <thead className="sticky top-0 z-10" style={{ background: 'hsl(var(--surface-2))' }}>
              <tr>
                <th className="sticky left-0 z-20 px-2 py-1.5 text-left font-medium text-muted-foreground border-b border-r border-border whitespace-nowrap"
                    style={{ background: 'hsl(var(--surface-2))' }}>
                  {firstCol}
                </th>
                {otherHeaders.map(h => (
                  <th key={h} className="px-2 py-1.5 text-left font-medium text-muted-foreground border-b border-border whitespace-nowrap">{h}</th>
                ))}
                <th className="sticky right-0 z-20 px-2 py-1.5 text-left font-medium text-muted-foreground border-b border-l border-border whitespace-nowrap"
                    style={{ background: 'hsl(var(--surface-2))' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={r.isDuplicate ? 'bg-amber-500/10' : 'hover:bg-accent/10'}>
                  <td className="sticky left-0 z-10 px-2 py-1 text-foreground font-medium border-b border-r border-border whitespace-nowrap"
                      style={{ background: r.isDuplicate ? 'hsl(45 90% 50% / 0.10)' : 'hsl(var(--surface-1))' }}>
                    {r.row[firstCol] || '—'}
                  </td>
                  {otherHeaders.map(h => (
                    <td key={h} className="px-2 py-1 text-muted-foreground border-b border-border whitespace-nowrap max-w-[200px] truncate" title={r.row[h]}>
                      {r.row[h] || '—'}
                    </td>
                  ))}
                  <td className="sticky right-0 z-10 px-2 py-1 border-b border-l border-border whitespace-nowrap"
                      style={{ background: r.isDuplicate ? 'hsl(45 90% 50% / 0.10)' : 'hsl(var(--surface-1))' }}>
                    {r.isDuplicate ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-400">Duplicate</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-green-500/15 text-green-400">New</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {allDuplicates && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>No new records to import</AlertTitle>
          <AlertDescription>All rows match existing companies.</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 cursor-pointer select-none">
          <input
            type="checkbox" checked={simulateError} onChange={e => setSimulateError(e.target.checked)}
            style={{ accentColor: 'hsl(var(--primary))' }}
          />
          Simulate Error
        </label>
        <Button size="sm" onClick={onConfirm} disabled={newCount === 0}>
          Confirm Import
        </Button>
      </div>
    </div>
  );
};

const DoneStep: React.FC<{
  isCompany: boolean; newCount: number; campaignName?: string;
  importing: boolean; progress: number; importError: boolean;
  onAnother: () => void; onView: () => void; onRetry: () => void;
}> = ({ isCompany, newCount, campaignName, importing, progress, importError, onAnother, onView, onRetry }) => {
  if (importing) {
    return (
      <div className="space-y-3 py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing… {Math.round(progress)}%
        </div>
        <Progress value={progress} />
      </div>
    );
  }

  if (importError) {
    return (
      <div className="space-y-3 py-2">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Import failed</AlertTitle>
          <AlertDescription>Please try again.</AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button size="sm" onClick={onRetry}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 flex flex-col items-center text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-green-400" />
      </div>
      <div className="space-y-1">
        <div className="text-sm text-foreground font-medium">
          {newCount} {isCompany ? 'companies' : 'persons'} imported.
        </div>
        {campaignName && (
          <div className="text-xs text-muted-foreground">
            {newCount} assignment{newCount === 1 ? '' : 's'} created under <span className="text-foreground">{campaignName}</span>.
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs pt-1">
        <button onClick={onAnother} className="text-primary hover:underline">Import another file</button>
        <span className="text-muted-foreground">·</span>
        <button onClick={onView} className="text-primary hover:underline">View Companies</button>
      </div>
    </div>
  );
};

export default ImportFlow;
