import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { simpleGit } from 'simple-git';
import type { FileChange } from '@code-on-go/shared';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';

export interface GitService {
  cloneOrPull(owner: string, name: string, pat: string, branch: string): Promise<string>;
  applyChanges(workspacePath: string, changes: FileChange[]): Promise<void>;
  commitAndPush(
    workspacePath: string,
    message: string,
    pat: string,
    branch: string,
  ): Promise<string>;
  readTree(workspacePath: string): Promise<Record<string, string>>;
}

function authRemoteUrl(owner: string, name: string, pat: string): string {
  return `https://x-access-token:${pat}@github.com/${owner}/${name}.git`;
}

export function createGitService(): GitService {
  return {
    async cloneOrPull(owner, name, pat, branch) {
      const dir = join(config.gitWorkspacesDir, `${owner}__${name}`);
      await mkdir(config.gitWorkspacesDir, { recursive: true });

      const { access } = await import('node:fs/promises');
      const exists = await access(join(dir, '.git'))
        .then(() => true)
        .catch(() => false);

      const remote = authRemoteUrl(owner, name, pat);

      if (!exists) {
        await simpleGit().clone(remote, dir, ['--branch', branch, '--single-branch']);
      } else {
        const repo = simpleGit(dir);
        await repo.fetch('origin', branch);
        await repo.checkout(branch);
        await repo.pull('origin', branch);
      }

      return dir;
    },

    async applyChanges(workspacePath, changes) {
      const { writeFile, unlink, mkdir: mk } = await import('node:fs/promises');
      const { dirname, join: pathJoin } = await import('node:path');

      for (const change of changes) {
        const full = pathJoin(workspacePath, change.path);
        if (change.action === 'delete') {
          await unlink(full).catch(() => undefined);
          continue;
        }
        await mk(dirname(full), { recursive: true });
        // MVP: preview holds full file content; production uses patch application
        await writeFile(full, change.preview, 'utf8');
      }
    },

    async commitAndPush(workspacePath, message, pat, branch) {
      const git = simpleGit(workspacePath);
      await git.add('.');
      const status = await git.status();
      if (status.isClean()) {
        throw new AppError('No changes to commit', 400, 'NO_CHANGES');
      }
      const result = await git.commit(message);
      const remote = authRemoteUrl(
        // workspace dir is owner__name — recover from path in production
        workspacePath.split('/').pop()?.split('__')[0] ?? 'owner',
        workspacePath.split('/').pop()?.split('__')[1] ?? 'repo',
        pat,
      );
      await git.removeRemote('origin').catch(() => undefined);
      await git.addRemote('origin', remote);
      await git.push('origin', branch);
      return result.commit;
    },

    async readTree(workspacePath) {
      const { readdir, readFile, stat } = await import('node:fs/promises');
      const { join: pathJoin, relative } = await import('node:path');
      const out: Record<string, string> = {};

      async function walk(dir: string): Promise<void> {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === '.git') continue;
          const full = pathJoin(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full);
          } else {
            const st = await stat(full);
            if (st.size > 512_000) continue; // skip large binaries in mirror
            out[relative(workspacePath, full)] = await readFile(full, 'utf8');
          }
        }
      }

      await walk(workspacePath);
      return out;
    },
  };
}
