import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  CursorAgentSummary,
  CursorChatMessage,
  CursorModel,
  CursorRunStatus,
  RepoLink,
} from '@code-on-go/shared';
import { CursorClient } from '../api/cursorClient';
import { ApiClient } from '../api/client';
import { colors } from '../theme';

type Props = {
  token: string;
};

function isRunActive(status?: CursorRunStatus): boolean {
  return status === 'CREATING' || status === 'RUNNING';
}

export function CursorScreen({ token }: Props) {
  const client = useRef(new CursorClient(token)).current;
  const api = useRef(new ApiClient(token)).current;

  const [configured, setConfigured] = useState<boolean | null>(null);
  const [agents, setAgents] = useState<CursorAgentSummary[]>([]);
  const [models, setModels] = useState<CursorModel[]>([]);
  const [repos, setRepos] = useState<RepoLink[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isNewAgent, setIsNewAgent] = useState(false);
  const [modelId, setModelId] = useState<string | undefined>();
  const [repoId, setRepoId] = useState<string>('');
  const [messages, setMessages] = useState<CursorChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  }, []);

  const startPolling = useCallback(
    (agentId: string, runId: string) => {
      stopPolling();
      setPolling(true);
      pollRef.current = setInterval(async () => {
        try {
          const { run, messages: msgs } = await client.getRun(agentId, runId);
          setMessages(msgs);
          if (!isRunActive(run.status)) {
            stopPolling();
            setSending(false);
          }
        } catch {
          stopPolling();
          setSending(false);
        }
      }, 2500);
    },
    [client, stopPolling],
  );

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ configured: ok }, { models: m }, { repos: r }, { agents: a }] = await Promise.all([
        client.getStatus(),
        client.listModels().catch(() => ({ models: [] as CursorModel[] })),
        api.listRepos().catch(() => ({ repos: [] as RepoLink[] })),
        client.listAgents().catch(() => ({ agents: [] as CursorAgentSummary[] })),
      ]);
      setConfigured(ok);
      setModels(m);
      setRepos(r);
      setAgents(a);
      if (r[0]) setRepoId(r[0].id);
      if (m[0]) setModelId(m[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load Cursor');
    } finally {
      setLoading(false);
    }
  }, [api, client]);

  useEffect(() => {
    bootstrap();
    return () => stopPolling();
  }, [bootstrap, stopPolling]);

  const openAgent = async (agentId: string) => {
    setError(null);
    setIsNewAgent(false);
    setSelectedAgentId(agentId);
    try {
      const detail = await client.getAgent(agentId);
      setMessages(detail.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open agent');
    }
  };

  const openNewAgent = () => {
    setSelectedAgentId(null);
    setIsNewAgent(true);
    setMessages([]);
    setInput('');
  };

  const backToList = () => {
    stopPolling();
    setSelectedAgentId(null);
    setIsNewAgent(false);
    setMessages([]);
    setInput('');
    bootstrap();
  };

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    setInput('');

    try {
      if (isNewAgent || !selectedAgentId) {
        if (!repoId) throw new Error('Select a repository first (complete onboarding).');
        const res = await client.createAgent({
          prompt: text,
          modelId,
          repoId,
        });
        setSelectedAgentId(res.agent.id);
        setIsNewAgent(false);
        setMessages(res.messages);
        startPolling(res.agent.id, res.run.id);
      } else {
        const res = await client.sendMessage(selectedAgentId, text);
        setMessages(res.messages);
        startPolling(selectedAgentId, res.run.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
      setSending(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (configured === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Cursor</Text>
        <Text style={styles.muted}>
          Cursor API key is not set on the backend. Add the secret{' '}
          <Text style={styles.mono}>cursorapi</Text> to Cloud Run (or CURSOR_API_KEY in backend/.env
          for local dev).
        </Text>
      </View>
    );
  }

  const inChat = Boolean(selectedAgentId) || isNewAgent;

  if (!inChat) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Cursor Agents</Text>
          <Pressable style={styles.newBtn} onPress={openNewAgent}>
            <Text style={styles.newBtnText}>+ New</Text>
          </Pressable>
        </View>
        <Text style={styles.sub}>
          Cloud agents work on your GitHub repo. Replies appear here — no code panels, just chat.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={agents}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.muted}>No agents yet. Tap + New to start one.</Text>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.agentCard} onPress={() => openAgent(item.id)}>
              <Text style={styles.agentName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.agentMeta}>
                {item.status} · {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
              {item.url ? (
                <Pressable onPress={() => Linking.openURL(item.url!)}>
                  <Text style={styles.link}>Open in Cursor</Text>
                </Pressable>
              ) : null}
            </Pressable>
          )}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.chatHeader}>
        <Pressable onPress={backToList}>
          <Text style={styles.back}>← Agents</Text>
        </Pressable>
        <Text style={styles.chatTitle} numberOfLines={1}>
          {isNewAgent ? 'New Cursor agent' : agents.find((a) => a.id === selectedAgentId)?.name ?? 'Agent'}
        </Text>
      </View>

      {isNewAgent && (
        <View style={styles.config}>
          <Text style={styles.configLabel}>Repository</Text>
          <View style={styles.chipRow}>
            {repos.map((r) => (
              <Pressable
                key={r.id}
                style={[styles.chip, repoId === r.id && styles.chipOn]}
                onPress={() => setRepoId(r.id)}
              >
                <Text style={[styles.chipText, repoId === r.id && styles.chipTextOn]}>{r.id}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.configLabel}>Model</Text>
          <View style={styles.chipRow}>
            {models.length ? (
              models.map((m) => (
                <Pressable
                  key={m.id}
                  style={[styles.chip, modelId === m.id && styles.chipOn]}
                  onPress={() => setModelId(m.id)}
                >
                  <Text style={[styles.chipText, modelId === m.id && styles.chipTextOn]}>
                    {m.label}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.muted}>Default model (server picks best available)</Text>
            )}
          </View>
        </View>
      )}

      {error ? <Text style={styles.errorPad}>{error}</Text> : null}
      {(sending || polling) && (
        <View style={styles.working}>
          <ActivityIndicator color={colors.accent} size="small" />
          <Text style={styles.workingText}>Cursor is working on your repo…</Text>
        </View>
      )}

      <FlatList
        style={styles.flex}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.msgList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' && styles.userBubble,
              item.role === 'assistant' && styles.assistantBubble,
              item.role === 'status' && styles.statusBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.mutedPad}>
            Describe what you want changed in the repo. Cursor will work in the cloud and reply here.
          </Text>
        }
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Ask Cursor to edit your code…"
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!sending}
        />
        <Pressable
          style={[styles.send, sending && styles.sendDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 56, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { color: colors.text, fontSize: 22, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 8, marginBottom: 12, lineHeight: 20 },
  muted: { color: colors.muted, lineHeight: 20 },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.accent },
  list: { gap: 10, paddingBottom: 24 },
  agentCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  agentName: { color: colors.text, fontWeight: '600', fontSize: 16 },
  agentMeta: { color: colors.muted, fontSize: 12 },
  link: { color: colors.accent, fontSize: 13, marginTop: 4 },
  newBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBtnText: { color: '#fff', fontWeight: '700' },
  chatHeader: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 8, gap: 4 },
  back: { color: colors.accent, fontSize: 15 },
  chatTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  config: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  configLabel: { color: colors.muted, fontSize: 12, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.accent, backgroundColor: '#1f3a5f' },
  chipText: { color: colors.muted, fontSize: 12 },
  chipTextOn: { color: colors.text },
  error: { color: colors.danger, marginBottom: 8 },
  errorPad: { color: colors.danger, paddingHorizontal: 16 },
  working: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  workingText: { color: colors.muted, fontSize: 13 },
  msgList: { padding: 16, gap: 10, paddingBottom: 8 },
  bubble: { borderRadius: 14, padding: 12, maxWidth: '92%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1f3a5f' },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBubble: { alignSelf: 'center', backgroundColor: '#2d2a1f' },
  bubbleText: { color: colors.text, lineHeight: 21, fontSize: 15 },
  mutedPad: { color: colors.muted, textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontWeight: '700' },
});
