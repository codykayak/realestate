import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import styles from '../pm.module.css';
import devStyles from './developerAdmin.module.css';
import { KNOWLEDGE_ARTICLES, getArticle } from './devKnowledgeIndex';
import { renderMarkdown } from './markdownRender';
import {
  answerLocally,
  answerWithOpenAI,
  getStoredApiKey,
  setStoredApiKey,
} from './devAssistant';
import {
  triageWithOverrides,
  loadMaintenanceOverrides,
  saveMaintenanceOverrides,
  clearMaintenanceOverrides,
  DEFAULT_OVERRIDE_TEMPLATE,
} from './triagePlayground';
import APP_CONFIG from '../config/appConfig';
const PitchPage = lazy(() => import('./PitchPage'));

const TABS = [
  { id: 'pitch', label: 'Enterprise pitch' },
  { id: 'docs', label: 'Knowledge base' },
  { id: 'assistant', label: 'AI assistant' },
  { id: 'triage', label: 'Triage playground' },
  { id: 'config', label: 'Deployment config' },
  { id: 'cursor', label: 'Cursor & repo' },
];

const SUGGESTED_QUESTIONS = [
  'When maintenance shows Dispatched, where does it go?',
  'What happens when Yardi is connected?',
  'How do I change the logo and branding?',
  'How do I program where work orders are routed?',
  'What data is stored and how do I enable Firestore?',
];

export default function DeveloperAdmin() {
  const { config, featureMap, integrations, workOrders } = usePm();
  const [tab, setTab] = useState('pitch');
  const [articleId, setArticleId] = useState(KNOWLEDGE_ARTICLES[0]?.id || '00-overview');
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [useAi, setUseAi] = useState(!!getStoredApiKey());
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [triageText, setTriageText] = useState('I smell gas in the kitchen');
  const [overrideJson, setOverrideJson] = useState(
    () => JSON.stringify(loadMaintenanceOverrides() || DEFAULT_OVERRIDE_TEMPLATE, null, 2),
  );

  const article = useMemo(() => getArticle(articleId), [articleId]);
  const articleHtml = useMemo(() => renderMarkdown(article.body), [article.body]);

  const envBlock = useMemo(() => {
    const c = { ...APP_CONFIG, ...config };
    return `# HiveOps white-label — paste into .env.local
VITE_PM_PRODUCT_NAME=${c.productName}
VITE_PM_PRODUCT_TAGLINE=${c.productTagline || ''}
VITE_PM_COMPANY_NAME=${c.companyName}
VITE_PM_LOGO=${c.logo}
VITE_PM_ACCENT=${c.accent}
VITE_PM_ACCENT_SOFT=${c.accentSoft}
VITE_PM_BASE_PATH=${c.basePath}
VITE_PM_DEFAULT_TENANT=${APP_CONFIG.defaultTenantId}
VITE_PM_SUPPORT_EMAIL=${c.supportEmail || ''}
`;
  }, [config]);

  const ask = useCallback(async (q) => {
    const text = (q || question).trim();
    if (!text) return;
    setQuestion('');
    setChat((prev) => [...prev, { role: 'user', text }]);
    setAsking(true);
    try {
      const res = useAi && apiKey.trim()
        ? await answerWithOpenAI(text, apiKey)
        : await answerLocally(text);
      setChat((prev) => [
        ...prev,
        { role: 'assistant', text: res.answer, sources: res.sources, mode: res.mode },
      ]);
    } finally {
      setAsking(false);
    }
  }, [question, useAi, apiKey]);

  function copyEnv() {
    navigator.clipboard?.writeText(envBlock);
  }

  function copyCursorContext() {
    const ctx = `# HiveOps dev context — ${new Date().toISOString()}

## Question / task
${question || '(add your task here)'}

## Current deployment config
${envBlock}

## Maintenance feature config
${JSON.stringify(featureMap.maintenance?.config || {}, null, 2)}

## Integrations status
${JSON.stringify(integrations, null, 2)}

## Open work orders (sample)
${JSON.stringify(workOrders.slice(0, 3), null, 2)}

## Relevant documentation excerpt
${article.body.slice(0, 4000)}
`;
    navigator.clipboard?.writeText(ctx);
  }

  function saveOverrides() {
    try {
      const parsed = JSON.parse(overrideJson);
      saveMaintenanceOverrides(parsed);
      alert('Saved dev triage overrides to localStorage (pm:dev:maintenanceOverrides).');
    } catch (e) {
      alert(`Invalid JSON: ${e.message}`);
    }
  }

  const triageResult = triageWithOverrides(triageText, featureMap.maintenance?.config || {});

  return (
    <Page
      title="Developer Admin"
      subtitle="Internal knowledge base, AI assistant, and customization tools — not shown to property managers"
    >
      <div className={devStyles.devWrap}>
        <div className={devStyles.devBanner}>
          <Icon name="shield" size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Engineering only.</strong> This area documents how HiveOps works under the hood.
            Customer-facing pages are unchanged except for this link. Key finding: <strong>Dispatched</strong> is a
            status label only — implement dispatch via Cloud Functions + PMS/notifications (see Maintenance Dispatch guide).
          </div>
        </div>

        <div className={devStyles.devTabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? devStyles.devTabActive : devStyles.devTab}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'pitch' && (
          <Suspense fallback={<div className={styles.hint}>Loading enterprise pitch…</div>}>
            <PitchPage />
          </Suspense>
        )}

        {tab === 'docs' && (
          <div className={devStyles.devLayout}>
            <nav className={devStyles.docNav}>
              {KNOWLEDGE_ARTICLES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={articleId === a.id ? devStyles.docNavActive : devStyles.docNavItem}
                  onClick={() => setArticleId(a.id)}
                >
                  {a.title.length > 36 ? `${a.title.slice(0, 34)}…` : a.title}
                </button>
              ))}
            </nav>
            <div
              className={devStyles.docBody}
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          </div>
        )}

        {tab === 'assistant' && (
          <div className={devStyles.chatPanel}>
            <div className={styles.card}>
              <div className={styles.rowWrap} style={{ alignItems: 'center', marginBottom: 12 }}>
                <span className={styles.hint}>Mode</span>
                <div
                  className={`${styles.toggle} ${useAi ? styles.toggleOn : ''}`}
                  onClick={() => setUseAi((v) => !v)}
                  role="switch"
                  aria-checked={useAi}
                >
                  <span className={styles.toggleKnob} />
                </div>
                <span className={styles.hint}>{useAi ? 'OpenAI (optional)' : 'Local doc search'}</span>
              </div>
              {useAi && (
                <div className={styles.field}>
                  <label className={styles.label}>OpenAI API key (session only — never committed)</label>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="sk-…"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setStoredApiKey(e.target.value);
                    }}
                  />
                </div>
              )}
            </div>

            <div className={devStyles.chatLog}>
              {chat.length === 0 && (
                <div className={styles.hint}>
                  Ask anything about dispatch, Yardi, branding, or customization. Suggested:
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SUGGESTED_QUESTIONS.map((sq) => (
                      <button
                        key={sq}
                        type="button"
                        className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
                        onClick={() => ask(sq)}
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={devStyles.chatMsg}>
                  <div className={m.role === 'user' ? devStyles.chatUser : devStyles.chatBot}>
                    {m.role === 'user' ? 'You' : `Assistant${m.mode ? ` · ${m.mode}` : ''}`}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  {m.sources?.length > 0 && (
                    <div className={devStyles.sourcePills}>
                      {m.sources.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={devStyles.sourcePill}
                          onClick={() => { setTab('docs'); setArticleId(s.id); }}
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={devStyles.chatInputRow}>
              <input
                className={`${styles.input} ${devStyles.chatInput}`}
                placeholder="e.g. How do we program where dispatched work orders go?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !asking && ask()}
              />
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={asking}
                onClick={() => ask()}
              >
                {asking ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </div>
        )}

        {tab === 'triage' && (
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Test maintenance triage</div>
              <div className={styles.field}>
                <label className={styles.label}>Resident message</label>
                <textarea
                  className={styles.textarea}
                  value={triageText}
                  onChange={(e) => setTriageText(e.target.value)}
                />
              </div>
              <div className={`${styles.banner} ${triageResult.isEmergency ? styles.bannerRed : ''}`}>
                <strong>Category:</strong> {triageResult.category} · <strong>Priority:</strong> {triageResult.priority}
                <br />
                <strong>Status:</strong> {triageResult.recommendedStatus} · <strong>Routing (display only):</strong> {triageResult.routing}
                {triageResult.selfHelp && (
                  <>
                    <br />
                    <strong>Self-help:</strong> {triageResult.selfHelp}
                  </>
                )}
                {triageResult.devNote && (
                  <>
                    <br />
                    <em>{triageResult.devNote}</em>
                  </>
                )}
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Dev override rules (localStorage)</div>
              <p className={styles.hint}>
                Prototype per-client emergency keywords before wiring Firestore. Does not change the live Maintenance page until integrated into <code>maintenanceTriage.js</code> or tenant config.
              </p>
              <textarea
                className={styles.textarea}
                rows={12}
                value={overrideJson}
                onChange={(e) => setOverrideJson(e.target.value)}
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              />
              <div className={styles.rowWrap} style={{ marginTop: 10 }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={saveOverrides}>
                  Save overrides
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => {
                    clearMaintenanceOverrides();
                    setOverrideJson(JSON.stringify(DEFAULT_OVERRIDE_TEMPLATE, null, 2));
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div>
            <p className={styles.hint} style={{ marginBottom: 12 }}>
              White-label the property-management app per deployment. Logo path must exist under <code>public/</code>. Rebuild after changing env vars.
            </p>
            <div className={devStyles.configGrid}>
              <div className={styles.card}>
                <div className={styles.metricLabel}>Preview</div>
                <div className={styles.row} style={{ marginTop: 10 }}>
                  {config.logo ? <img src={config.logo} alt="" style={{ height: 36 }} /> : null}
                  <div>
                    <div style={{ fontWeight: 700 }}>{config.productName}</div>
                    <div className={styles.hint}>{config.companyName}</div>
                  </div>
                </div>
              </div>
              <pre className={devStyles.configBlock}>{envBlock}</pre>
            </div>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 12 }} onClick={copyEnv}>
              Copy .env block
            </button>
          </div>
        )}

        {tab === 'cursor' && (
          <div className={devStyles.cursorCard}>
            <div className={styles.cardTitle}>Work with Cursor</div>
            <p className={styles.hint}>
              Cursor cannot be embedded in this page (iframe blocked by cursor.com security headers). Use Cloud Agents on the repo instead.
            </p>
            <div className={devStyles.cursorLinks}>
              <a href="https://github.com/codykayak/realestate" target="_blank" rel="noreferrer">
                GitHub — codykayak/realestate
              </a>
              <a
                href="https://cursor.com/agents?repo=codykayak/realestate"
                target="_blank"
                rel="noreferrer"
              >
                Open in Cursor Cloud Agents
              </a>
              <a
                href="https://github.com/codykayak/realestate/tree/main/src/property-management"
                target="_blank"
                rel="noreferrer"
              >
                property-management folder
              </a>
            </div>
            <p className={devStyles.iframeNote}>
              Tip: Run a Cloud Agent with prompt &quot;Read src/property-management/developer-admin/knowledge/ and implement dispatch webhooks for workOrders.status === dispatched&quot;.
            </p>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 16 }} onClick={copyCursorContext}>
              Copy context for Cursor
            </button>
            <p className={styles.hint} style={{ marginTop: 10 }}>
              Pastes current config, integration status, sample work orders, and the open doc into your clipboard for a Cursor chat or agent task.
            </p>
          </div>
        )}
      </div>
    </Page>
  );
}
