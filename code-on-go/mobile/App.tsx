import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';
import { ChatScreen } from './src/screens/ChatScreen';
import { CursorScreen } from './src/screens/CursorScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen, loadDevUserId } from './src/screens/SettingsScreen';
import { BottomTabs, type TabId } from './src/components/BottomTabs';
import { loadApiBaseUrl } from './src/config';
import { colors } from './src/theme';

type Screen = 'onboarding' | 'main';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [tab, setTab] = useState<TabId>('cursor');
  const [devUserId, setDevUserId] = useState('demo-user');
  const token = `dev:${devUserId}`;

  useEffect(() => {
    loadDevUserId()
      .then(setDevUserId)
      .catch(() => setDevUserId('demo-user'));
    loadApiBaseUrl().catch(() => undefined);
  }, []);

  const shell = [styles.root, Platform.OS === 'web' && styles.rootWeb];

  if (screen === 'onboarding') {
    return (
      <View style={shell}>
        <StatusBar style="light" />
        <OnboardingScreen token={token} onComplete={() => setScreen('main')} />
      </View>
    );
  }

  return (
    <View style={shell}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {tab === 'cursor' && <CursorScreen token={token} />}
        {tab === 'chat' && (
          <ChatScreen token={token} onOpenSettings={() => setTab('settings')} hideSettingsLink />
        )}
        {tab === 'settings' && (
          <SettingsScreen
            devUserId={devUserId}
            onDevUserIdChange={setDevUserId}
            onBack={() => setTab('cursor')}
            onResetOnboarding={() => setScreen('onboarding')}
          />
        )}
      </View>
      <BottomTabs active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  rootWeb: { minHeight: '100vh' as unknown as number },
  body: { flex: 1 },
});
