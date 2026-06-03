# Cloud Agent — Git push & PRs (read this first)

## Why pushes sometimes fail with `cursor[bot]` / 403

This VM rewrites every `https://github.com/...` URL to **Cursor’s GitHub App** (`cursor[bot]`).

That app only had access to **AiBhive** for a long time. It **cannot push** to `codykayak/realestate` → `Permission denied`.

Your **personal PAT** (`ghp_...`) **does** have access — but only if the agent actually uses it.

## Fix once (you do this in Cursor / GitHub)

### 1. Run agents on the correct repo

**Cursor → Cloud Agents → New agent → Repository: `codykayak/realestate`**

Do **not** use `codykayak/AiBhive` for realestate site work.

### 2. Add the PAT as a Cloud Agent secret

**Cursor → Cloud Agents → Secrets** (for the **realestate** project):

| Name | Value |
|------|--------|
| `junerealestate` | your `ghp_...` token (classic, **repo** scope) |

Use this name only. `setup-git-auth.sh` **ignores** `REALESTATE_GITHUB_TOKEN` so an old Cursor secret cannot break pushes. After adding or changing secrets, **start a new Cloud Agent** on `codykayak/realestate`.

### 3. Grant Cursor’s GitHub App access to realestate (optional but best)

**GitHub → Settings → Applications → Cursor → Configure**

Add **`codykayak/realestate`** with **Read and write**.

Then `cursor[bot]` pushes work without a PAT in chat.

### 4. Do not use AiBhive Actions secret for the agent

`REALESTATE_GITHUB_TOKEN` on **AiBhive → Actions** only runs inside GitHub Actions workflows. It is **not** passed to Cloud Agents.

## What the agent runs every session

```bash
cd /path/to/realestate
./scripts/setup-git-auth.sh
git push -u origin your-branch
```

The script uses, in order: `junerealestate` env → `GH_TOKEN` → `.env.local` (ignores `REALESTATE_GITHUB_TOKEN`).

## PRs

- Create PRs on **`codykayak/realestate`** only.
- Branch must be **pushed** before `ManagePullRequest` / GitHub UI will work.
- Base branch: **`main`**.

## Quick test

```bash
./scripts/setup-git-auth.sh
gh api repos/codykayak/realestate --jq .permissions.push
# should print: true
```
