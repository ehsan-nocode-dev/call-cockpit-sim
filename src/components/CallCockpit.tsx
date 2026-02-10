import React, { useState, useRef, useEffect } from 'react';
import { format, addMinutes, addHours, setHours, setMinutes, addDays } from 'date-fns';
import { ExternalLink, Plus, User, Clock, Mail, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { campaigns, Company, Status, StatusSpec, statusList, statusColorClass, keinInteresseReasons, adActaReasons, onHoldReasons, zukunftReasons } from '@/data/mockData';
import HistoryBlock from './HistoryBlock';

const titleOptions = ['', 'Dr.', 'Prof.', 'Mag.'];

const CallCockpit: React.FC = () => {
  const { selectedCompany, updateCompany, addHistoryEntry, role } = useAppState();
  const [note, setNote] = useState('');
  const [showEmailEvents, setShowEmailEvents] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (noteRef.current) noteRef.current.focus();
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

  const handleCallEvent = (label: string, preset: (() => Date) | null) => {
    if (!isAdmin) return;
    addHistoryEntry(co.id, {
      timestamp: new Date(),
      type: 'call',
      content: label,
      user: 'Current User',
    });
    if (preset) {
      const nextDate = preset();
      setNextContact(nextDate, false);
    }
  };

  const handleEmailEvent = (label: string) => {
    addHistoryEntry(co.id, {
      timestamp: new Date(),
      type: 'email',
      content: label,
      user: 'Current User',
    });
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
                onClick={() => setShowPitch(true)}
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
            <div className="flex flex-wrap gap-1">
              {co.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 text-xs rounded bg-surface-2 text-muted-foreground">{tag}</span>
              ))}
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
            <div className="cockpit-label">Shareholders</div>
            <div className="space-y-1">
              {co.shareholders.slice(0, 5).map(sh => (
                <div key={sh.id} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground font-medium w-32 truncate">{sh.name}</span>
                  <span className="text-muted-foreground w-10">{sh.birthYear || '—'}</span>
                  <span className="text-primary font-mono w-10">{sh.ownershipPct}%</span>
                  <span className="text-muted-foreground flex-1 truncate">{sh.externalNote}</span>
                  {sh.isDecisionMaker && <User className="w-3 h-3 text-primary" />}
                </div>
              ))}
            </div>
          </div>

          {/* Management */}
          <div className="cockpit-section">
            <div className="cockpit-label">Management</div>
            <div className="space-y-1">
              {co.management.slice(0, 3).map(mg => (
                <div key={mg.id} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground font-medium w-32 truncate">{mg.name}</span>
                  <span className="text-muted-foreground w-10">{mg.birthYear || '—'}</span>
                  <span className="text-muted-foreground w-20">{mg.position}</span>
                  <span className="text-muted-foreground flex-1 truncate">{mg.externalNote}</span>
                  {mg.isDecisionMaker && <User className="w-3 h-3 text-primary" />}
                </div>
              ))}
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
            <div className="flex flex-wrap gap-1">
              {dm.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 text-xs rounded bg-surface-2 text-primary">{tag}</span>
              ))}
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
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" /> {dm.email}
              </div>
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
                  <input
                    type="checkbox"
                    checked={co.certainPotential || false}
                    onChange={e => updateCompany(co.id, { certainPotential: e.target.checked })}
                    className="rounded border-border"
                  />
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
                  <input
                    type="checkbox"
                    checked={co.certainPotential || false}
                    onChange={e => updateCompany(co.id, { certainPotential: e.target.checked })}
                    className="rounded border-border"
                  />
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

            {/* Status comment (for statuses without special sub-status UI) */}
            {isAdmin && !['kein Interesse', 'ad acta', 'on hold', 'zukünftiges Potenzial'].includes(co.status) && (
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
                <button
                  key={tb.label}
                  onClick={() => setNextContact(tb.fn())}
                  className="time-button"
                >
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
              rows={note.split('\n').length > 1 ? Math.min(note.split('\n').length, 10) : 1}
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
                  <button
                    key={ev.label}
                    onClick={() => handleCallEvent(ev.label, ev.preset)}
                    className="event-button"
                  >
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
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <HistoryBlock companyId={co.id} />

      {/* Pitch Modal */}
      {showPitch && campaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80" onClick={() => setShowPitch(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">{campaign.name} — Pitch</h3>
              <button onClick={() => setShowPitch(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </div>
            <textarea
              defaultValue={campaign.pitchText}
              className="w-full text-xs text-foreground bg-surface-2 border border-border rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CallCockpit;
