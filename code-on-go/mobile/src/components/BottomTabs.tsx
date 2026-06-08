import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type TabId = 'cursor' | 'chat' | 'settings';

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'cursor', label: 'Cursor' },
  { id: 'chat', label: 'Repo Chat' },
  { id: 'settings', label: 'Settings' },
];

export function BottomTabs({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <Pressable key={t.id} style={styles.tab} onPress={() => onChange(t.id)}>
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  labelOn: { color: colors.accent },
});
