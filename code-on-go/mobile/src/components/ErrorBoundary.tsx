import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Surfaces JS errors instead of a blank white screen (especially on web). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Code on Go crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.hint}>
            If you see a DevTools install error in the terminal, it is usually harmless — scroll
            for a red bundler error like &quot;Unable to resolve ./types.js&quot;.
          </Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.mono}>{this.state.error.message}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    paddingTop: 48,
    gap: 12,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  hint: { color: colors.muted, lineHeight: 20 },
  scroll: { flex: 1 },
  mono: {
    color: colors.danger,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});
