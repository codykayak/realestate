function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
  useInMemoryStore: process.env.USE_IN_MEMORY_STORE === 'true',
  gitWorkspacesDir: process.env.GIT_WORKSPACES_DIR ?? './.workspaces',
  secretsEncryptionKey: process.env.SECRETS_ENCRYPTION_KEY ?? '',
  corsOrigins: (process.env.CORS_ORIGINS ?? '*').split(',').map((s) => s.trim()),
  /** Cloud Run secret name: cursorapi (also checks CURSOR_API_KEY) */
  cursorApiKey: process.env.cursorapi ?? process.env.CURSOR_API_KEY ?? '',
  cursorApiBase: process.env.CURSOR_API_BASE ?? 'https://api.cursor.com',
};

export function isProd(): boolean {
  return config.nodeEnv === 'production';
}
