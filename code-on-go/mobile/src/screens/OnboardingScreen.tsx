import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LLM_PROVIDERS } from '@code-on-go/shared';
import type { LlmProvider, OnboardingPayload } from '@code-on-go/shared';
import { ApiClient } from '../api/client';
import { getApiBaseUrl, loadApiBaseUrl, saveApiBaseUrl, testApiConnection } from '../config';
import { colors } from '../theme';

type Props = {
  token: string;
  onComplete: () => void;
};

export function OnboardingScreen({ token, onComplete }: Props) {
  const [githubPat, setGithubPat] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [llmKeys, setLlmKeys] = useState<Partial<Record<LlmProvider, string>>>({});
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [connStatus, setConnStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApiBaseUrl().then((url) => setApiUrl(url));
  }, []);

  async function handleTestConnection() {
    setConnStatus('Testing…');
    await saveApiBaseUrl(apiUrl);
    const result = await testApiConnection();
    setConnStatus(result.ok ? `✓ ${result.message}` : `✗ ${result.message}`);
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await saveApiBaseUrl(apiUrl);
      const payload: OnboardingPayload = {
        githubPat,
        repos: [{ owner: repoOwner.trim(), name: repoName.trim() }],
        llmKeys,
      };
      const client = new ApiClient(token);
      await client.submitOnboarding(payload);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Connect your stack</Text>
      <Text style={styles.sub}>
        Keys are sent to the backend once and stored encrypted server-side. The phone does not
        keep Git or LLM secrets long-term.
      </Text>

      <Text style={styles.label}>Backend API URL</Text>
      <Text style={styles.hint}>
        Default is localhost — only works in the browser on this machine. Phone / Codespaces need
        your computer&apos;s IP or forwarded port URL.
      </Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://localhost:8080"
        placeholderTextColor={colors.muted}
        value={apiUrl}
        onChangeText={setApiUrl}
      />
      <Pressable style={styles.btnSecondary} onPress={handleTestConnection}>
        <Text style={styles.btnText}>Test API connection</Text>
      </Pressable>
      {connStatus ? (
        <Text style={connStatus.startsWith('✓') ? styles.ok : styles.error}>{connStatus}</Text>
      ) : null}

      <Text style={styles.label}>GitHub personal access token</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        placeholder="ghp_..."
        placeholderTextColor={colors.muted}
        value={githubPat}
        onChangeText={setGithubPat}
      />

      <Text style={styles.label}>Repository owner</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        placeholder="codykayak"
        placeholderTextColor={colors.muted}
        value={repoOwner}
        onChangeText={setRepoOwner}
      />

      <Text style={styles.label}>Repository name</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        placeholder="realestate"
        placeholderTextColor={colors.muted}
        value={repoName}
        onChangeText={setRepoName}
      />

      <Text style={styles.section}>LLM API keys (optional if you only use Cursor tab)</Text>
      <Text style={styles.hint}>
        Cursor Cloud Agents use the server-side cursorapi key — you do not enter it here.
      </Text>
      {LLM_PROVIDERS.map((p) => (
        <View key={p.id} style={styles.keyBlock}>
          <Text style={styles.label}>{p.label}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            placeholder={p.keyPlaceholder}
            placeholderTextColor={colors.muted}
            value={llmKeys[p.id] ?? ''}
            onChangeText={(v: string) => setLlmKeys((prev) => ({ ...prev, [p.id]: v }))}
          />
        </View>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Save & sync repo</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  heading: { color: colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.muted, marginBottom: 12, lineHeight: 20 },
  section: { color: colors.text, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  hint: { color: colors.muted, fontSize: 12, marginBottom: 4, lineHeight: 18 },
  label: { color: colors.muted, fontSize: 13, marginTop: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  keyBlock: { marginBottom: 4 },
  btn: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: colors.text, fontWeight: '600' },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  ok: { color: colors.success, marginTop: 4, lineHeight: 18 },
  error: { color: colors.danger, marginTop: 8, lineHeight: 18 },
});
