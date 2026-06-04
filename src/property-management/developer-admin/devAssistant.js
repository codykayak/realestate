/**
 * Developer Admin assistant — local knowledge search + optional OpenAI chat.
 * Keys are never persisted to the repo; optional sessionStorage for dev sessions only.
 */

import { buildContextForQuery, searchKnowledge } from './devKnowledgeIndex';

const SESSION_KEY = 'pm:dev:openaiKey';

export function getStoredApiKey() {
  try {
    return sessionStorage.getItem(SESSION_KEY) || import.meta.env.VITE_PM_DEV_OPENAI_API_KEY || '';
  } catch {
    return import.meta.env.VITE_PM_DEV_OPENAI_API_KEY || '';
  }
}

export function setStoredApiKey(key) {
  try {
    if (key) sessionStorage.setItem(SESSION_KEY, key);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Answer using local knowledge only (no API cost).
 */
export async function answerLocally(question) {
  const { hits, text } = buildContextForQuery(question);
  if (!hits.length) {
    return {
      answer: 'No matching topics in the developer knowledge base. Try keywords like "dispatched", "Yardi", "logo", or "Firestore".',
      sources: [],
      mode: 'local',
    };
  }

  const bullets = hits.map((h) => {
    const section = h.article.body.split('\n').find((l) => l.startsWith('## ')) || '';
    return `**${h.article.title}** — ${h.snippet}${section ? `\n(${section.replace(/^##\s+/, '')})` : ''}`;
  });

  return {
    answer: `Here is what the internal docs say about "${question}":\n\n${bullets.join('\n\n')}\n\n---\n\nOpen the **${hits[0].article.title}** article in the sidebar for the full guide.`,
    sources: hits.map((h) => ({ id: h.article.id, title: h.article.title })),
    mode: 'local',
  };
}

/**
 * Optional OpenAI chat with retrieved doc context.
 */
export async function answerWithOpenAI(question, apiKey) {
  const key = apiKey || getStoredApiKey();
  if (!key?.trim()) {
    return answerLocally(question);
  }

  const { text, hits } = buildContextForQuery(question, 14000);

  const system = `You are the Macro REI Property Management developer assistant for engineers working on macrorei.com/property-management.
Answer using ONLY the documentation below. If the docs say a feature is stubbed or not wired, say so clearly.
Be specific about file paths under src/property-management/. Mention when "dispatched" is label-only with no external dispatch.
Documentation:\n\n${text}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: question },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    const fallback = await answerLocally(question);
    return {
      ...fallback,
      answer: `${fallback.answer}\n\n*(OpenAI request failed: ${res.status} — ${err.slice(0, 200)}. Using local search.)*`,
      mode: 'local-fallback',
    };
  }

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content || 'No response.';
  return {
    answer,
    sources: hits.map((h) => ({ id: h.article.id, title: h.article.title })),
    mode: 'openai',
  };
}

export { searchKnowledge };
