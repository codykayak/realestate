import { randomUUID } from 'node:crypto';
import type { ChatMessage, FileChange, LlmProvider } from '@code-on-go/shared';
import type { UserSecrets } from './store.js';
import { AppError } from '../lib/errors.js';

export interface LlmContext {
  repoId: string;
  files: Record<string, string>;
  history: ChatMessage[];
  userMessage: string;
  provider: LlmProvider;
  secrets: UserSecrets;
}

export interface LlmResult {
  assistantMessage: ChatMessage;
  proposedChanges: FileChange[];
}

/**
 * Routes to the selected provider. MVP returns a stub response;
 * wire real SDK calls (Anthropic, Google AI, xAI, Moonshot) here.
 */
export async function runAgent(ctx: LlmContext): Promise<LlmResult> {
  const apiKey = ctx.secrets.llmKeys[ctx.provider];
  if (!apiKey) {
    throw new AppError(
      `No API key configured for ${ctx.provider}`,
      400,
      'MISSING_LLM_KEY',
    );
  }

  // TODO: replace stub with provider-specific API calls
  const fileCount = Object.keys(ctx.files).length;
  const reply = [
    `(${ctx.provider}) Received your request about "${ctx.userMessage.slice(0, 80)}".`,
    `I can see ${fileCount} mirrored file(s) from ${ctx.repoId}.`,
    'When wired to the real API, I will propose edits here for your approval.',
  ].join('\n\n');

  const assistantMessage: ChatMessage = {
    id: randomUUID(),
    role: 'assistant',
    content: reply,
    createdAt: new Date().toISOString(),
    provider: ctx.provider,
  };

  // Example proposed change for approve/reject flow testing
  const proposedChanges: FileChange[] = ctx.userMessage.toLowerCase().includes('readme')
    ? [
        {
          path: 'README.md',
          action: 'update',
          preview: `# ${ctx.repoId}\n\nUpdated via Code on Go (${ctx.provider}).\n`,
        },
      ]
    : [];

  return { assistantMessage, proposedChanges };
}
