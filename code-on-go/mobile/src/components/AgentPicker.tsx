import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LLM_PROVIDERS } from '@code-on-go/shared';
import type { LlmProvider } from '@code-on-go/shared';
import { colors } from '../theme';

type Props = {
  value: LlmProvider;
  onChange: (provider: LlmProvider) => void;
};

export function AgentPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {LLM_PROVIDERS.map((p) => {
        const active = p.id === value;
        return (
          <Pressable
            key={p.id}
            onPress={() => onChange(p.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.accent, backgroundColor: '#1f3a5f' },
  chipText: { color: colors.muted, fontSize: 12 },
  chipTextActive: { color: colors.text, fontWeight: '600' },
});
