/** Cursor Cloud Agents API — proxied via our backend. */

export type CursorRunStatus =
  | 'CREATING'
  | 'RUNNING'
  | 'FINISHED'
  | 'ERROR'
  | 'CANCELLED'
  | 'EXPIRED';

export type CursorAgentStatus = 'ACTIVE' | 'ARCHIVED';

export interface CursorModel {
  id: string;
  label: string;
}

export interface CursorAgentSummary {
  id: string;
  name: string;
  status: CursorAgentStatus;
  url?: string;
  createdAt: string;
  updatedAt: string;
  latestRunId?: string;
  repoUrl?: string;
}

export interface CursorGitBranch {
  repoUrl: string;
  branch?: string;
  prUrl?: string;
}

export interface CursorRun {
  id: string;
  agentId: string;
  status: CursorRunStatus;
  createdAt: string;
  updatedAt: string;
  durationMs?: number;
  result?: string;
  git?: { branches: CursorGitBranch[] };
}

export interface CursorChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'status';
  content: string;
  createdAt: string;
  runId?: string;
  runStatus?: CursorRunStatus;
}

export interface CreateCursorAgentRequest {
  prompt: string;
  modelId?: string;
  repoId: string;
  name?: string;
}

export interface CreateCursorAgentResponse {
  agent: CursorAgentSummary;
  run: CursorRun;
  messages: CursorChatMessage[];
}

export interface SendCursorMessageRequest {
  prompt: string;
  modelId?: string;
}

export interface SendCursorMessageResponse {
  run: CursorRun;
  messages: CursorChatMessage[];
}

export interface CursorAgentDetail {
  agent: CursorAgentSummary;
  messages: CursorChatMessage[];
  latestRun?: CursorRun;
}
