import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { createOnboardingRouter } from './routes/onboarding.js';
import { createChatRouter } from './routes/chat.js';
import { createSessionsRouter } from './routes/sessions.js';
import { createCursorRouter } from './routes/cursor.js';
import { createInMemoryStore } from './services/store.js';
import { createGitService } from './services/git.js';
import { createCursorStore } from './services/cursorStore.js';

export function createApp() {
  const app = express();
  const store = createInMemoryStore();
  const git = createGitService();
  const cursorStore = createCursorStore();

  app.use(
    cors({
      origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
    }),
  );
  app.use(express.json({ limit: '2mb' }));

  app.use(healthRouter);
  app.use('/v1', createOnboardingRouter(store, git));
  app.use('/v1', createChatRouter(store));
  app.use('/v1', createSessionsRouter(store, git));
  app.use('/v1', createCursorRouter(store, cursorStore));

  return app;
}
