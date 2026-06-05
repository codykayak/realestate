import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ChatScreen } from './src/screens/ChatScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen, loadDevUserId } from './src/screens/SettingsScreen';

type Screen = 'onboarding' | 'chat' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [devUserId, setDevUserId] = useState('demo-user');
  const token = `dev:${devUserId}`;

  useEffect(() => {
    loadDevUserId().then(setDevUserId);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      {screen === 'onboarding' && (
        <OnboardingScreen token={token} onComplete={() => setScreen('chat')} />
      )}
      {screen === 'chat' && (
        <ChatScreen token={token} onOpenSettings={() => setScreen('settings')} />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          devUserId={devUserId}
          onDevUserIdChange={setDevUserId}
          onBack={() => setScreen('chat')}
          onResetOnboarding={() => setScreen('onboarding')}
        />
      )}
    </>
  );
}
