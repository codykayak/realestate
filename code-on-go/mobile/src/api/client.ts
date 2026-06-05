import type {
  AgentSession,
  ApprovePushResponse,
  ChatMessage,
  LlmProvider,
  OnboardingPayload,
  RepoLink,
  SendMessageResponse,
} from '@code-on-go/shared';
import { API_BASE_URL } from '../config';

export class ApiClient {
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

  submitOnboarding(payload: OnboardingPayload) {
    return this.request<{ ok: boolean; repos: RepoLink[] }>('/v1/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  listRepos() {
    return this.request<{ repos: RepoLink[] }>('/v1/repos');
  }

  listSessions() {
    return this.request<{ sessions: AgentSession[] }>('/v1/sessions');
  }

  createSession(repoId: string, provider: LlmProvider, title?: string) {
    return this.request<{ session: AgentSession }>('/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ repoId, provider, title }),
    });
  }

  getSession(sessionId: string) {
    return this.request<{ session: AgentSession; messages: ChatMessage[] }>(
      `/v1/sessions/${sessionId}`,
    );
  }

  sendMessage(sessionId: string, message: string, provider?: LlmProvider) {
    return this.request<SendMessageResponse>(`/v1/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, provider }),
    });
  }

  approve(sessionId: string, commitMessage?: string) {
    return this.request<ApprovePushResponse>(`/v1/sessions/${sessionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ commitMessage }),
    });
  }

  reject(sessionId: string) {
    return this.request<{ session: AgentSession }>(`/v1/sessions/${sessionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }
}
