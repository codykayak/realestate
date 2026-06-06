/** Supported LLM providers — one active at a time per session. */
export type LlmProvider = 'anthropic' | 'gemini' | 'grok' | 'kimi';

export type SessionStatus =
  | 'active'
  | 'awaiting_approval'
  | 'pushing'
  | 'completed'
  | 'rejected'
  | 'error';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  provider?: LlmProvider;
}

export interface FileChange {
  path: string;
  action: 'create' | 'update' | 'delete';
  /** Unified diff or full content preview for mobile review */
  preview: string;
}

export interface RepoLink {
  id: string;
  owner: string;
  name: string;
  defaultBranch: string;
  /** Firestore doc path where mirrored tree lives */
  mirrorPath: string;
}

export interface AgentSession {
  id: string;
  userId: string;
  repoId: string;
  provider: LlmProvider;
  status: SessionStatus;
  title: string;
  pendingChanges: FileChange[];
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingPayload {
  githubPat: string;
  repos: Array<{ owner: string; name: string; defaultBranch?: string }>;
  llmKeys: Partial<Record<LlmProvider, string>>;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  provider?: LlmProvider;
}

export interface SendMessageResponse {
  session: AgentSession;
  assistantMessage: ChatMessage;
  pendingChanges: FileChange[];
}

export interface ApprovePushRequest {
  sessionId: string;
  commitMessage?: string;
}

export interface ApprovePushResponse {
  session: AgentSession;
  commitSha?: string;
  pushedBranch?: string;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}
