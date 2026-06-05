import type { LlmProvider } from './types.js';

export const LLM_PROVIDERS: Array<{
  id: LlmProvider;
  label: string;
  keyPlaceholder: string;
}> = [
  { id: 'anthropic', label: 'Claude (Anthropic)', keyPlaceholder: 'sk-ant-...' },
  { id: 'gemini', label: 'Gemini (Google)', keyPlaceholder: 'AIza...' },
  { id: 'grok', label: 'Grok (xAI)', keyPlaceholder: 'xai-...' },
  { id: 'kimi', label: 'Kimi (Moonshot)', keyPlaceholder: 'sk-...' },
];

export const API_VERSION = 'v1';
