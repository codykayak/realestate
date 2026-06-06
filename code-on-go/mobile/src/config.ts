import Constants from 'expo-constants';

/** Override in app.json extra.apiBaseUrl or EXPO_PUBLIC_API_URL */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://localhost:8080';
