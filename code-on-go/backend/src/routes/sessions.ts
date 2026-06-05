import { Router } from 'express';
import { z } from 'zod';
import { getUserId, requireAuth } from '../middleware/auth.js';
import { sendError, AppError } from '../lib/errors.js';
import type { DataStore } from '../services/store.js';
import type { GitService } from '../services/git.js';
import { join } from 'node:path';
import { config } from '../config.js';

const approveSchema = z.object({
  commitMessage: z.string().optional(),
});

export function createSessionsRouter(store: DataStore, git: GitService): Router {
  const router = Router();
  router.use(requireAuth);

  router.post('/sessions/:sessionId/approve', async (req, res) => {
    try {
      const userId = getUserId(req);
      const { commitMessage } = approveSchema.parse(req.body);
      const session = await store.getSession(userId, req.params.sessionId);
      if (!session) throw new AppError('Session not found', 404, 'NOT_FOUND');
      if (!session.pendingChanges.length) {
        throw new AppError('No pending changes to approve', 400, 'NO_CHANGES');
      }

      const secrets = await store.getSecrets(userId);
      if (!secrets) throw new AppError('Complete onboarding first', 400, 'NOT_ONBOARDED');

      const [owner, name] = session.repoId.split('/');
      const repos = await store.listRepos(userId);
      const repo = repos.find((r) => r.id === session.repoId);
      const branch = repo?.defaultBranch ?? 'main';

      const workspace = join(config.gitWorkspacesDir, `${owner}__${name}`);
      await git.applyChanges(workspace, session.pendingChanges);

      const mirrored = await git.readTree(workspace);
      await store.mirrorRepoFiles(userId, session.repoId, mirrored);

      session.status = 'pushing';
      await store.updateSession(userId, session);

      const sha = await git.commitAndPush(
        workspace,
        commitMessage ?? `Code on Go: ${session.title}`,
        secrets.githubPat,
        branch,
      );

      session.status = 'completed';
      session.pendingChanges = [];
      await store.updateSession(userId, session);

      res.json({
        session,
        commitSha: sha,
        pushedBranch: branch,
      });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post('/sessions/:sessionId/reject', async (req, res) => {
    try {
      const userId = getUserId(req);
      const session = await store.getSession(userId, req.params.sessionId);
      if (!session) throw new AppError('Session not found', 404, 'NOT_FOUND');

      session.pendingChanges = [];
      session.status = 'rejected';
      await store.updateSession(userId, session);

      res.json({ session });
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
}
