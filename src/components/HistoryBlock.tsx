import React, { useState } from 'react';
import { format } from 'date-fns';
import { Phone, Clock, Mail, FileText, RefreshCw, User, Maximize2, Minimize2 } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="w-3 h-3" />,
  time: <Clock className="w-3 h-3" />,
  email: <Mail className="w-3 h-3" />,
  note: <FileText className="w-3 h-3" />,
  status: <RefreshCw className="w-3 h-3" />,
  'dm-change': <User className="w-3 h-3" />,
};

const typeColors: Record<string, string> = {
  call: 'text-primary',
  time: 'text-muted-foreground',
  email: 'text-accent',
  note: 'text-foreground',
  status: 'text-primary',
  'dm-change': 'text-primary',
};

const HistoryBlock: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { companies, role } = useAppState();
  const [expanded, setExpanded] = useState(false);
  const company = companies.find(c => c.id === companyId);
  if (!company) return null;

  const isAdmin = role === 'admin';
  const entries = isAdmin
    ? company.history
    : company.history.filter(h => h.type !== 'call');

  if (expanded) {
    return (
      <div className="fixed inset-4 z-50 flex flex-col bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">History ({entries.length})</span>
          <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground p-1">
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-1.5">
          {entries.map(entry => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cockpit-section">
      <div className="flex items-center justify-between">
        <div className="cockpit-label mb-0">History ({entries.length})</div>
        <button onClick={() => setExpanded(true)} className="text-muted-foreground hover:text-foreground p-0.5">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-0.5 max-h-40 overflow-auto mt-1">
        {entries.length === 0 && (
          <div className="text-xs text-muted-foreground py-2">No history entries yet.</div>
        )}
        {entries.map(entry => (
          <HistoryEntryCompact key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
};

const HistoryEntryCompact: React.FC<{ entry: { id: string; timestamp: Date; type: string; content: string; user: string } }> = ({ entry }) => (
  <div className="flex items-center gap-1.5 py-0.5 text-xs border-b border-border/30 last:border-0">
    <span className={`${typeColors[entry.type]} flex-shrink-0`}>{typeIcons[entry.type]}</span>
    <span className="text-muted-foreground font-mono text-[10px] flex-shrink-0">{format(entry.timestamp, 'dd.MM HH:mm')}</span>
    <span className="text-foreground truncate flex-1">{entry.content}</span>
  </div>
);

const HistoryEntry: React.FC<{ entry: { id: string; timestamp: Date; type: string; content: string; user: string } }> = ({ entry }) => (
  <div className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
    <div className={`mt-0.5 ${typeColors[entry.type]}`}>{typeIcons[entry.type]}</div>
    <div className="flex-1 min-w-0">
      <div className="text-xs text-foreground whitespace-pre-wrap">{entry.content}</div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {format(entry.timestamp, 'dd.MM.yyyy HH:mm')} · {entry.user}
      </div>
    </div>
    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
      entry.type === 'call' ? 'bg-primary/10 text-primary' :
      entry.type === 'email' ? 'bg-accent/10 text-accent' :
      'bg-surface-2 text-muted-foreground'
    }`}>
      {entry.type}
    </span>
  </div>
);

export default HistoryBlock;
