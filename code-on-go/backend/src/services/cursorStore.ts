import { randomUUID } from 'node:crypto';
import type { CursorChatMessage, CursorRun } from '@code-on-go/shared';

/** Local chat transcript per Cursor agent (mobile-friendly thread). */
export function createCursorStore() {
  const threads = new Map<string, CursorChatMessage[]>();

  function getMessages(agentId: string): CursorChatMessage[] {
    return threads.get(agentId) ?? [];
  }

  function addUserMessage(agentId: string, content: string, runId?: string): CursorChatMessage {
    const msg: CursorChatMessage = {
      id: randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      runId,
    };
    const list = getMessages(agentId);
    list.push(msg);
    threads.set(agentId, list);
    return msg;
  }

  function addStatusMessage(agentId: string, content: string, run: CursorRun): CursorChatMessage {
    const msg: CursorChatMessage = {
      id: randomUUID(),
      role: 'status',
      content,
      createdAt: new Date().toISOString(),
      runId: run.id,
      runStatus: run.status,
    };
    const list = getMessages(agentId);
    list.push(msg);
    threads.set(agentId, list);
    return msg;
  }

  function addAssistantMessage(agentId: string, content: string, run: CursorRun): CursorChatMessage {
    const msg: CursorChatMessage = {
      id: randomUUID(),
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
      runId: run.id,
      runStatus: run.status,
    };
    const list = getMessages(agentId);
    list.push(msg);
    threads.set(agentId, list);
    return msg;
  }

  function formatRunReply(run: CursorRun): string {
    if (run.result) return run.result;
    if (run.status === 'ERROR') return 'The agent run failed. Try again or check Cursor dashboard.';
    if (run.status === 'CANCELLED') return 'Run was cancelled.';
    if (run.status === 'EXPIRED') return 'Run expired.';
    return 'Done.';
  }

  function formatGitFooter(run: CursorRun): string {
    const branches = run.git?.branches ?? [];
    if (!branches.length) return '';
    const lines = branches.map((b) => {
      const parts = [b.branch, b.prUrl].filter(Boolean);
      return parts.join(' · ');
    });
    return `\n\n—\n${lines.join('\n')}`;
  }

  return {
    getMessages,
    addUserMessage,
    addStatusMessage,
    addAssistantMessage,
    formatRunReply,
    formatGitFooter,
  };
}

export type CursorStore = ReturnType<typeof createCursorStore>;
