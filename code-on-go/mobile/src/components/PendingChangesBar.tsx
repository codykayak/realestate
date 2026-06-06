import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { FileChange } from '@code-on-go/shared';
import { colors } from '../theme';

type Props = {
  changes: FileChange[];
  loading?: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function PendingChangesBar({ changes, loading, onApprove, onReject }: Props) {
  if (!changes.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{changes.length} file(s) ready to push</Text>
      {changes.map((c) => (
        <Text key={c.path} style={styles.file} numberOfLines={1}>
          {c.action}: {c.path}
        </Text>
      ))}
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.reject]} onPress={onReject} disabled={loading}>
          <Text style={styles.btnText}>Reject</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.approve]} onPress={onApprove} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Approve & Push</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 4,
  },
  title: { color: colors.warning, fontWeight: '700', marginBottom: 4 },
  file: { color: colors.muted, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reject: { backgroundColor: '#3d1f1f' },
  approve: { backgroundColor: '#1f3d2a' },
  btnText: { color: colors.text, fontWeight: '600' },
});
