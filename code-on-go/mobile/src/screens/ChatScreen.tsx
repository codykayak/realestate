import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { AgentSession, ChatMessage, LlmProvider, RepoLink } from '@code-on-go/shared';
import { AgentPicker } from '../components/AgentPicker';
import { PendingChangesBar } from '../components/PendingChangesBar';
import { ApiClient } from '../api/client';
import { colors } from '../theme';

type Props = {
  token: string;
  onOpenSettings?: () => void;
  hideSettingsLink?: boolean;
};

export function ChatScreen({ token, onOpenSettings, hideSettingsLink }: Props) {
  const client = new ApiClient(token);
  const [repos, setRepos] = useState<RepoLink[]>([]);
  const [session, setSession] = useState<AgentSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState<LlmProvider>('anthropic');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { repos: list } = await client.listRepos();
      setRepos(list);
      if (!list.length) {
        setError('Complete onboarding to link a repo.');
        return;
      }
      const { session: s } = await client.createSession(list[0].id, provider, 'Mobile session');
      setSession(s);
      const detail = await client.getSession(s.id);
      setMessages(detail.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  async function handleSend() {
    if (!session || !input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await client.sendMessage(session.id, input.trim(), provider);
      setSession(res.session);
      setMessages((prev) => [...prev, res.assistantMessage]);
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  async function handleApprove() {
    if (!session) return;
    setPushing(true);
    try {
      const res = await client.approve(session.id);
      setSession(res.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Push failed');
    } finally {
      setPushing(false);
    }
  }

  async function handleReject() {
    if (!session) return;
    try {
      const res = await client.reject(session.id);
      setSession(res.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Code on Go</Text>
          <Text style={styles.repo}>{repos[0]?.id ?? 'No repo'}</Text>
        </View>
        {!hideSettingsLink && onOpenSettings ? (
          <Pressable onPress={onOpenSettings}>
            <Text style={styles.settings}>Settings</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.pickerWrap}>
        <AgentPicker value={provider} onChange={setProvider} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.assistant]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Ask the agent to edit your repo…</Text>}
      />

      <PendingChangesBar
        changes={session?.pendingChanges ?? []}
        loading={pushing}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          placeholder="Message the agent…"
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Pressable style={styles.sendBtn} onPress={handleSend} disabled={sending}>
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  repo: { color: colors.muted, fontSize: 12 },
  settings: { color: colors.accent },
  pickerWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 10 },
  bubble: { borderRadius: 12, padding: 12, maxWidth: '90%' },
  user: { alignSelf: 'flex-end', backgroundColor: '#1f3a5f' },
  assistant: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.text, lineHeight: 20 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-end',
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '700' },
  error: { color: colors.danger, paddingHorizontal: 16, paddingBottom: 4 },
});
