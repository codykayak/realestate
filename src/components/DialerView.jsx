import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fileIcon, isImage, formatSize } from '../hooks/useLeadPhotos';
import { smsCountForPhone } from '../utils/smsTemplates';
import { isSmsBlocked, isCallBlocked, complianceLabel } from '../utils/leadCompliance';
import TxtNowSheet from './TxtNowSheet';
import LeadActivityTimeline from './LeadActivityTimeline';
import SellerDealPanel from './SellerDealPanel';
import styles from './DialerView.module.css';

const OUTCOMES = [
  { id: 'interested',    label: 'Interested',     emoji: '🔥', color: '#3fb950', status: 'Negotiating' },
  { id: 'callback',      label: 'Callback',        emoji: '📅', color: '#58a6ff', status: 'Contacted'   },
  { id: 'voicemail',     label: 'Voicemail',       emoji: '📬', color: '#f5a623', status: 'Contacted'   },
  { id: 'not_interested',label: 'Not Interested',  emoji: '👎', color: '#6e7681', status: 'Dead'        },
  { id: 'wrong_number',  label: 'Wrong #',         emoji: '❌', color: '#f85149', status: 'Dead'        },
];

const DAILY_GOAL = 100;

export default function DialerView({
  leads,
  onUpdateLead,
  onSyncPortal,
  onLogCall,
  todayCalls,
  onViewInSheets,
  jumpToId,
  onUploadPhoto,
  onDeletePhoto,
  twilioReady = false,
  twilioConfig = null,
  twilioTemplates = [],
  onOpenTwilioSetup,
  onSendSms,
  scheduleAppointmentSms,
  cancelScheduledAppointmentSms,
  fetchLeadActivity,
  smsSending = false,
  smsError = null,
  onShowInfo,
  emailTemplates,
  agentName,
}) {
  const [idx, setIdx]             = useState(0);
  const [jumped, setJumped]       = useState(false);
  const [note, setNote]           = useState('');
  const [calling, setCalling]     = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'New' | 'Contacted' | ...
  const [showFilter, setShowFilter] = useState(false);
  const [txtOpen, setTxtOpen]     = useState(false);
  const [activePhone, setActivePhone] = useState('');
  const [appointmentAt, setAppointmentAt] = useState('');
  const [apptMsg, setApptMsg] = useState(null);
  const [apptBusy, setApptBusy] = useState(false);

  function hasPhone(l) {
    if (l.phones?.length > 0) return true;
    if (l.phone && l.phone.replace(/\D/g, '').length >= 7) return true;
    return false;
  }

  // Filter leads to those with at least one phone number
  const queue = useMemo(() => {
    let q = leads.filter(hasPhone);
    if (filterStatus !== 'all') q = q.filter((l) => l.status === filterStatus);
    // Sort: fewest calls first, then by id
    return q.sort((a, b) => (a.callCount ?? 0) - (b.callCount ?? 0) || a.id - b.id);
  }, [leads, filterStatus]);

  const lead = queue[idx] ?? null;
  const total = queue.length;

  // Stats
  const todayCount   = todayCalls?.length ?? 0;
  const todayInterested = todayCalls?.filter((c) => c.outcome === 'interested').length ?? 0;
  const pct = Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100));

  // Jump to a specific lead when coming from Sheets view
  useEffect(() => {
    if (!jumpToId || jumped) return;
    const queueIdx = queue.findIndex((l) => l.id === jumpToId);
    if (queueIdx !== -1) { setIdx(queueIdx); setJumped(true); }
  }, [jumpToId, queue, jumped]);

  // Reset jump flag when jumpToId changes
  useEffect(() => { setJumped(false); }, [jumpToId]);

  // Sync note when lead changes
  useEffect(() => {
    setNote(lead?.notes ?? '');
    setLastOutcome(lead?.lastOutcome ?? null);
    setCalling(false);
    setActivePhone(lead?.phone ?? lead?.phones?.[0]?.number ?? '');
    setAppointmentAt(lead?.appointmentAt ? lead.appointmentAt.slice(0, 16) : '');
    setApptMsg(null);
  }, [lead?.id]);

  const toggleFlag = useCallback((key) => {
    if (!lead) return;
    onUpdateLead(lead.id, { [key]: !lead[key] });
  }, [lead, onUpdateLead]);

  const handleTxtNow = useCallback(() => {
    if (!twilioReady) {
      onOpenTwilioSetup?.();
      return;
    }
    if (isSmsBlocked(lead)) return;
    setTxtOpen(true);
  }, [twilioReady, onOpenTwilioSetup, lead]);

  const handleScheduleAppointment = useCallback(async () => {
    if (!lead || !appointmentAt || !scheduleAppointmentSms) return;
    setApptBusy(true);
    setApptMsg(null);
    try {
      const iso = new Date(appointmentAt).toISOString();
      const data = await scheduleAppointmentSms({
        leadId: lead.id,
        appointmentAt: iso,
        toPhone: activePhone,
      });
      onUpdateLead(lead.id, {
        appointmentAt: data.appointmentAt,
        scheduledSmsId: data.scheduledSmsId,
        scheduledSmsSendAt: data.sendAt,
      });
      setApptMsg({ ok: true, text: `Reminder scheduled for ${new Date(data.sendAt).toLocaleString()}` });
    } catch (e) {
      setApptMsg({ ok: false, text: e.message || 'Could not schedule.' });
    } finally {
      setApptBusy(false);
    }
  }, [lead, appointmentAt, activePhone, scheduleAppointmentSms, onUpdateLead]);

  const handleCancelAppointment = useCallback(async () => {
    if (!lead || !cancelScheduledAppointmentSms) return;
    setApptBusy(true);
    try {
      await cancelScheduledAppointmentSms(lead.id);
      onUpdateLead(lead.id, { scheduledSmsId: null, scheduledSmsSendAt: null, appointmentAt: null });
      setAppointmentAt('');
      setApptMsg({ ok: true, text: 'Scheduled reminder cancelled.' });
    } catch (e) {
      setApptMsg({ ok: false, text: e.message || 'Cancel failed.' });
    } finally {
      setApptBusy(false);
    }
  }, [lead, cancelScheduledAppointmentSms, onUpdateLead]);

  const handleSmsSent = useCallback(async (payload) => {
    if (!onSendSms || !lead) return null;
    const result = await onSendSms(payload);
    if (result) {
      onUpdateLead(lead.id, {
        smsCount: result.smsCount,
        smsCountsByPhone: result.smsCountsByPhone,
        lastSmsAt: new Date().toISOString(),
        status: lead.status === 'New' ? 'Contacted' : lead.status,
      });
    }
    return result;
  }, [onSendSms, onUpdateLead, lead]);

  const handleCall = useCallback(() => {
    if (!lead?.phone || isCallBlocked(lead)) return;
    setCalling(true);
    const count = (lead.callCount ?? 0) + 1;
    onUpdateLead(lead.id, {
      callCount:    count,
      lastCalledAt: new Date().toISOString(),
      status:       lead.status === 'New' ? 'Contacted' : lead.status,
    });
    // tel: link opens native dialer on mobile
    window.location.href = `tel:${lead.phone.replace(/\D/g, '')}`;
  }, [lead, onUpdateLead]);

  const handleOutcome = useCallback((outcome) => {
    if (!lead) return;
    setLastOutcome(outcome.id);
    onUpdateLead(lead.id, {
      status:      outcome.status,
      lastOutcome: outcome.id,
      notes:       note,
    });
    onLogCall?.({
      leadId:   lead.id,
      leadName: lead.name ?? '',
      phone:    lead.phone ?? '',
      outcome:  outcome.id,
      note,
    });
  }, [lead, note, onUpdateLead, onLogCall]);

  const handleNext = useCallback(() => {
    if (note !== (lead?.notes ?? '')) {
      onUpdateLead(lead.id, { notes: note });
    }
    setIdx((i) => Math.min(i + 1, total - 1));
  }, [lead, note, total, onUpdateLead]);

  const handlePrev = useCallback(() => {
    setIdx((i) => Math.max(i - 1, 0));
  }, []);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (total === 0) {
    const totalLeads      = leads.length;
    const withAnyPhone    = leads.filter((l) => l.phone || l.phones?.length).length;
    const filterMismatch  = filterStatus !== 'all' && leads.filter(hasPhone).length > 0;

    return (
      <div className={styles.wrap}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            {totalLeads === 0 ? '📋' : withAnyPhone === 0 ? '📵' : '🔍'}
          </div>
          {totalLeads === 0 ? (
            <>
              <h2>No leads loaded</h2>
              <p>Upload a CSV or Excel file from the Map tab first, then come back to start dialing.</p>
            </>
          ) : filterMismatch ? (
            <>
              <h2>No {filterStatus} leads with phones</h2>
              <p>Try a different status filter or switch to All Leads.</p>
              <button className={styles.resetFilterBtn} onClick={() => setFilterStatus('all')}>
                Show all leads
              </button>
            </>
          ) : (
            <>
              <h2>Phone numbers not detected</h2>
              <p>
                {totalLeads} properties loaded but no phone numbers were found.
                Make sure your file has columns named like:
              </p>
              <div className={styles.emptyHints}>
                <span>Wireless 1</span><span>Wireless 2</span><span>Landline 1</span>
                <span>Phone 1</span><span>Cell Phone 1</span><span>Mobile 1</span>
              </div>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Check the browser console (F12) for column names that were detected.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* ── Session stats bar ─────────────────────────────────────────── */}
      <div className={styles.statsBar} style={{ flexWrap: 'wrap' }}>
        <div className={styles.statsLeft}>
          <span className={styles.statItem}>
            <span className={styles.statNum}>{todayCount}</span>
            <span className={styles.statLabel}> called today</span>
          </span>
          {todayInterested > 0 && (
            <span className={styles.statItem}>
              <span className={styles.statNum} style={{ color: '#3fb950' }}>{todayInterested}</span>
              <span className={styles.statLabel}> interested</span>
            </span>
          )}
        </div>
        <div className={styles.goalArea}>
          <span className={styles.goalLabel}>{todayCount}/{DAILY_GOAL}</span>
          <div className={styles.goalTrack}>
            <div className={styles.goalFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
        {onViewInSheets && (
          <button className={styles.sheetsBtn} onClick={() => onViewInSheets(lead?.id)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Sheets
          </button>
        )}

        <button
          type="button"
          className={`${styles.smsSetupBtn} ${twilioReady ? styles.smsSetupReady : ''}`}
          onClick={() => onOpenTwilioSetup?.()}
          title={twilioReady ? 'Twilio connected' : 'Set up Twilio SMS'}
        >
          {twilioReady ? '💬 SMS' : '💬 Setup'}
        </button>

        <button
          className={`${styles.filterBtn} ${filterStatus !== 'all' ? styles.filterActive : ''}`}
          onClick={() => setShowFilter((v) => !v)}
        >
          {filterStatus === 'all' ? `All (${total})` : `${filterStatus} (${total})`}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            style={{ transform: showFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        {showFilter && (
          <div className={styles.filterDrop}>
            {['all', 'New', 'Contacted', 'Negotiating', 'Dead', 'Closed'].map((s) => {
              const count = s === 'all'
                ? leads.filter(hasPhone).length
                : leads.filter((l) => hasPhone(l) && l.status === s).length;
              return (
                <button
                  key={s}
                  className={`${styles.filterOpt} ${filterStatus === s ? styles.filterOptActive : ''}`}
                  onClick={() => { setFilterStatus(s); setShowFilter(false); setIdx(0); }}
                >
                  {s === 'all' ? 'All Leads' : s}
                  <span className={styles.filterCount}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Position indicator ────────────────────────────────────────── */}
      <div className={styles.position}>
        <button className={styles.navBtn} onClick={handlePrev} disabled={idx === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className={styles.posLabel}>
          <strong>{idx + 1}</strong> / {total}
        </span>
        <button className={styles.navBtn} onClick={handleNext} disabled={idx === total - 1}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Lead card ─────────────────────────────────────────────────── */}
      <div className={styles.leadCard}>
        <div className={styles.leadHeader}>
          <div className={styles.leadInfo}>
            <h2 className={styles.leadName}>{lead.name || `Lead ${lead.id + 1}`}</h2>
            {lead.address && (
              <p className={styles.leadAddr}>
                {[lead.address, lead.city, lead.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <div className={styles.leadBadges}>
            {(lead.callCount ?? 0) > 0 && (
              <span className={styles.callCountBadge}>
                📞 {lead.callCount}×
              </span>
            )}
            {(lead.smsCount ?? 0) > 0 && (
              <span className={styles.smsCountBadge}>
                💬 {lead.smsCount}×
              </span>
            )}
            <span
              className={styles.statusBadge}
              style={{ background: statusColor(lead.status) }}
            >
              {lead.status}
            </span>
          </div>
        </div>

        {/* Zone info */}
        {lead.zoneName && (
          <p className={styles.zoneTag}>📍 {lead.zoneName} ({lead.zoneCode})</p>
        )}

        {/* Price / equity if available */}
        {(lead.price || lead.equity) && (
          <div className={styles.financials}>
            {lead.price  && <span>💰 {lead.price}</span>}
            {lead.equity && <span>📈 Equity: {lead.equity}</span>}
          </div>
        )}

        {/* Last outcome if any */}
        {lastOutcome && (
          <div className={styles.lastOutcomeRow}>
            Last: {OUTCOMES.find((o) => o.id === lastOutcome)?.emoji}{' '}
            <span style={{ color: OUTCOMES.find((o) => o.id === lastOutcome)?.color }}>
              {OUTCOMES.find((o) => o.id === lastOutcome)?.label}
            </span>
          </div>
        )}

        {complianceLabel(lead).length > 0 && (
          <div className={styles.complianceWarn}>
            {complianceLabel(lead).join(' · ')}
          </div>
        )}

        <div className={styles.complianceToggles}>
          <label className={styles.complianceLabel}>
            <input type="checkbox" checked={!!lead.doNotCall} onChange={() => toggleFlag('doNotCall')} />
            Do not call
          </label>
          <label className={styles.complianceLabel}>
            <input type="checkbox" checked={!!lead.doNotText} onChange={() => toggleFlag('doNotText')} />
            Do not text
          </label>
          <label className={styles.complianceLabel}>
            <input type="checkbox" checked={!!lead.smsOptOut} onChange={() => toggleFlag('smsOptOut')} />
            SMS opted out
          </label>
        </div>
      </div>

      {/* ── Phone + Call buttons ──────────────────────────────────────── */}
      <div className={`${styles.phoneSection} ${isCallBlocked(lead) ? styles.phoneSectionBlocked : ''}`}>
        {/* Multi-phone: show all numbers as tap-to-call rows */}
        {lead.phones?.length > 0 ? (
          <div className={styles.multiPhoneList}>
            {lead.phones.map(({ label, number }) => {
              const digits = number.replace(/\D/g, '');
              const isActive = calling && lead.phone === number;
              return (
                <a
                  key={label}
                  href={isCallBlocked(lead) ? undefined : `tel:${digits}`}
                  className={`${styles.multiPhoneRow} ${isActive ? styles.multiPhoneActive : ''} ${isCallBlocked(lead) ? styles.rowDisabled : ''}`}
                  onClick={(e) => {
                    if (isCallBlocked(lead)) { e.preventDefault(); return; }
                    setCalling(true);
                    setActivePhone(number);
                    const count = (lead.callCount ?? 0) + 1;
                    onUpdateLead(lead.id, {
                      phone:        number,
                      callCount:    count,
                      lastCalledAt: new Date().toISOString(),
                      status:       lead.status === 'New' ? 'Contacted' : lead.status,
                    });
                  }}
                >
                  <div className={styles.multiPhoneLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    <span className={styles.multiPhoneLabel}>{label}</span>
                  </div>
                  <span className={styles.multiPhoneNum}>{formatPhone(number)}</span>
                  <span className={styles.multiPhoneCall}>
                    {isActive ? 'Calling…' : 'CALL'}
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          /* Single phone fallback */
          <>
            <p className={styles.phoneNumber}>{formatPhone(lead.phone)}</p>
            <div className={styles.callActionRow}>
              <a
                href={isCallBlocked(lead) ? undefined : `tel:${(lead.phone || '').replace(/\D/g, '')}`}
                className={`${styles.callBtn} ${calling ? styles.callBtnActive : ''} ${isCallBlocked(lead) ? styles.rowDisabled : ''}`}
                onClick={(e) => {
                  if (isCallBlocked(lead)) { e.preventDefault(); return; }
                  handleCall();
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {calling ? 'Calling…' : 'CALL'}
              </a>
              <button
                type="button"
                className={styles.txtBtn}
                onClick={handleTxtNow}
                disabled={isSmsBlocked(lead)}
              >
                {isSmsBlocked(lead) ? 'Text blocked' : 'Txt Now'}
                {smsCountForPhone(lead, lead.phone) > 0 && (
                  <span className={styles.txtTally}>{smsCountForPhone(lead, lead.phone)}</span>
                )}
              </button>
            </div>
          </>
        )}

        {/* Txt Now for multi-phone leads */}
        {lead.phones?.length > 0 && (
          <button
            type="button"
            className={styles.txtBtnFull}
            onClick={handleTxtNow}
            disabled={isSmsBlocked(lead)}
          >
            {isSmsBlocked(lead) ? '💬 Text blocked' : '💬 Txt Now'}
            {(lead.smsCount ?? 0) > 0 && (
              <span className={styles.txtTally}>{lead.smsCount} sent</span>
            )}
          </button>
        )}

        <div className={styles.callActionRow} style={{ marginTop: 10 }}>
          {onShowInfo && (
            <button type="button" className={styles.txtBtn} onClick={() => onShowInfo(lead)}>
              Info
            </button>
          )}
          {lead.email && (
            <button
              type="button"
              className={styles.txtBtn}
              onClick={() => {
                const tpl = (emailTemplates ?? DEFAULT_EMAIL_TEMPLATES)[0];
                if (tpl) openEmailClient(lead, tpl, agentName || twilioConfig?.agentName);
              }}
            >
              Email
            </button>
          )}
        </div>
      </div>

      <TxtNowSheet
        open={txtOpen}
        onClose={() => setTxtOpen(false)}
        lead={lead}
        activePhone={activePhone}
        templates={twilioTemplates ?? []}
        config={twilioConfig}
        onSend={handleSmsSent}
        sending={smsSending}
        error={smsError}
      />

      {/* ── Appointment reminder (3 hrs before) ─────────────────────── */}
      {twilioReady && !isSmsBlocked(lead) && (
        <div className={styles.appointmentSection}>
          <p className={styles.appointmentLabel}>Appointment — auto-text 3 hours before</p>
          <input
            type="datetime-local"
            className={styles.appointmentInput}
            value={appointmentAt}
            onChange={(e) => setAppointmentAt(e.target.value)}
          />
          <div className={styles.appointmentActions}>
            <button
              type="button"
              className={styles.appointmentBtn}
              disabled={apptBusy || !appointmentAt}
              onClick={handleScheduleAppointment}
            >
              {apptBusy ? 'Scheduling…' : 'Schedule reminder'}
            </button>
            {lead.scheduledSmsSendAt && (
              <button
                type="button"
                className={styles.appointmentCancelBtn}
                disabled={apptBusy}
                onClick={handleCancelAppointment}
              >
                Cancel
              </button>
            )}
          </div>
          {lead.scheduledSmsSendAt && (
            <p className={styles.appointmentHint}>
              Text scheduled: {new Date(lead.scheduledSmsSendAt).toLocaleString()}
            </p>
          )}
          {apptMsg && (
            <p className={apptMsg.ok ? styles.apptOk : styles.apptErr}>{apptMsg.text}</p>
          )}
        </div>
      )}

      <LeadActivityTimeline
        leadId={lead?.id}
        fetchActivity={fetchLeadActivity}
        leadNotes={note}
      />

      {/* ── Outcome buttons ───────────────────────────────────────────── */}
      <div className={styles.outcomes}>
        <p className={styles.outcomesLabel}>Outcome</p>
        <div className={styles.outcomeGrid}>
          {OUTCOMES.map((o) => (
            <button
              key={o.id}
              className={`${styles.outcomeBtn} ${lastOutcome === o.id ? styles.outcomeBtnActive : ''}`}
              style={{ '--oc': o.color }}
              onClick={() => handleOutcome(o)}
            >
              <span className={styles.outcomeEmoji}>{o.emoji}</span>
              <span className={styles.outcomeLabel}>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <SellerDealPanel
        lead={lead}
        onUpdate={onUpdateLead}
        onSyncPortal={onSyncPortal}
      />

      {/* ── Notes ─────────────────────────────────────────────────────── */}
      <div className={styles.notesSection}>
        <label className={styles.notesLabel} htmlFor="dialer-notes">Notes</label>
        <textarea
          id="dialer-notes"
          className={styles.notes}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add notes about this call…"
          rows={3}
        />
      </div>

      {/* ── Photos ────────────────────────────────────────────────────── */}
      <PhotoSection
        lead={lead}
        onUploadPhoto={onUploadPhoto}
        onDeletePhoto={onDeletePhoto}
        onUpdateLead={onUpdateLead}
      />

      {/* ── Next button ───────────────────────────────────────────────── */}
      <button
        className={styles.nextBtn}
        onClick={handleNext}
        disabled={idx === total - 1}
      >
        Next Lead →
      </button>
    </div>
  );
}

// ── File upload section ───────────────────────────────────────────────────

function PhotoSection({ lead, onUploadPhoto, onDeletePhoto, onUpdateLead }) {
  const fileRef   = useRef(null);
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [currentFile,  setCurrentFile]  = useState('');
  const [error,        setError]        = useState(null);
  const [lightbox,     setLightbox]     = useState(null); // url to preview

  const files = lead.photos ?? [];

  async function handleFiles(e) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setError(null);

    for (const file of selected) {
      setUploading(true);
      setProgress(0);
      setCurrentFile(file.name);
      try {
        const rec = await onUploadPhoto(lead.id, file, setProgress);
        if (rec) {
          onUpdateLead(lead.id, { photos: [...(lead.photos ?? []), rec] });
        }
      } catch (err) {
        setError(err.message ?? 'Upload failed');
      }
    }
    setUploading(false);
    setCurrentFile('');
    e.target.value = '';
  }

  async function handleDelete(rec) {
    if (!window.confirm(`Delete "${rec.name}"?`)) return;
    await onDeletePhoto?.(rec.path);
    onUpdateLead(lead.id, { photos: (lead.photos ?? []).filter(p => p.url !== rec.url) });
  }

  return (
    <div className={styles.photoSection}>
      {/* Header */}
      <div className={styles.photoHeader}>
        <p className={styles.notesLabel}>
          Files &amp; Photos
          {files.length > 0 && <span className={styles.photoCount}>{files.length}</span>}
        </p>
        <button
          className={styles.addPhotoBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className={styles.miniSpinnerDark} />
              {progress}%
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Upload
            </>
          )}
        </button>
        {/* Accept all file types, no camera capture — lets user choose */}
        <input
          ref={fileRef}
          type="file"
          accept="*/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className={styles.uploadProgress}>
          <div className={styles.uploadProgressBar} style={{ width: `${progress}%` }} />
          <span className={styles.uploadProgressLabel}>
            Uploading {currentFile} — {progress}%
          </span>
        </div>
      )}

      {error && <p className={styles.photoError}>{error}</p>}

      {/* File grid */}
      {files.length > 0 && (
        <div className={styles.photoGrid}>
          {files.map((rec, i) => (
            <div key={rec.url ?? i} className={styles.photoThumb}>
              {isImage(rec.type) ? (
                <img
                  src={rec.url}
                  alt={rec.name}
                  className={styles.thumbImg}
                  onClick={() => setLightbox(rec.url)}
                />
              ) : (
                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileThumb}
                >
                  <span className={styles.fileThumbIcon}>{fileIcon(rec.type, rec.name)}</span>
                  <span className={styles.fileThumbName}>{rec.name}</span>
                  {rec.size && <span className={styles.fileThumbSize}>{formatSize(rec.size)}</span>}
                </a>
              )}
              <button
                className={styles.deletePhotoBtn}
                onClick={() => handleDelete(rec)}
                aria-label={`Delete ${rec.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for image preview */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Preview" className={styles.lightboxImg} />
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  );
}

function statusColor(status) {
  const map = {
    'New':            '#1f6feb',
    'Contacted':      '#f5a623',
    'Negotiating':    '#e8742a',
    'Under Contract': '#3fb950',
    'Dead':           '#30363d',
    'Closed':         '#1abc9c',
  };
  return map[status] ?? '#30363d';
}

function formatPhone(raw) {
  if (!raw) return '';
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  return raw;
}
