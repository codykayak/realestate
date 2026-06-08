import type {
  CreateCursorAgentRequest,
  CreateCursorAgentResponse,
  CursorAgentDetail,
  CursorAgentSummary,
  CursorModel,
  CursorRun,
  SendCursorMessageResponse,
} from '@code-on-go/shared';
import { API_BASE_URL } from '../config';

export class CursorClient {
  constructor(private token: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...(init?.headers ?? {}),
      },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error ?? `Request failed (${res.status})`);
    }
    return body as T;
  }

  getStatus() {
    return this.request<{ configured: boolean }>('/v1/cursor/status');
  }

  listModels() {
    return this.request<{ models: CursorModel[] }>('/v1/cursor/models');
  }

  listAgents() {
    return this.request<{ agents: CursorAgentSummary[] }>('/v1/cursor/agents');
  }

  getAgent(agentId: string) {
    return this.request<CursorAgentDetail>(`/v1/cursor/agents/${agentId}`);
  }

  getRun(agentId: string, runId: string) {
    return this.request<{ run: CursorRun; messages: CursorAgentDetail['messages'] }>(
      `/v1/cursor/agents/${agentId}/runs/${runId}`,
    );
  }

  createAgent(payload: CreateCursorAgentRequest) {
    return this.request<CreateCursorAgentResponse>('/v1/cursor/agents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  sendMessage(agentId: string, prompt: string) {
    return this.request<SendCursorMessageResponse>(`/v1/cursor/agents/${agentId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }
}
