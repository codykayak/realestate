import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = dirname(fileURLToPath(import.meta.url));

let knowledgeCache = null;

function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  const path = join(__dirname, '../data/pm-knowledge.txt');
  try {
    knowledgeCache = readFileSync(path, 'utf8');
  } catch {
    knowledgeCache = 'ManyDoors AI is AI property management software. Demo: https://www.macrorei.com/property-management';
  }
  return knowledgeCache;
}

const SYSTEM_PROMPT = (knowledge) => `You are the ManyDoors AI website assistant on macrorei.com/property-management.
Answer questions using ONLY the site knowledge below. Be concise, friendly, and accurate.
If the answer is not in the knowledge base, say you are not sure and suggest emailing info@manydoorsai.com.
Never invent pricing, legal advice, or features not described in the knowledge.

SITE KNOWLEDGE:
${knowledge}`;

/**
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @returns {Promise<string>}
 */
export async function runPmGeminiChat(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const sanitized = (messages || []).filter(
    (m) => m && (m.role === 'user' || m.role === 'assistant') && m.content?.trim(),
  );
  if (!sanitized.length) {
    throw new Error('A user message is required.');
  }

  const last = sanitized[sanitized.length - 1];
  if (last.role !== 'user') {
    throw new Error('The last message must be from the user.');
  }

  const history = sanitized.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content.trim() }],
  }));

  const knowledge = loadKnowledge();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT(knowledge),
  });

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(last.content.trim());
  const text = result?.response?.text?.();
  if (!text) throw new Error('Empty response from Gemini.');
  return text.trim();
}
