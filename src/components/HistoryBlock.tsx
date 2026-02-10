import React from 'react';
import { format } from 'date-fns';
import { Phone, Clock, Mail, FileText, RefreshCw, User } from 'lucide-react';
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
  const company = companies.find(c => c.id === companyId);
  if (!company) return null;

  const isAdmin = role === 'admin';

  // Filter call entries for assistant
  const entries = isAdmin
    ? company.history
    : company.history.filter(h => h.type !== 'call');

  return (
    <div className="cockpit-section">
      <div className="cockpit-label">History ({entries.length})</div>
      <div className="space-y-1 max-h-96 overflow-auto">
        {entries.length === 0 && (
          <div className="text-xs text-muted-foreground py-2">No history entries yet.</div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
            <div className={`mt-0.5 ${typeColors[entry.type]}`}>
              {typeIcons[entry.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-foreground">{entry.content}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {format(entry.timestamp, 'dd.MM.yyyy HH:mm')} · {entry.user}
              </div>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              entry.type === 'call' ? 'bg-primary/10 text-primary' :
              entry.type === 'email' ? 'bg-accent/10 text-accent' :
              'bg-surface-2 text-muted-foreground'
            }`}>
              {entry.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryBlock;
