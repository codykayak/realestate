/**
 * Developer knowledge base index — loads markdown guides and powers search + AI context.
 */

const modules = import.meta.glob('./knowledge/*.md', { eager: true, query: '?raw', import: 'default' });

function moduleRaw(value) {
  if (typeof value === 'string') return value;
  if (value != null && typeof value.default === 'string') return value.default;
  return String(value ?? '');
}

function slugFromPath(path) {
  const name = path.split('/').pop() || '';
  return name.replace(/\.md$/, '');
}

function titleFromMarkdown(raw, slug) {
  const m = raw.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : slug;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/** @type {{ id: string, title: string, body: string, tokens: Set<string> }[]} */
export const KNOWLEDGE_ARTICLES = Object.entries(modules)
  .map(([path, raw]) => {
    const id = slugFromPath(path);
    const body = moduleRaw(raw);
    return {
      id,
      title: titleFromMarkdown(body, id),
      body,
      tokens: new Set(tokenize(body)),
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const FALLBACK_ARTICLE = {
  id: 'readme',
  title: 'Developer docs',
  body: '# Developer documentation\n\nKnowledge articles failed to load. Check the build includes developer-admin/knowledge/*.md.',
  tokens: new Set(),
};

export function getArticle(id) {
  return KNOWLEDGE_ARTICLES.find((a) => a.id === id) ?? KNOWLEDGE_ARTICLES[0] ?? FALLBACK_ARTICLE;
}

/**
 * Simple keyword search over all articles.
 * @returns {{ article: object, score: number, snippet: string }[]}
 */
export function searchKnowledge(query, limit = 8) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];

  const results = [];
  for (const article of KNOWLEDGE_ARTICLES) {
    let score = 0;
    const lower = article.body.toLowerCase();
    for (const tok of qTokens) {
      if (article.tokens.has(tok)) score += 2;
      if (lower.includes(tok)) score += 1;
    }
    if (article.title.toLowerCase().includes(query.toLowerCase())) score += 5;
    if (score > 0) {
      const idx = lower.indexOf(qTokens[0]);
      const snippet = idx >= 0
        ? article.body.slice(Math.max(0, idx - 40), idx + 120).replace(/\n/g, ' ')
        : article.body.slice(0, 160);
      results.push({ article, score, snippet: `${snippet}…` });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Build context block for LLM or Cursor export. */
export function buildContextForQuery(query, maxChars = 12000) {
  const hits = searchKnowledge(query, 5);
  const parts = hits.map((h) => `## ${h.article.title}\n\n${h.article.body}`);
  let text = parts.join('\n\n---\n\n');
  if (text.length > maxChars) text = `${text.slice(0, maxChars)}\n\n[truncated]`;
  return { hits, text };
}

export function allArticlesMarkdown() {
  return KNOWLEDGE_ARTICLES.map((a) => a.body).join('\n\n---\n\n');
}
