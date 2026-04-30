import React, { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check, Download, Upload, Lock, FileSpreadsheet, AlertTriangle, AlertCircle,
  CheckCircle2, ArrowLeft, Loader2, X,
} from 'lucide-react';
import {
  COMPANY_TEMPLATE_COLUMNS, PERSON_TEMPLATE_COLUMNS, COMPANY_REQUIRED, PERSON_REQUIRED,
  EXISTING_DOMAINS, SAMPLE_COMPANY_CSV, SAMPLE_PERSON_CSV,
} from './sampleCsv';
import { parseCsv, extractDomain, downloadTemplate } from './csvUtils';

export type ImportEntity = 'company' | 'person';

interface ImportFlowProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entity: ImportEntity;
  campaignName?: string; // when set → campaign-scoped flow
  onComplete?: () => void;
  onNavigateCompanies?: () => void;
}

type StepId = 'template' | 'upload' | 'preview' | 'confirm' | 'success';

const ImportFlow: React.FC<ImportFlowProps> = ({
  open, onOpenChange, entity, campaignName, onComplete, onNavigateCompanies,
}) => {
  const isCampaignScoped = !!campaignName;
  const isCompany = entity === 'company';
  const requiredCols = isCompany ? COMPANY_REQUIRED : PERSON_REQUIRED;
  const templateCols = isCompany ? COMPANY_TEMPLATE_COLUMNS : PERSON_TEMPLATE_COLUMNS;
  const sampleCsv = isCompany ? SAMPLE_COMPANY_CSV : SAMPLE_PERSON_CSV;

  const initialStep: StepId = isCampaignScoped ? 'upload' : 'template';
  const [step, setStep] = useState<StepId>(initialStep);
  const [maxStepReached, setMaxStepReached] = useState<StepId>(initialStep);

  // Upload state
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [parsing, setParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [missingCols, setMissingCols] = useState<string[] | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);

  // Confirm/import state
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulateError, setSimulateError] = useState(false);
  const [importError, setImportError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef(false);

  const reset = (toStep: StepId = initialStep) => {
    setStep(toStep);
    setMaxStepReached(toStep);
    setFileName(null); setFileSize(0); setParsing(false);
    setUploadError(null); setMissingCols(null);
    setParsedHeaders([]); setParsedRows([]);
    setImporting(false); setProgress(0); setImportError(false);
  };

  const goTo = (s: StepId) => {
    setStep(s);
    const order: StepId[] = ['template', 'upload', 'preview', 'confirm', 'success'];
    if (order.indexOf(s) > order.indexOf(maxStepReached)) setMaxStepReached(s);
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
    goTo('preview');
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
            setImporting(false); goTo('success');
          }
        }, 200);
      }
    };
    requestAnimationFrame(tick);
  };

  // ---- Stepper config ----
  const steps: { id: StepId; label: string }[] = isCampaignScoped
    ? [
        { id: 'upload', label: 'Upload' },
        { id: 'preview', label: 'Preview' },
        { id: 'confirm', label: 'Confirm' },
      ]
    : [
        { id: 'template', label: 'Template' },
        { id: 'upload', label: 'Upload' },
        { id: 'preview', label: 'Preview' },
        { id: 'confirm', label: 'Confirm' },
      ];

  const stepIndex = steps.findIndex(s => s.id === step);
  const maxIndex = steps.findIndex(s => s.id === maxStepReached);

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
        {step !== 'success' && (
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            {steps.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              const reachable = i <= maxIndex;
              return (
                <React.Fragment key={s.id}>
                  <button
                    disabled={!reachable || active}
                    onClick={() => reachable && goTo(s.id)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
                      active ? 'text-foreground font-semibold' :
                      done ? 'text-primary hover:bg-accent/30' :
                      'text-muted-foreground'
                    } ${reachable && !active ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                      done ? 'bg-primary text-primary-foreground' :
                      active ? 'bg-primary/20 text-primary border border-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {done ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    {s.label}
                  </button>
                  {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="overflow-auto px-5 py-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {step === 'template' && (
            <TemplateStep
              isCompany={isCompany}
              templateCols={templateCols}
              onDownload={() => downloadTemplate(`${entity}-import-template.csv`, templateCols)}
              onNext={() => goTo('upload')}
            />
          )}

          {step === 'upload' && (
            <UploadStep
              fileName={fileName} fileSize={fileSize} parsing={parsing}
              uploadError={uploadError} missingCols={missingCols}
              dragRef={dragRef} fileInputRef={fileInputRef}
              onFile={handleFile} onDrop={onDrop} onLoadSample={loadSample}
              onBack={isCampaignScoped ? null : () => goTo('template')}
              onRetry={() => { setMissingCols(null); setFileName(null); setUploadError(null); }}
            />
          )}

          {step === 'preview' && (
            <PreviewStep
              isCompany={isCompany} headers={parsedHeaders} rows={rowsWithStatus}
              dupCount={dupCount} newCount={newCount} allDuplicates={allDuplicates}
              campaignName={campaignName}
              onBack={() => goTo('upload')}
              onNext={() => goTo('confirm')}
            />
          )}

          {step === 'confirm' && (
            <ConfirmStep
              isCompany={isCompany} newCount={newCount} dupCount={dupCount}
              campaignName={campaignName} importing={importing} progress={progress}
              importError={importError} simulateError={simulateError}
              setSimulateError={setSimulateError}
              onBack={() => goTo('preview')}
              onConfirm={startImport}
              onRetry={() => { setImportError(false); setSimulateError(false); }}
            />
          )}

          {step === 'success' && (
            <SuccessStep
              isCompany={isCompany} newCount={newCount} dupCount={dupCount}
              campaignName={campaignName}
              onAnother={() => reset(initialStep)}
              onView={() => { onOpenChange(false); reset(); onComplete?.(); onNavigateCompanies?.(); }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =================== Step components ===================

const TemplateStep: React.FC<{
  isCompany: boolean; templateCols: string[];
  onDownload: () => void; onNext: () => void;
}> = ({ isCompany, templateCols, onDownload, onNext }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1">Step 1 — Download CSV Template</h3>
      <p className="text-xs text-muted-foreground">
        Download the CSV template, fill it in, then continue to upload. The template
        contains every column the importer recognises.
      </p>
    </div>

    <div className="rounded-md border border-border p-4" style={{ background: 'hsl(var(--surface-2))' }}>
      <div className="flex items-center gap-3 mb-3">
        <FileSpreadsheet className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">
            {isCompany ? 'Companies' : 'Persons'} template
          </div>
          <div className="text-xs text-muted-foreground">{templateCols.length} columns</div>
        </div>
        <Button size="sm" onClick={onDownload} className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Download CSV Template
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {templateCols.map(c => (
          <span key={c} className="text-[11px] px-2 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border">{c}</span>
        ))}
      </div>
    </div>

    <div className="flex justify-end">
      <Button onClick={onNext} size="sm">Continue to Upload</Button>
    </div>
  </div>
);

const UploadStep: React.FC<{
  fileName: string | null; fileSize: number; parsing: boolean;
  uploadError: string | null; missingCols: string[] | null;
  dragRef: React.MutableRefObject<boolean>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFile: (f: File) => void; onDrop: (e: React.DragEvent) => void;
  onLoadSample: () => void;
  onBack: (() => void) | null; onRetry: () => void;
}> = ({ fileName, fileSize, parsing, uploadError, missingCols, dragRef, fileInputRef, onFile, onDrop, onLoadSample, onBack, onRetry }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1">Upload CSV</h3>
      <p className="text-xs text-muted-foreground">Drag &amp; drop your file or click to browse. Only .csv files are accepted.</p>
    </div>

    <div
      onDragOver={(e) => { e.preventDefault(); dragRef.current = true; }}
      onDragLeave={() => { dragRef.current = false; }}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
      style={{ background: 'hsl(var(--surface-2))' }}
    >
      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <div className="text-sm text-foreground">Drop your CSV here or <span className="text-primary underline">browse</span></div>
      <div className="text-xs text-muted-foreground mt-1">.csv files only</div>
      <input
        ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
    </div>

    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={onLoadSample}>Load Sample Data</Button>
      {fileName && !parsing && !missingCols && !uploadError && (
        <div className="text-xs text-muted-foreground">{fileName} • {(fileSize / 1024).toFixed(1)} KB</div>
      )}
    </div>

    {uploadError && (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Wrong file type</AlertTitle>
        <AlertDescription>{uploadError}</AlertDescription>
      </Alert>
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

    <div className="flex justify-between">
      {onBack ? <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back</Button> : <div />}
    </div>
  </div>
);

const PreviewStep: React.FC<{
  isCompany: boolean;
  headers: string[];
  rows: { row: Record<string, string>; domain: string; isDuplicate: boolean }[];
  dupCount: number; newCount: number; allDuplicates: boolean;
  campaignName?: string;
  onBack: () => void; onNext: () => void;
}> = ({ isCompany, headers, rows, dupCount, newCount, allDuplicates, campaignName, onBack, onNext }) => {
  const firstCol = isCompany ? 'Company Name' : 'First Name';
  const otherHeaders = headers.filter(h => h !== firstCol);

  return (
    <div className="space-y-3">
      {allDuplicates ? (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>No new records to import</AlertTitle>
          <AlertDescription>All rows match existing companies.</AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle2 className="w-4 h-4" />
          <AlertTitle>{rows.length} rows detected</AlertTitle>
          <AlertDescription>
            {newCount} will be imported, {dupCount} duplicate{dupCount === 1 ? '' : 's'} will be skipped.
          </AlertDescription>
        </Alert>
      )}

      {campaignName && newCount > 0 && (
        <div className="text-xs text-muted-foreground border border-border rounded-md px-3 py-2" style={{ background: 'hsl(var(--surface-2))' }}>
          Assignments will be created for all new companies under campaign <span className="text-foreground font-medium">{campaignName}</span>.
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

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back</Button>
        <Button size="sm" onClick={onNext} disabled={allDuplicates}>Continue</Button>
      </div>
    </div>
  );
};

const ConfirmStep: React.FC<{
  isCompany: boolean; newCount: number; dupCount: number;
  campaignName?: string; importing: boolean; progress: number;
  importError: boolean; simulateError: boolean;
  setSimulateError: (v: boolean) => void;
  onBack: () => void; onConfirm: () => void; onRetry: () => void;
}> = ({ isCompany, newCount, dupCount, campaignName, importing, progress, importError, simulateError, setSimulateError, onBack, onConfirm, onRetry }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-foreground">Confirm Import</h3>

    <div className="rounded-md border border-border p-4 space-y-2" style={{ background: 'hsl(var(--surface-2))' }}>
      <Row label={`Records to import`} value={String(newCount)} highlight />
      <Row label="Duplicates skipped" value={String(dupCount)} />
      {campaignName && <Row label="Campaign" value={campaignName} />}
      <Row label="Type" value={isCompany ? 'Companies' : 'Persons'} />
    </div>

    {newCount === 0 && (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertTitle>Nothing to import</AlertTitle>
        <AlertDescription>All rows are duplicates — go back and upload a different file.</AlertDescription>
      </Alert>
    )}

    {importError && (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Import failed</AlertTitle>
        <AlertDescription>
          Please try again.
          <Button variant="link" className="px-1 h-auto text-xs" onClick={onRetry}>Reset</Button>
        </AlertDescription>
      </Alert>
    )}

    {importing && (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing… {Math.round(progress)}%
        </div>
        <Progress value={progress} />
      </div>
    )}

    <div className="flex items-center justify-between pt-1">
      <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 cursor-pointer select-none">
        <input
          type="checkbox" checked={simulateError} onChange={e => setSimulateError(e.target.checked)}
          style={{ accentColor: 'hsl(var(--primary))' }}
        />
        dev: simulate error
      </label>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onBack} disabled={importing}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
        <Button size="sm" onClick={onConfirm} disabled={importing || newCount === 0}>
          {importing ? 'Importing…' : 'Confirm Import'}
        </Button>
      </div>
    </div>
  </div>
);

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className={highlight ? 'text-primary font-semibold text-sm' : 'text-foreground'}>{value}</span>
  </div>
);

const SuccessStep: React.FC<{
  isCompany: boolean; newCount: number; dupCount: number; campaignName?: string;
  onAnother: () => void; onView: () => void;
}> = ({ isCompany, newCount, dupCount, campaignName, onAnother, onView }) => (
  <div className="py-8 flex flex-col items-center text-center space-y-4">
    <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
      <CheckCircle2 className="w-9 h-9 text-green-400" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-foreground">Import Complete</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {newCount} {isCompany ? 'companies' : 'persons'} imported successfully. {dupCount} duplicate{dupCount === 1 ? '' : 's'} were skipped.
      </p>
      {campaignName && (
        <p className="text-sm text-muted-foreground mt-1">
          {newCount} campaign assignment{newCount === 1 ? '' : 's'} created under <span className="text-foreground font-medium">{campaignName}</span>.
        </p>
      )}
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onAnother}>Import Another File</Button>
      <Button size="sm" onClick={onView}>View {isCompany ? 'Companies' : 'People'}</Button>
    </div>
  </div>
);

export default ImportFlow;
