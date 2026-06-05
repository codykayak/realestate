import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../theme';

const DEV_USER_KEY = 'code_on_go_dev_user';

type Props = {
  devUserId: string;
  onDevUserIdChange: (id: string) => void;
  onBack: () => void;
  onResetOnboarding: () => void;
};

export function SettingsScreen({
  devUserId,
  onDevUserIdChange,
  onBack,
  onResetOnboarding,
}: Props) {
  async function saveDevUser() {
    await SecureStore.setItemAsync(DEV_USER_KEY, devUserId);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.heading}>Settings</Text>

      <Text style={styles.label}>Dev user ID (MVP auth: Bearer dev:{'<id>'})</Text>
      <TextInput
        style={styles.input}
        value={devUserId}
        onChangeText={onDevUserIdChange}
        autoCapitalize="none"
        placeholder="your-user-id"
        placeholderTextColor={colors.muted}
      />
      <Pressable style={styles.btnSecondary} onPress={saveDevUser}>
        <Text style={styles.btnText}>Save dev user</Text>
      </Pressable>

      <Text style={styles.note}>
        Production uses Firebase Auth ID tokens. API keys and GitHub PATs are stored on the
        backend only (Secret Manager / encrypted Firestore), not on device.
      </Text>

      <Pressable style={styles.btnDanger} onPress={onResetOnboarding}>
        <Text style={styles.btnText}>Re-run onboarding</Text>
      </Pressable>
    </View>
  );
}

export async function loadDevUserId(): Promise<string> {
  return (await SecureStore.getItemAsync(DEV_USER_KEY)) ?? 'demo-user';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 56, gap: 10 },
  back: { color: colors.accent, marginBottom: 8 },
  heading: { color: colors.text, fontSize: 24, fontWeight: '700' },
  label: { color: colors.muted, marginTop: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  note: { color: colors.muted, lineHeight: 20, marginTop: 12 },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btnDanger: {
    marginTop: 24,
    backgroundColor: '#3d1f1f',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btnText: { color: colors.text, fontWeight: '600' },
});
