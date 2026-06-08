import type {
  CursorAgentSummary,
  CursorModel,
  CursorRun,
  CursorRunStatus,
} from '@code-on-go/shared';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';

function requireCursorKey(): string {
  if (!config.cursorApiKey) {
    throw new AppError(
      'Cursor API key not configured. Set cursorapi on Cloud Run or CURSOR_API_KEY locally.',
      503,
      'CURSOR_NOT_CONFIGURED',
    );
  }
  return config.cursorApiKey;
}

async function cursorFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = requireCursorKey();
  const res = await fetch(`${config.cursorApiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(init?.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: string }).message)
        : typeof body === 'object' && body && 'error' in body
          ? String((body as { error: string }).error)
          : `Cursor API error (${res.status})`;
    throw new AppError(msg, res.status >= 500 ? 502 : res.status, 'CURSOR_API_ERROR');
  }
  return body as T;
}

export function isCursorConfigured(): boolean {
  return Boolean(config.cursorApiKey);
}

export async function listCursorModels(): Promise<CursorModel[]> {
  const data = await cursorFetch<{ items: Array<{ id: string; name?: string }> }>('/v1/models');
  return (data.items ?? []).map((m) => ({
    id: m.id,
    label: m.name ?? m.id,
  }));
}

export async function listCursorAgents(limit = 30): Promise<CursorAgentSummary[]> {
  const data = await cursorFetch<{
    items: Array<{
      id: string;
      name: string;
      status: string;
      url?: string;
      createdAt: string;
      updatedAt: string;
      latestRunId?: string;
      repos?: Array<{ url: string }>;
    }>;
  }>(`/v1/agents?limit=${limit}`);

  return (data.items ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    status: a.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
    url: a.url,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    latestRunId: a.latestRunId,
    repoUrl: a.repos?.[0]?.url,
  }));
}

export async function getCursorAgent(agentId: string): Promise<CursorAgentSummary> {
  const a = await cursorFetch<{
    id: string;
    name: string;
    status: string;
    url?: string;
    createdAt: string;
    updatedAt: string;
    latestRunId?: string;
    repos?: Array<{ url: string }>;
  }>(`/v1/agents/${agentId}`);

  return {
    id: a.id,
    name: a.name,
    status: a.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
    url: a.url,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    latestRunId: a.latestRunId,
    repoUrl: a.repos?.[0]?.url,
  };
}

export async function createCursorAgent(opts: {
  prompt: string;
  modelId?: string;
  repoUrl: string;
  branch: string;
  name?: string;
}): Promise<{ agent: CursorAgentSummary; run: CursorRun }> {
  const payload: Record<string, unknown> = {
    prompt: { text: opts.prompt },
    repos: [{ url: opts.repoUrl, startingRef: opts.branch }],
    autoCreatePR: false,
  };
  if (opts.name) payload.name = opts.name.slice(0, 100);
  if (opts.modelId) payload.model = { id: opts.modelId };

  const data = await cursorFetch<{
    agent: {
      id: string;
      name: string;
      status: string;
      url?: string;
      createdAt: string;
      updatedAt: string;
      latestRunId?: string;
      repos?: Array<{ url: string }>;
    };
    run: RawRun;
  }>('/v1/agents', { method: 'POST', body: JSON.stringify(payload) });

  return {
    agent: {
      id: data.agent.id,
      name: data.agent.name,
      status: data.agent.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
      url: data.agent.url,
      createdAt: data.agent.createdAt,
      updatedAt: data.agent.updatedAt,
      latestRunId: data.agent.latestRunId ?? data.run.id,
      repoUrl: data.agent.repos?.[0]?.url ?? opts.repoUrl,
    },
    run: mapRun(data.run),
  };
}

export async function createCursorRun(
  agentId: string,
  prompt: string,
): Promise<CursorRun> {
  const data = await cursorFetch<{ run: RawRun }>(`/v1/agents/${agentId}/runs`, {
    method: 'POST',
    body: JSON.stringify({ prompt: { text: prompt } }),
  });
  return mapRun(data.run);
}

export async function getCursorRun(agentId: string, runId: string): Promise<CursorRun> {
  const data = await cursorFetch<RawRun>(`/v1/agents/${agentId}/runs/${runId}`);
  return mapRun(data);
}

type RawRun = {
  id: string;
  agentId: string;
  status: CursorRunStatus;
  createdAt: string;
  updatedAt: string;
  durationMs?: number;
  result?: string;
  git?: { branches: Array<{ repoUrl: string; branch?: string; prUrl?: string }> };
};

function mapRun(r: RawRun): CursorRun {
  return {
    id: r.id,
    agentId: r.agentId,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    durationMs: r.durationMs,
    result: r.result,
    git: r.git,
  };
}

const TERMINAL: CursorRunStatus[] = ['FINISHED', 'ERROR', 'CANCELLED', 'EXPIRED'];

export function isTerminalRun(status: CursorRunStatus): boolean {
  return TERMINAL.includes(status);
}

/** Poll until run completes or timeout (default 5 min). */
export async function waitForCursorRun(
  agentId: string,
  runId: string,
  opts?: { intervalMs?: number; timeoutMs?: number },
): Promise<CursorRun> {
  const intervalMs = opts?.intervalMs ?? 2000;
  const timeoutMs = opts?.timeoutMs ?? 5 * 60 * 1000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const run = await getCursorRun(agentId, runId);
    if (isTerminalRun(run.status)) return run;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new AppError('Cursor agent run timed out', 504, 'CURSOR_TIMEOUT');
}
