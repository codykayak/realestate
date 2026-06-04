import { useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import styles from '../pm.module.css';

export default function KnowledgeBase() {
  const { knowledge, upsertKnowledge, removeKnowledge } = usePm();
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState({ question: '', answer: '', tags: '' });

  function startNew() {
    setForm({ question: '', answer: '', tags: '' });
    setEditing('new');
  }
  function startEdit(entry) {
    setForm({ question: entry.question, answer: entry.answer, tags: (entry.tags || []).join(', ') });
    setEditing(entry.id);
  }
  function save(e) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    upsertKnowledge({
      id: editing === 'new' ? undefined : editing,
      question: form.question.trim(),
      answer: form.answer.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setEditing(null);
  }

  return (
    <Page
      title="Knowledge Base"
      subtitle="The per-property source of truth that powers every AI answer"
      actions={<button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startNew}><Icon name="plus" size={15} /> Add entry</button>}
    >
      {editing && (
        <form className={styles.card} style={{ marginBottom: 18 }} onSubmit={save}>
          <div className={styles.field}><label className={styles.label}>Question / topic</label><input className={styles.input} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="e.g. What are the gym hours?" /></div>
          <div className={styles.field}><label className={styles.label}>Answer the AI should give</label><textarea className={styles.textarea} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
          <div className={styles.field}><label className={styles.label}>Tags (comma-separated keywords for matching)</label><input className={styles.input} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="gym, fitness, hours, amenity" /></div>
          <div className={styles.rowWrap}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">Save</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.list}>
        {knowledge.length === 0 && <div className={styles.empty}>No knowledge-base entries yet.</div>}
        {knowledge.map((entry) => (
          <div key={entry.id} className={styles.listItem} style={{ cursor: 'default', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <div className={styles.itemTitle}>{entry.question}</div>
              <div className={styles.itemSub} style={{ marginTop: 4, whiteSpace: 'normal' }}>{entry.answer}</div>
              <div className={styles.rowWrap} style={{ marginTop: 6 }}>
                {(entry.tags || []).map((t) => <span key={t} className={`${styles.badge} ${styles.badgeGray}`}>{t}</span>)}
              </div>
            </div>
            <div className={styles.row} style={{ flexShrink: 0 }}>
              <button className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => startEdit(entry)}>Edit</button>
              <button className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost} ${styles.btnDanger}`} onClick={() => removeKnowledge(entry.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
