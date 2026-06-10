import { Router } from 'express';
import { z } from 'zod';
import { getUserId, requireAuth } from '../middleware/auth.js';
import { sendError, AppError } from '../lib/errors.js';
import type { DataStore } from '../services/store.js';
import type { CursorStore } from '../services/cursorStore.js';
import {
  createCursorAgent,
  createCursorRun,
  getCursorAgent,
  getCursorRun,
  isCursorConfigured,
  isTerminalRun,
  listCursorAgents,
  listCursorModels,
} from '../services/cursorApi.js';

const createSchema = z.object({
  prompt: z.string().min(1),
  modelId: z.string().optional(),
  repoId: z.string().min(1),
  name: z.string().optional(),
});

const messageSchema = z.object({
  prompt: z.string().min(1),
});

function syncRunToThread(cursorStore: CursorStore, agentId: string, run: Awaited<ReturnType<typeof getCursorRun>>) {
  if (!isTerminalRun(run.status)) return;
  const messages = cursorStore.getMessages(agentId);
  const hasReply = messages.some((m) => m.role === 'assistant' && m.runId === run.id);
  if (hasReply) return;
  const reply =
    cursorStore.formatRunReply(run) + cursorStore.formatGitFooter(run);
  cursorStore.addAssistantMessage(agentId, reply, run);
}

export function createCursorRouter(store: DataStore, cursorStore: CursorStore): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/cursor/status', (_req, res) => {
    res.json({ configured: isCursorConfigured() });
  });

  router.get('/cursor/models', async (_req, res) => {
    try {
      const models = await listCursorModels();
      res.json({ models });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.get('/cursor/agents', async (_req, res) => {
    try {
      const agents = await listCursorAgents();
      res.json({ agents });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.get('/cursor/agents/:agentId', async (req, res) => {
    try {
      const agent = await getCursorAgent(req.params.agentId);
      let latestRun;
      if (agent.latestRunId) {
        latestRun = await getCursorRun(agent.id, agent.latestRunId).catch(() => undefined);
        if (latestRun) syncRunToThread(cursorStore, agent.id, latestRun);
      }
      res.json({
        agent,
        messages: cursorStore.getMessages(agent.id),
        latestRun,
      });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.get('/cursor/agents/:agentId/runs/:runId', async (req, res) => {
    try {
      const agentId = req.params.agentId;
      const run = await getCursorRun(agentId, req.params.runId);
      syncRunToThread(cursorStore, agentId, run);
      res.json({
        run,
        messages: cursorStore.getMessages(agentId),
      });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post('/cursor/agents', async (req, res) => {
    try {
      const userId = getUserId(req);
      const body = createSchema.parse(req.body);
      const repos = await store.listRepos(userId);
      const repo = repos.find((r) => r.id === body.repoId);
      if (!repo) {
        throw new AppError('Link a repo in onboarding first', 400, 'NO_REPO');
      }

      const repoUrl = `https://github.com/${repo.owner}/${repo.name}`;
      const { agent, run } = await createCursorAgent({
        prompt: body.prompt,
        modelId: body.modelId,
        repoUrl,
        branch: repo.defaultBranch,
        name: body.name ?? body.prompt.slice(0, 60),
      });

      cursorStore.addUserMessage(agent.id, body.prompt, run.id);
      cursorStore.addStatusMessage(agent.id, 'Cursor agent is working…', run);

      res.status(201).json({
        agent,
        run,
        messages: cursorStore.getMessages(agent.id),
      });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post('/cursor/agents/:agentId/messages', async (req, res) => {
    try {
      const body = messageSchema.parse(req.body);
      const agentId = req.params.agentId;

      await getCursorAgent(agentId);
      const run = await createCursorRun(agentId, body.prompt);
      cursorStore.addUserMessage(agentId, body.prompt, run.id);
      cursorStore.addStatusMessage(agentId, 'Cursor agent is working…', run);

      res.json({
        run,
        messages: cursorStore.getMessages(agentId),
      });
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
}
