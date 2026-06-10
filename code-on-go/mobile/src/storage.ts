import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Works on native (SecureStore) and web (localStorage). */
export async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setStoredItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore quota / private mode
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}
