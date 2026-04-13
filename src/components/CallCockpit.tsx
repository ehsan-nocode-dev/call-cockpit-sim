import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, addMinutes, addHours, setHours, setMinutes } from 'date-fns';
import { ExternalLink, Plus, User, Clock, Mail, ChevronDown, ChevronUp, Phone, X, Trash2 } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { campaigns, Company, Status, StatusSpec, statusList, statusColorClass, keinInteresseReasons, adActaReasons, onHoldReasons, zukunftReasons } from '@/data/mockData';
import HistoryBlock from './HistoryBlock';

const titleOptions = ['', 'Dr.', 'Prof.', 'Mag.'];

const CallCockpit: React.FC = () => {
  const { selectedCompany, updateCompany, addHistoryEntry, role } = useAppState();
  const [note, setNote] = useState('');
  const [showEmailEvents, setShowEmailEvents] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [pitchText, setPitchText] = useState('');
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [eventNote, setEventNote] = useState('');
  const [eventNoteType, setEventNoteType] = useState<'call' | 'email' | null>(null);
  const [eventNoteSaved, setEventNoteSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventNoteRef = useRef<HTMLInputElement>(null);
  const [addingShareholder, setAddingShareholder] = useState(false);
  const [addingManager, setAddingManager] = useState(false);
  const [newShName, setNewShName] = useState('');
  const [newShPct, setNewShPct] = useState('');
  const [newMgName, setNewMgName] = useState('');
  const [newMgPos, setNewMgPos] = useState('');
  const [editingCompanyTags, setEditingCompanyTags] = useState(false);
  const [newCompanyTag, setNewCompanyTag] = useState('');
  const [editingDmTags, setEditingDmTags] = useState(false);
  const [newDmTag, setNewDmTag] = useState('');
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (noteRef.current) noteRef.current.focus();
    setLastEventId(null);
  }, [selectedCompany?.id]);

  if (!selectedCompany) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a company from the queue
      </div>
    );
  }

  const co = selectedCompany;
  const dm = co.decisionMaker;
  const campaign = campaigns.find(c => c.id === co.campaignId);

  const setNextContact = (date: Date, autoEntry = true) => {
    updateCompany(co.id, { nextContact: date });
    if (autoEntry) {
      addHistoryEntry(co.id, {
        timestamp: new Date(),
        type: 'time',
        content: `Next contact set to ${format(date, 'dd.MM.yyyy HH:mm')}`,
        user: 'Current User',
      });
    }
  };

  const getNextBusinessDay = (from: Date, skip = 1): Date => {
    const d = new Date(from);
    let count = 0;
    while (count < skip) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    }
    return d;
  };

  const timeButtons = [
    { label: '+10m', fn: () => addMinutes(new Date(), 10) },
    { label: '+15m', fn: () => addMinutes(new Date(), 15) },
    { label: '+30m', fn: () => addMinutes(new Date(), 30) },
    { label: '+45m', fn: () => addMinutes(new Date(), 45) },
    { label: '+1h', fn: () => addHours(new Date(), 1) },
    { label: '+2h', fn: () => addHours(new Date(), 2) },
    { label: 'Midday', fn: () => setMinutes(setHours(new Date(), 12), 15) },
    { label: 'Early PM', fn: () => setMinutes(setHours(new Date(), 14), 15) },
    { label: 'Afternoon', fn: () => setMinutes(setHours(new Date(), 15), 30) },
    { label: 'Tomorrow', fn: () => setMinutes(setHours(getNextBusinessDay(new Date()), 9), 30) },
  ];

  const callEvents = [
    { label: 'Busy', preset: () => addMinutes(new Date(), 30) },
    { label: 'Voicemail', preset: null },
    { label: 'Not in office', preset: () => setMinutes(setHours(new Date(), 10), 30) },
    { label: 'Not at desk', preset: () => addMinutes(new Date(), 30) },
    { label: 'At lunch', preset: () => setMinutes(setHours(new Date(), 14), 15) },
    { label: 'In meeting', preset: () => addHours(new Date(), 1) },
    { label: 'On vacation', preset: () => setMinutes(setHours(getNextBusinessDay(new Date(), 5), 9), 30) },
    { label: 'Call back', preset: () => setMinutes(setHours(getNextBusinessDay(new Date(), 2), 9), 30) },
    { label: 'Tomorrow again', preset: () => setMinutes(setHours(getNextBusinessDay(new Date()), 9), 30) },
    { label: 'Next week', preset: () => setMinutes(setHours(getNextBusinessDay(new Date(), 5), 9), 30) },
    { label: 'DM spoken', preset: null },
    { label: 'Blocking', preset: null },
  ];

  const emailEvents = [
    'Email after discussion', 'First email', 'Second email', 'Third email', 'Fourth email',
    'Info@ email', 'Email bounce', 'Reply received', 'DM responded',
  ];

  const saveEventNote = useCallback((noteText: string, entryId: string | null) => {
    if (!noteText.trim() || !entryId) return;
    setEventNoteSaved('saving');
    const targetEntry = co.history.find(h => h.id === entryId);
    if (targetEntry) {
      const baseContent = targetEntry.content.split(' — ')[0];
      const updatedContent = `${baseContent} — ${noteText.trim()}`;
      const updatedHistory = co.history.map(h =>
        h.id === entryId ? { ...h, content: updatedContent } : h
      );
      updateCompany(co.id, { history: updatedHistory } as any);
    }
    setTimeout(() => setEventNoteSaved('saved'), 100);
    setTimeout(() => setEventNoteSaved('idle'), 1500);
  }, [co, updateCompany]);

  const clearEventNote = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setEventNote('');
    setEventNoteType(null);
    setLastEventId(null);
    setEventNoteSaved('idle');
  }, []);

  const handleEventNoteChange = useCallback((value: string) => {
    setEventNote(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        saveEventNote(value, lastEventId);
      }, 1000);
    }
  }, [lastEventId, saveEventNote]);

  const handleEventNoteBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (eventNote.trim()) {
      saveEventNote(eventNote, lastEventId);
    }
  }, [eventNote, lastEventId, saveEventNote]);

  const handleEventNoteKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (eventNote.trim()) saveEventNote(eventNote, lastEventId);
      clearEventNote();
    }
    if (e.key === 'Escape') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (eventNote.trim()) saveEventNote(eventNote, lastEventId);
      clearEventNote();
    }
  }, [eventNote, lastEventId, saveEventNote, clearEventNote]);

  const handleCallEvent = (label: string, preset: (() => Date) | null) => {
    if (!isAdmin) return;
    if (eventNote.trim() && lastEventId) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      saveEventNote(eventNote, lastEventId);
    }
    const entryId = `h-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    addHistoryEntry(co.id, {
      timestamp: new Date(),
      type: 'call',
      content: label,
      user: 'Current User',
    });
    setLastEventId(entryId);
    setEventNote('');
    setEventNoteType('call');
    setEventNoteSaved('idle');
    setTimeout(() => eventNoteRef.current?.focus(), 50);
    if (preset) {
      const nextDate = preset();
      setNextContact(nextDate, false);
    }
  };

  const handleEmailEvent = (label: string) => {
    if (eventNote.trim() && lastEventId) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      saveEventNote(eventNote, lastEventId);
    }
    const entryId = `h-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    addHistoryEntry(co.id, {
      timestamp: new Date(),
      type: 'email',
      content: label,
      user: 'Current User',
    });
    setLastEventId(entryId);
    setEventNote('');
    setEventNoteType('email');
    setEventNoteSaved('idle');
    setTimeout(() => eventNoteRef.current?.focus(), 50);
  };

  const handleSaveNote = () => {
    if (!note.trim()) return;
    addHistoryEntry(co.id, {
      timestamp: new Date(),
      type: 'note',
      content: note.trim(),
      user: 'Current User',
    });
    setNote('');
  };

  const addShareholder = () => {
    if (!newShName.trim()) return;
    const newSh = {
      id: `s-${Date.now()}`,
      name: newShName.trim(),
      birthYear: 0,
      ownershipPct: parseFloat(newShPct) || 0,
      externalNote: '',
    };
    updateCompany(co.id, { shareholders: [...co.shareholders, newSh] });
    setNewShName('');
    setNewShPct('');
    setAddingShareholder(false);
  };

  const addManager = () => {
    if (!newMgName.trim()) return;
    const newMg = {
      id: `m-${Date.now()}`,
      name: newMgName.trim(),
      birthYear: 0,
      position: newMgPos.trim() || 'N/A',
      externalNote: '',
    };
    updateCompany(co.id, { management: [...co.management, newMg] });
    setNewMgName('');
    setNewMgPos('');
    setAddingManager(false);
  };

  const setAsDecisionMaker = (name: string, birthYear: number, ownershipPct: number, position: string) => {
    updateCompany(co.id, {
      decisionMaker: { ...dm, firstName: name.split(' ')[0] || '', lastName: name.split(' ').slice(1).join(' ') || '', birthYear, ownershipPct, position },
    });
    addHistoryEntry(co.id, {
      timestamp: new Date(),
      type: 'dm-change',
      content: `Decision maker set to ${name}`,
      user: 'Current User',
    });
  };

  const noteLines = note.split('\n').length;
  const noteRows = Math.max(2, Math.min(noteLines + 1, 10));

  return (
    <div className="h-full overflow-auto p-3 space-y-3">
      {/* Two-column top section */}
      <div className="grid grid-cols-2 gap-3">
        {/* LEFT COLUMN - Company Block */}
        <div className="space-y-3">
          {/* Campaign */}
          <div className="cockpit-section">
            <div className="flex items-center justify-between">
              <div>
                <div className="cockpit-label">Campaign</div>
                <div className="text-sm font-medium text-foreground">{campaign?.name || 'N/A'}</div>
              </div>
              <button
                onClick={() => { setShowPitch(true); setPitchText(campaign?.pitchText || ''); }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Pitch
              </button>
            </div>
          </div>

          {/* Company Info */}
          <div className="cockpit-section space-y-2">
            <div className="flex items-center gap-2">
              {isAdmin && (
                <select
                  value={co.companyPriority}
                  onChange={e => updateCompany(co.id, { companyPriority: e.target.value as any })}
                  className={`priority-badge priority-${co.companyPriority.toLowerCase()} bg-transparent border-none text-xs cursor-pointer`}
                >
                  {['A','B','C','D','E'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
              {!isAdmin && <span className={`priority-badge priority-${co.companyPriority.toLowerCase()}`}>{co.companyPriority}</span>}
              <input
                value={co.name}
                onChange={e => updateCompany(co.id, { name: e.target.value })}
                className="text-sm font-semibold text-foreground bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 flex-1"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 items-center">
              {co.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 text-xs rounded bg-surface-2 text-muted-foreground flex items-center gap-0.5">
                  {tag}
                  {editingCompanyTags && (
                    <button onClick={() => updateCompany(co.id, { tags: co.tags.filter(t => t !== tag) })} className="hover:text-destructive">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}
              {editingCompanyTags ? (
                <input
                  autoFocus
                  value={newCompanyTag}
                  onChange={e => setNewCompanyTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCompanyTag.trim()) {
                      updateCompany(co.id, { tags: [...co.tags, newCompanyTag.trim()] });
                      setNewCompanyTag('');
                    }
                    if (e.key === 'Escape') { setEditingCompanyTags(false); setNewCompanyTag(''); }
                  }}
                  onBlur={() => {
                    if (newCompanyTag.trim()) updateCompany(co.id, { tags: [...co.tags, newCompanyTag.trim()] });
                    setEditingCompanyTags(false); setNewCompanyTag('');
                  }}
                  className="w-16 text-xs bg-surface-2 border border-border rounded px-1 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="tag"
                />
              ) : (
                <button onClick={() => setEditingCompanyTags(true)} className="text-muted-foreground hover:text-primary text-xs">
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">{co.city}, {co.country}</div>

            <div className="flex gap-3 text-xs">
              {isAdmin && (
                <a href={`tel:${co.centralPhone}`} className="phone-link flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {co.centralPhone}
                </a>
              )}
              <a href={`https://${co.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {co.website}
              </a>
            </div>

            {/* Financials */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs border-t border-border pt-2 mt-2">
              <span><span className="text-muted-foreground">Rev:</span> {co.revenue}</span>
              <span><span className="text-muted-foreground">EBITDA:</span> {co.ebitda}</span>
              <span><span className="text-muted-foreground">EBIT:</span> {co.ebit}</span>
              <span><span className="text-muted-foreground">Net:</span> {co.netProfit}</span>
              <span><span className="text-muted-foreground">FTE:</span> {co.employees}</span>
              <span><span className="text-muted-foreground">FY:</span> {co.lastAnnualFinancials}</span>
            </div>
          </div>

          {/* Description */}
          <div className="cockpit-section">
            <div className="cockpit-label">Description</div>
            <textarea
              value={co.description}
              onChange={e => updateCompany(co.id, { description: e.target.value })}
              className="w-full text-xs text-foreground bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded resize-none"
              rows={5}
            />
          </div>

          {/* Shareholders */}
          <div className="cockpit-section">
            <div className="flex items-center justify-between">
              <div className="cockpit-label mb-0">Shareholders</div>
              <button onClick={() => setAddingShareholder(true)} className="text-muted-foreground hover:text-primary">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 mt-1">
              {co.shareholders.slice(0, 5).map(sh => (
                <div key={sh.id} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground font-medium w-32 truncate">{sh.name}</span>
                  <span className="text-muted-foreground w-10">{sh.birthYear || '—'}</span>
                  <span className="text-primary font-mono w-10">{sh.ownershipPct}%</span>
                  <span className="text-muted-foreground flex-1 truncate">{sh.externalNote}</span>
                  {sh.isDecisionMaker && <User className="w-3 h-3 text-primary" />}
                  {isAdmin && !sh.isDecisionMaker && (
                    <button
                      onClick={() => setAsDecisionMaker(sh.name, sh.birthYear, sh.ownershipPct, 'Shareholder')}
                      title="Set as Decision Maker"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <User className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {addingShareholder && (
                <div className="flex items-center gap-1 mt-1">
                  <input value={newShName} onChange={e => setNewShName(e.target.value)} placeholder="Name" className="text-xs bg-surface-2 border border-border rounded px-1 py-0.5 text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input value={newShPct} onChange={e => setNewShPct(e.target.value)} placeholder="%" className="text-xs bg-surface-2 border border-border rounded px-1 py-0.5 text-foreground w-12 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={addShareholder} className="text-xs text-primary hover:underline">Add</button>
                  <button onClick={() => setAddingShareholder(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                </div>
              )}
            </div>
          </div>

          {/* Management */}
          <div className="cockpit-section">
            <div className="flex items-center justify-between">
              <div className="cockpit-label mb-0">Management</div>
              <button onClick={() => setAddingManager(true)} className="text-muted-foreground hover:text-primary">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 mt-1">
              {co.management.slice(0, 3).map(mg => (
                <div key={mg.id} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground font-medium w-32 truncate">{mg.name}</span>
                  <span className="text-muted-foreground w-10">{mg.birthYear || '—'}</span>
                  <span className="text-muted-foreground w-20">{mg.position}</span>
                  <span className="text-muted-foreground flex-1 truncate">{mg.externalNote}</span>
                  {mg.isDecisionMaker && <User className="w-3 h-3 text-primary" />}
                  {isAdmin && !mg.isDecisionMaker && (
                    <button
                      onClick={() => setAsDecisionMaker(mg.name, mg.birthYear, 0, mg.position)}
                      title="Set as Decision Maker"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <User className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {addingManager && (
                <div className="flex items-center gap-1 mt-1">
                  <input value={newMgName} onChange={e => setNewMgName(e.target.value)} placeholder="Name" className="text-xs bg-surface-2 border border-border rounded px-1 py-0.5 text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input value={newMgPos} onChange={e => setNewMgPos(e.target.value)} placeholder="Position" className="text-xs bg-surface-2 border border-border rounded px-1 py-0.5 text-foreground w-20 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={addManager} className="text-xs text-primary hover:underline">Add</button>
                  <button onClick={() => setAddingManager(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Decision Maker + Status */}
        <div className="space-y-3">
          {/* Decision Maker */}
          <div className="cockpit-section space-y-2">
            <div className="cockpit-label">Decision Maker</div>
            <div className="flex gap-2">
              <select
                value={dm.title}
                onChange={e => updateCompany(co.id, { decisionMaker: { ...dm, title: e.target.value } })}
                className="text-xs bg-surface-2 border border-border rounded px-1 py-0.5 text-foreground w-16"
              >
                {titleOptions.map(t => <option key={t} value={t}>{t || '—'}</option>)}
              </select>
              <input
                value={dm.firstName}
                onChange={e => updateCompany(co.id, { decisionMaker: { ...dm, firstName: e.target.value } })}
                className="text-xs bg-transparent border-b border-border text-foreground focus:outline-none focus:border-primary px-1 w-24"
                placeholder="First"
              />
              <input
                value={dm.lastName}
                onChange={e => updateCompany(co.id, { decisionMaker: { ...dm, lastName: e.target.value } })}
                className="text-xs bg-transparent border-b border-border text-foreground focus:outline-none focus:border-primary px-1 flex-1"
                placeholder="Last"
              />
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">{dm.position}</span>
              <span className="text-muted-foreground">b.{dm.birthYear}</span>
              <span className="text-primary font-mono">{dm.ownershipPct}%</span>
            </div>
            <textarea
              value={dm.comment}
              onChange={e => updateCompany(co.id, { decisionMaker: { ...dm, comment: e.target.value } })}
              className="w-full text-xs text-foreground bg-surface-2 border border-border rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2}
              placeholder="DM comment..."
            />
            {/* DM Tags */}
            <div className="flex flex-wrap gap-1 items-center">
              {dm.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 text-xs rounded bg-surface-2 text-primary flex items-center gap-0.5">
                  {tag}
                  {editingDmTags && (
                    <button onClick={() => updateCompany(co.id, { decisionMaker: { ...dm, tags: dm.tags.filter(t => t !== tag) } })} className="hover:text-destructive">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}
              {editingDmTags ? (
                <input
                  autoFocus
                  value={newDmTag}
                  onChange={e => setNewDmTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newDmTag.trim()) {
                      updateCompany(co.id, { decisionMaker: { ...dm, tags: [...dm.tags, newDmTag.trim()] } });
                      setNewDmTag('');
                    }
                    if (e.key === 'Escape') { setEditingDmTags(false); setNewDmTag(''); }
                  }}
                  onBlur={() => {
                    if (newDmTag.trim()) updateCompany(co.id, { decisionMaker: { ...dm, tags: [...dm.tags, newDmTag.trim()] } });
                    setEditingDmTags(false); setNewDmTag('');
                  }}
                  className="w-16 text-xs bg-surface-2 border border-border rounded px-1 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="tag"
                />
              ) : (
                <button onClick={() => setEditingDmTags(true)} className="text-muted-foreground hover:text-primary text-xs">
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Contact */}
            <div className="space-y-1 border-t border-border pt-2">
              {isAdmin && dm.mobile && (
                <a href={`tel:${dm.mobile}`} className="phone-link text-xs flex items-center gap-1">
                  📱 {dm.mobile}
                </a>
              )}
              {isAdmin && dm.direct && (
                <a href={`tel:${dm.direct}`} className="phone-link text-xs flex items-center gap-1">
                  ☎️ {dm.direct}
                </a>
              )}
              <a href={`mailto:${dm.email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Mail className="w-3 h-3" /> {dm.email}
              </a>
            </div>
          </div>

          {/* Status & Next Contact */}
          <div className="cockpit-section space-y-2">
            <div className="cockpit-label">Status & Next Contact</div>
            <div className="flex gap-2 flex-wrap">
              {isAdmin ? (
                <select
                  value={co.status}
                  onChange={e => {
                    const newStatus = e.target.value as Status;
                    updateCompany(co.id, { status: newStatus, statusSpec: '' });
                    addHistoryEntry(co.id, {
                      timestamp: new Date(),
                      type: 'status',
                      content: `Status → ${newStatus}`,
                      user: 'Current User',
                    });
                  }}
                  className={`status-pill ${statusColorClass[co.status]} bg-transparent border border-border cursor-pointer text-xs`}
                >
                  {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`status-pill ${statusColorClass[co.status]}`}>{co.status}</span>
              )}
            </div>

            {/* Conditional sub-status for specific statuses */}
            {isAdmin && co.status === 'kein Interesse' && (
              <div className="space-y-2 border-t border-border pt-2">
                <select
                  value={co.statusSpec}
                  onChange={e => updateCompany(co.id, { statusSpec: e.target.value })}
                  className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground"
                >
                  <option value="">— Grund wählen —</option>
                  {keinInteresseReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {co.statusSpec === 'sonstiges' && (
                  <input
                    value={co.statusComment}
                    onChange={e => updateCompany(co.id, { statusComment: e.target.value })}
                    className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground placeholder:text-muted-foreground"
                    placeholder="Freitext..."
                  />
                )}
                <label className="flex items-center gap-2 text-xs text-foreground">
                  <input type="checkbox" checked={co.certainPotential || false} onChange={e => updateCompany(co.id, { certainPotential: e.target.checked })} className="rounded border-border" />
                  Certain Potential
                </label>
              </div>
            )}

            {isAdmin && co.status === 'ad acta' && (
              <div className="space-y-2 border-t border-border pt-2">
                <select
                  value={co.statusSpec}
                  onChange={e => updateCompany(co.id, { statusSpec: e.target.value })}
                  className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground"
                >
                  <option value="">— Grund wählen —</option>
                  {adActaReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {co.statusSpec === 'sonstiges' && (
                  <input
                    value={co.statusComment}
                    onChange={e => updateCompany(co.id, { statusComment: e.target.value })}
                    className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground placeholder:text-muted-foreground"
                    placeholder="Freitext..."
                  />
                )}
                <label className="flex items-center gap-2 text-xs text-foreground">
                  <input type="checkbox" checked={co.certainPotential || false} onChange={e => updateCompany(co.id, { certainPotential: e.target.checked })} className="rounded border-border" />
                  Certain Potential
                </label>
              </div>
            )}

            {isAdmin && co.status === 'on hold' && (
              <div className="space-y-2 border-t border-border pt-2">
                <select
                  value={co.statusSpec}
                  onChange={e => updateCompany(co.id, { statusSpec: e.target.value })}
                  className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground"
                >
                  <option value="">— Grund wählen —</option>
                  {onHoldReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {co.statusSpec === 'Sonstiges' && (
                  <input
                    value={co.statusComment}
                    onChange={e => updateCompany(co.id, { statusComment: e.target.value })}
                    className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground placeholder:text-muted-foreground"
                    placeholder="Freitext..."
                  />
                )}
              </div>
            )}

            {isAdmin && co.status === 'zukünftiges Potenzial' && (
              <div className="space-y-2 border-t border-border pt-2">
                <select
                  value={co.statusSpec}
                  onChange={e => updateCompany(co.id, { statusSpec: e.target.value })}
                  className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground"
                >
                  <option value="">— Grund wählen —</option>
                  {zukunftReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Wird interessant zu</label>
                    <input
                      type="date"
                      value={co.zukunftWirdInteressant ? format(co.zukunftWirdInteressant, 'yyyy-MM-dd') : ''}
                      onChange={e => updateCompany(co.id, { zukunftWirdInteressant: e.target.value ? new Date(e.target.value) : null })}
                      className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Verkauf geplant zu</label>
                    <input
                      type="date"
                      value={co.zukunftVerkaufGeplant ? format(co.zukunftVerkaufGeplant, 'yyyy-MM-dd') : ''}
                      onChange={e => updateCompany(co.id, { zukunftVerkaufGeplant: e.target.value ? new Date(e.target.value) : null })}
                      className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground"
                    />
                  </div>
                </div>
                <textarea
                  value={co.zukunftKommentar || ''}
                  onChange={e => updateCompany(co.id, { zukunftKommentar: e.target.value })}
                  className="w-full text-xs text-foreground bg-surface-2 border border-border rounded p-1.5 resize-none"
                  rows={2}
                  placeholder="Kommentar..."
                />
              </div>
            )}

            {/* Show sub-status for assistant (read-only) */}
            {!isAdmin && co.statusSpec && (
              <div className="text-xs text-muted-foreground">{co.statusSpec}</div>
            )}

            {/* Status free-text comment - always visible for all statuses */}
            {isAdmin && (
              <input
                value={co.statusComment}
                onChange={e => updateCompany(co.id, { statusComment: e.target.value })}
                className="w-full text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Status comment..."
              />
            )}

            {/* Next Contact */}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="datetime-local"
                value={co.nextContact ? format(co.nextContact, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={e => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) setNextContact(d, false);
                }}
                className="text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Time Quick Buttons */}
          <div className="cockpit-section">
            <div className="cockpit-label">Quick Time</div>
            <div className="flex flex-wrap gap-1">
              {timeButtons.map(tb => (
                <button key={tb.label} onClick={() => setNextContact(tb.fn())} className="time-button">
                  {tb.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="cockpit-section">
            <div className="cockpit-label">Note</div>
            <textarea
              ref={noteRef}
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSaveNote(); }}
              className="w-full text-xs text-foreground bg-surface-2 border border-border rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={noteRows}
              placeholder="Add note... (Ctrl+Enter to save)"
            />
            {note && (
              <button onClick={handleSaveNote} className="mt-1 text-xs text-primary hover:underline">
                Save Note
              </button>
            )}
          </div>

          {/* Call Quick Events */}
          {isAdmin && (
            <div className="cockpit-section">
              <div className="cockpit-label">Call Events</div>
              <div className="flex flex-wrap gap-1">
                {callEvents.map(ev => (
                  <button key={ev.label} onClick={() => handleCallEvent(ev.label, ev.preset)} className="event-button">
                    {ev.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowEmailEvents(!showEmailEvents)}
                  className="event-button flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Email
                  {showEmailEvents ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {showEmailEvents && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border">
                  {emailEvents.map(ev => (
                    <button key={ev} onClick={() => handleEmailEvent(ev)} className="event-button">
                      {ev}
                    </button>
                  ))}
                </div>
              )}
              {/* Inline note for call/email event */}
              {eventNoteType && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                  <input
                    ref={eventNoteRef}
                    autoFocus
                    value={eventNote}
                    onChange={e => handleEventNoteChange(e.target.value)}
                    onKeyDown={handleEventNoteKeyDown}
                    onBlur={handleEventNoteBlur}
                    className="flex-1 text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Add note… (Enter to finish, auto-saves)"
                  />
                  <span className="text-[10px] text-muted-foreground w-12 text-right">
                    {eventNoteSaved === 'saving' && 'Saving…'}
                    {eventNoteSaved === 'saved' && '✓ Saved'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Email events for assistant */}
          {!isAdmin && (
            <div className="cockpit-section">
              <div className="cockpit-label">Email Events</div>
              <div className="flex flex-wrap gap-1">
                {emailEvents.map(ev => (
                  <button key={ev} onClick={() => handleEmailEvent(ev)} className="event-button">
                    {ev}
                  </button>
                ))}
              </div>
              {/* Inline note for email event (assistant) */}
              {eventNoteType === 'email' && (
                <div className="flex gap-1 mt-2 pt-2 border-t border-border">
                  <input
                    autoFocus
                    value={eventNote}
                    onChange={e => setEventNote(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAppendEventNote();
                      if (e.key === 'Escape') { setEventNote(''); setEventNoteType(null); setLastEventId(null); }
                    }}
                    className="flex-1 text-xs bg-surface-2 border border-border rounded px-2 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Add note to event... (Enter to save, Esc to dismiss)"
                  />
                  <button onClick={handleAppendEventNote} className="text-xs text-primary hover:underline px-1">Save</button>
                  <button onClick={() => { setEventNote(''); setEventNoteType(null); setLastEventId(null); }} className="text-xs text-muted-foreground hover:underline px-1">×</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <HistoryBlock companyId={co.id} />

      {/* Pitch Modal - near full screen */}
      {showPitch && campaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80" onClick={() => setShowPitch(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-[90vw] h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">{campaign.name} — Pitch</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { /* save pitch - simulated */ }} className="text-xs text-primary hover:underline">Save</button>
                <button onClick={() => setShowPitch(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
              </div>
            </div>
            <textarea
              value={pitchText}
              onChange={e => setPitchText(e.target.value)}
              className="flex-1 w-full text-sm text-foreground bg-surface-2 border border-border rounded p-4 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CallCockpit;
