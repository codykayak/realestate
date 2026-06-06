import type {
  AgentSession,
  ChatMessage,
  FileChange,
  LlmProvider,
  OnboardingPayload,
  RepoLink,
} from '@code-on-go/shared';
import { randomUUID } from 'node:crypto';

/** In-memory store for local dev. Swap for Firestore in production. */
export interface UserSecrets {
  githubPat: string;
  llmKeys: Partial<Record<LlmProvider, string>>;
}

export interface DataStore {
  saveOnboarding(userId: string, payload: OnboardingPayload): Promise<void>;
  getSecrets(userId: string): Promise<UserSecrets | null>;
  listRepos(userId: string): Promise<RepoLink[]>;
  createSession(
    userId: string,
    repoId: string,
    provider: LlmProvider,
    title?: string,
  ): Promise<AgentSession>;
  getSession(userId: string, sessionId: string): Promise<AgentSession | null>;
  listSessions(userId: string): Promise<AgentSession[]>;
  addMessage(userId: string, sessionId: string, message: ChatMessage): Promise<void>;
  listMessages(userId: string, sessionId: string): Promise<ChatMessage[]>;
  setPendingChanges(
    userId: string,
    sessionId: string,
    changes: FileChange[],
  ): Promise<AgentSession>;
  updateSession(userId: string, session: AgentSession): Promise<void>;
  mirrorRepoFiles(
    userId: string,
    repoId: string,
    files: Record<string, string>,
  ): Promise<void>;
  getMirroredFiles(userId: string, repoId: string): Promise<Record<string, string>>;
}

function now(): string {
  return new Date().toISOString();
}

export function createInMemoryStore(): DataStore {
  const secrets = new Map<string, UserSecrets>();
  const repos = new Map<string, RepoLink[]>();
  const sessions = new Map<string, AgentSession>();
  const messages = new Map<string, ChatMessage[]>();
  const mirrors = new Map<string, Record<string, string>>();

  const sessionKey = (userId: string, sessionId: string) => `${userId}:${sessionId}`;
  const mirrorKey = (userId: string, repoId: string) => `${userId}:${repoId}`;

  return {
    async saveOnboarding(userId, payload) {
      secrets.set(userId, {
        githubPat: payload.githubPat,
        llmKeys: payload.llmKeys,
      });
      const linked: RepoLink[] = payload.repos.map((r) => ({
        id: `${r.owner}/${r.name}`,
        owner: r.owner,
        name: r.name,
        defaultBranch: r.defaultBranch ?? 'main',
        mirrorPath: `users/${userId}/mirrors/${r.owner}_${r.name}`,
      }));
      repos.set(userId, linked);
    },

    async getSecrets(userId) {
      return secrets.get(userId) ?? null;
    },

    async listRepos(userId) {
      return repos.get(userId) ?? [];
    },

    async createSession(userId, repoId, provider, title) {
      const session: AgentSession = {
        id: randomUUID(),
        userId,
        repoId,
        provider,
        status: 'active',
        title: title ?? 'New session',
        pendingChanges: [],
        createdAt: now(),
        updatedAt: now(),
      };
      sessions.set(sessionKey(userId, session.id), session);
      messages.set(sessionKey(userId, session.id), []);
      return session;
    },

    async getSession(userId, sessionId) {
      return sessions.get(sessionKey(userId, sessionId)) ?? null;
    },

    async listSessions(userId) {
      const prefix = `${userId}:`;
      return [...sessions.entries()]
        .filter(([k]) => k.startsWith(prefix))
        .map(([, s]) => s)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async addMessage(userId, sessionId, message) {
      const key = sessionKey(userId, sessionId);
      const list = messages.get(key) ?? [];
      list.push(message);
      messages.set(key, list);
      const session = sessions.get(key);
      if (session) {
        session.updatedAt = now();
        sessions.set(key, session);
      }
    },

    async listMessages(userId, sessionId) {
      return messages.get(sessionKey(userId, sessionId)) ?? [];
    },

    async setPendingChanges(userId, sessionId, changes) {
      const key = sessionKey(userId, sessionId);
      const session = sessions.get(key);
      if (!session) throw new Error('Session not found');
      session.pendingChanges = changes;
      session.status = changes.length ? 'awaiting_approval' : 'active';
      session.updatedAt = now();
      sessions.set(key, session);
      return session;
    },

    async updateSession(userId, session) {
      sessions.set(sessionKey(userId, session.id), { ...session, updatedAt: now() });
    },

    async mirrorRepoFiles(userId, repoId, files) {
      mirrors.set(mirrorKey(userId, repoId), files);
    },

    async getMirroredFiles(userId, repoId) {
      return mirrors.get(mirrorKey(userId, repoId)) ?? {};
    },
  };
}
