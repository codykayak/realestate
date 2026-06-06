import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { ChatMessage, LlmProvider } from '@code-on-go/shared';
import { getUserId, requireAuth } from '../middleware/auth.js';
import { sendError, AppError } from '../lib/errors.js';
import type { DataStore } from '../services/store.js';
import { runAgent } from '../services/llmRouter.js';

const createSessionSchema = z.object({
  repoId: z.string().min(1),
  provider: z.enum(['anthropic', 'gemini', 'grok', 'kimi']),
  title: z.string().optional(),
});

const messageSchema = z.object({
  message: z.string().min(1),
  provider: z.enum(['anthropic', 'gemini', 'grok', 'kimi']).optional(),
});

export function createChatRouter(store: DataStore): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/sessions', async (req, res) => {
    try {
      const userId = getUserId(req);
      res.json({ sessions: await store.listSessions(userId) });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post('/sessions', async (req, res) => {
    try {
      const userId = getUserId(req);
      const body = createSessionSchema.parse(req.body);
      const session = await store.createSession(
        userId,
        body.repoId,
        body.provider as LlmProvider,
        body.title,
      );
      res.status(201).json({ session });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.get('/sessions/:sessionId', async (req, res) => {
    try {
      const userId = getUserId(req);
      const session = await store.getSession(userId, req.params.sessionId);
      if (!session) throw new AppError('Session not found', 404, 'NOT_FOUND');
      const messages = await store.listMessages(userId, session.id);
      res.json({ session, messages });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post('/sessions/:sessionId/messages', async (req, res) => {
    try {
      const userId = getUserId(req);
      const { message, provider } = messageSchema.parse(req.body);
      const session = await store.getSession(userId, req.params.sessionId);
      if (!session) throw new AppError('Session not found', 404, 'NOT_FOUND');

      const secrets = await store.getSecrets(userId);
      if (!secrets) throw new AppError('Complete onboarding first', 400, 'NOT_ONBOARDED');

      const userMsg: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      };
      await store.addMessage(userId, session.id, userMsg);

      const history = await store.listMessages(userId, session.id);
      const files = await store.getMirroredFiles(userId, session.repoId);
      const activeProvider = (provider ?? session.provider) as LlmProvider;

      const { assistantMessage, proposedChanges } = await runAgent({
        repoId: session.repoId,
        files,
        history,
        userMessage: message,
        provider: activeProvider,
        secrets,
      });

      await store.addMessage(userId, session.id, assistantMessage);
      const updated = await store.setPendingChanges(userId, session.id, proposedChanges);

      res.json({
        session: updated,
        assistantMessage,
        pendingChanges: proposedChanges,
      });
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
}
