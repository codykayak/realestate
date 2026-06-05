import { Router } from 'express';
import { z } from 'zod';
import { getUserId, requireAuth } from '../middleware/auth.js';
import { sendError } from '../lib/errors.js';
import type { DataStore } from '../services/store.js';
import type { GitService } from '../services/git.js';

const onboardingSchema = z.object({
  githubPat: z.string().min(10),
  repos: z
    .array(
      z.object({
        owner: z.string().min(1),
        name: z.string().min(1),
        defaultBranch: z.string().optional(),
      }),
    )
    .min(1),
  llmKeys: z.record(z.string()).default({}),
});

export function createOnboardingRouter(store: DataStore, git: GitService): Router {
  const router = Router();
  router.use(requireAuth);

  router.post('/onboarding', async (req, res) => {
    try {
      const userId = getUserId(req);
      const payload = onboardingSchema.parse(req.body);
      await store.saveOnboarding(userId, payload);

      // Clone each repo and mirror into store (Firestore in production)
      for (const repo of payload.repos) {
        const branch = repo.defaultBranch ?? 'main';
        const workspace = await git.cloneOrPull(
          repo.owner,
          repo.name,
          payload.githubPat,
          branch,
        );
        const files = await git.readTree(workspace);
        const repoId = `${repo.owner}/${repo.name}`;
        await store.mirrorRepoFiles(userId, repoId, files);
      }

      const repos = await store.listRepos(userId);
      res.json({ ok: true, repos });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.get('/repos', async (req, res) => {
    try {
      const userId = getUserId(req);
      const repos = await store.listRepos(userId);
      res.json({ repos });
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
}
