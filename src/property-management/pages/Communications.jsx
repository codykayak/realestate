import { useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import { answerInquiry } from '../lib/faqEngine';
import { now } from '../data/store';
import styles from '../pm.module.css';

const STATUS_BADGE = {
  'auto-resolved': { cls: styles.badgeGreen, label: 'Auto-resolved' },
  'needs-human': { cls: styles.badgeAmber, label: 'Needs staff' },
  'staff-replied': { cls: styles.badgeBlue, label: 'Staff replied' },
};

export default function Communications() {
  const { conversations, upsertConversation, knowledge, featureMap, residents } = usePm();
  const cfg = featureMap.communications?.config || {};
  const [autoPilot, setAutoPilot] = useState(cfg.autoPilot !== false);
  const [selectedId, setSelectedId] = useState(conversations[0]?.id || null);
  const [draft, setDraft] = useState('');

  // Simulate inbound resident message
  const [simName, setSimName] = useState(residents[0]?.name || 'New Resident');
  const [simChannel, setSimChannel] = useState('sms');
  const [simText, setSimText] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  async function handleSimulate(e) {
    e.preventDefault();
    if (!simText.trim()) return;
    const ts = now();
    const messages = [{ from: 'resident', text: simText.trim(), at: ts }];
    let status = 'needs-human';

    const result = await answerInquiry({
      text: simText.trim(),
      knowledge,
      threshold: cfg.confidenceThreshold ?? 0.6,
    });
    setLastResult(result);

    if (autoPilot && result.route === 'auto' && result.answer) {
      messages.push({ from: 'ai', text: result.answer, at: ts + 2000, confidence: result.confidence });
      status = 'auto-resolved';
    }

    const conv = upsertConversation({
      resident: simName,
      channel: simChannel,
      status,
      messages,
      createdAt: ts,
    });
    setSelectedId(conv.id);
    setSimText('');
  }

  function sendStaffReply() {
    if (!draft.trim() || !selected) return;
    const messages = [...selected.messages, { from: 'staff', text: draft.trim(), at: now() }];
    upsertConversation({ ...selected, messages, status: 'staff-replied' });
    setDraft('');
  }

  return (
    <Page
      title="AI Resident Communication"
      subtitle="Unified SMS + email inbox with knowledge-base auto-responses and human handoff"
      actions={
        <div className={styles.rowWrap}>
          <span className={styles.hint}>Auto-pilot</span>
          <div
            className={`${styles.toggle} ${autoPilot ? styles.toggleOn : ''}`}
            onClick={() => setAutoPilot((v) => !v)}
            role="switch"
            aria-checked={autoPilot}
          >
            <span className={styles.toggleKnob} />
          </div>
        </div>
      }
    >
      {/* Simulator */}
      <div className={styles.card} style={{ marginBottom: 18 }}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}><Icon name="spark" size={15} /> Test the AI — send a resident message</span>
        </div>
        <form onSubmit={handleSimulate} className={styles.rowWrap} style={{ alignItems: 'flex-end' }}>
          <div style={{ width: 170 }}>
            <label className={styles.label}>From</label>
            <select className={styles.select} value={simName} onChange={(e) => setSimName(e.target.value)}>
              {residents.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              <option value="Prospective Renter">Prospective Renter</option>
            </select>
          </div>
          <div style={{ width: 110 }}>
            <label className={styles.label}>Channel</label>
            <select className={styles.select} value={simChannel} onChange={(e) => setSimChannel(e.target.value)}>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className={styles.label}>Message</label>
            <input
              className={styles.input}
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
              placeholder="e.g. what time does the pool close? / I want to file a noise complaint"
            />
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">Send</button>
        </form>
        {lastResult && (
          <div className={`${styles.banner} ${lastResult.route === 'human' ? styles.bannerRed : ''}`} style={{ marginTop: 12 }}>
            <Icon name={lastResult.route === 'auto' ? 'check' : 'alert'} size={16} style={{ marginTop: 1 }} />
            <div>
              <strong>{lastResult.route === 'auto' ? 'Auto-answered' : 'Routed to staff'}</strong>{' '}
              — confidence {(lastResult.confidence * 100).toFixed(0)}%. {lastResult.reason}
              {lastResult.sensitiveIntent && (
                <> <span className={`${styles.badge} ${styles.badgeRed}`} style={{ marginLeft: 6 }}>{lastResult.sensitiveIntent}</span></>
              )}
            </div>
          </div>
        )}
        <div className={styles.hint} style={{ marginTop: 10 }}>
          Sensitive topics (complaints, legal, Fair Housing, emergencies, financial hardship) are <strong>always</strong> routed to staff — never auto-answered. This is a compliance guardrail.
        </div>
      </div>

      {/* Inbox */}
      <div className={styles.inbox}>
        <div className={styles.list}>
          {conversations.length === 0 && <div className={styles.empty}>No conversations yet.</div>}
          {conversations.map((c) => {
            const badge = STATUS_BADGE[c.status] || STATUS_BADGE['needs-human'];
            const last = c.messages[c.messages.length - 1];
            return (
              <div
                key={c.id}
                className={`${styles.listItem} ${c.id === selectedId ? styles.listItemActive : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div style={{ minWidth: 0 }}>
                  <div className={styles.itemTitle}>{c.resident}</div>
                  <div className={styles.itemSub} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {last?.text}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`${styles.badge} ${styles.badgeGray}`} style={{ marginBottom: 4 }}>{c.channel}</span>
                  <div className={`${styles.badge} ${badge.cls}`}>{badge.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.card}>
          {!selected ? (
            <div className={styles.empty}>Select a conversation.</div>
          ) : (
            <>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>{selected.resident} · {selected.channel.toUpperCase()}</span>
                <span className={`${styles.badge} ${(STATUS_BADGE[selected.status] || STATUS_BADGE['needs-human']).cls}`}>
                  {(STATUS_BADGE[selected.status] || STATUS_BADGE['needs-human']).label}
                </span>
              </div>
              <div className={styles.thread}>
                {selected.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.bubble} ${m.from === 'resident' ? styles.bubbleIn : m.from === 'ai' ? styles.bubbleAi : styles.bubbleStaff}`}
                  >
                    {m.text}
                    <div className={styles.bubbleMeta}>
                      {m.from === 'ai' ? `AI · ${(m.confidence != null ? Math.round(m.confidence * 100) : 0)}% confidence` : m.from === 'staff' ? 'Staff' : 'Resident'}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.divider} />
              <div className={styles.rowWrap}>
                <input
                  className={styles.input}
                  style={{ flex: 1 }}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a staff reply…"
                  onKeyDown={(e) => e.key === 'Enter' && sendStaffReply()}
                />
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={sendStaffReply}>Reply</button>
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
