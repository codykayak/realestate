/**
 * Knowledge-base FAQ deflection engine.
 *
 * This is the AI-ready interface for resident inquiry deflection. Today it
 * uses a transparent keyword/intent scorer over the property knowledge base
 * so it runs entirely client-side with no API keys. The function signature is
 * intentionally async and provider-agnostic: swapping in a real LLM +
 * retrieval (RAG over the same knowledge base) later means replacing the body
 * of `answerInquiry` only — every caller stays the same.
 *
 * It also flags sensitive intents that must always route to a human
 * (Fair Housing, complaints, legal, eviction, ADA, emergencies), which is a
 * hard compliance requirement, not an optimization.
 */

const SENSITIVE_PATTERNS = [
  { intent: 'complaint', re: /\b(complain|complaint|noise|loud|harass|neighbor|unfair|angry|upset|disturb)\b/i },
  { intent: 'legal', re: /\b(evict|eviction|lawyer|attorney|sue|lawsuit|legal|notice to vacate|lease break|break my lease)\b/i },
  { intent: 'discrimination', re: /\b(discriminat|fair housing|race|religion|disab|service animal|emotional support|ada|accommodat)\b/i },
  { intent: 'emergency', re: /\b(fire|flood|flooding|gas|smoke|carbon monoxide|no heat|burst|sewage|break in|broke in|emergency|locked out|lockout)\b/i },
  { intent: 'financial-hardship', re: /\b(can'?t pay|cannot pay|lost my job|behind on rent|payment plan|eviction)\b/i },
];

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'you', 'how', 'what', 'when', 'where', 'can',
  'does', 'did', 'will', 'with', 'this', 'that', 'have', 'has', 'was', 'get',
  'about', 'from', 'your', 'our', 'out', 'all', 'any', 'into', 'now',
]);

/** Score one KB entry against the inquiry tokens. */
function scoreEntry(entry, tokens) {
  const haystack = new Set([
    ...tokenize(entry.question),
    ...(entry.tags || []).flatMap((t) => tokenize(t)),
  ]);
  let hits = 0;
  let tagHits = 0;
  const tagSet = new Set((entry.tags || []).map((t) => t.toLowerCase()));
  for (const tok of tokens) {
    if (STOPWORDS.has(tok)) continue;
    if (haystack.has(tok)) hits += 1;
    if (tagSet.has(tok)) tagHits += 1;
  }
  const meaningful = tokens.filter((t) => !STOPWORDS.has(t));
  const coverage = meaningful.length ? hits / meaningful.length : 0;
  // Weight tag matches higher — they are the curated intent signals.
  return coverage + tagHits * 0.15;
}

export function detectSensitive(text) {
  for (const { intent, re } of SENSITIVE_PATTERNS) {
    if (re.test(text)) return intent;
  }
  return null;
}

/**
 * @returns {Promise<{
 *   answer: string|null,
 *   confidence: number,
 *   matchedId: string|null,
 *   route: 'auto'|'human',
 *   reason: string,
 *   sensitiveIntent: string|null,
 * }>}
 */
export async function answerInquiry({ text, knowledge = [], threshold = 0.6 }) {
  const sensitiveIntent = detectSensitive(text);
  if (sensitiveIntent) {
    return {
      answer: null,
      confidence: 0,
      matchedId: null,
      route: 'human',
      reason: `Sensitive intent (${sensitiveIntent}) — always routed to staff.`,
      sensitiveIntent,
    };
  }

  const tokens = tokenize(text);
  let best = null;
  let bestScore = 0;
  for (const entry of knowledge) {
    const score = scoreEntry(entry, tokens);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // Normalize a fuzzy score into a 0..1 confidence (capped).
  const confidence = Math.min(1, Math.round(bestScore * 100) / 100);

  if (best && confidence >= threshold) {
    return {
      answer: best.answer,
      confidence,
      matchedId: best.id,
      route: 'auto',
      reason: 'High-confidence knowledge-base match.',
      sensitiveIntent: null,
    };
  }

  return {
    answer: null,
    confidence,
    matchedId: best?.id ?? null,
    route: 'human',
    reason: confidence > 0 ? 'Low-confidence match — routed to staff.' : 'No knowledge-base match — routed to staff.',
    sensitiveIntent: null,
  };
}

export default answerInquiry;
