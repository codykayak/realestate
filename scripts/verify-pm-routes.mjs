#!/usr/bin/env node
/** Smoke-test PM routes on production build. Usage: npm run verify:pm */
import { spawn } from 'child_process';
import { chromium } from 'playwright';
import { setTimeout as sleep } from 'timers/promises';

const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}/property-management`;

const routes = [
  { path: '', mustInclude: 'Enter platform' },
  { path: '/dashboard', mustInclude: 'Operations Dashboard' },
  { path: '/owner', mustInclude: 'Owner Portal' },
  { path: '/communications', mustInclude: 'AI Resident' },
  { path: '/maintenance', mustInclude: 'Maintenance' },
  { path: '/developer-admin', mustInclude: 'Developer Admin' },
];

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: 'pipe',
});

let failed = 0;

try {
  await sleep(3500);
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const { path, mustInclude } of routes) {
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
    const text = await page.locator('body').innerText();
    if (!text.includes(mustInclude) || text.length < 80) {
      console.error(`FAIL ${path || '/'}`, pageErrors[0] || text.slice(0, 60));
      failed += 1;
    } else {
      console.log(`OK   ${path || '/'}`);
    }
  }

  await page.goto(`${BASE}/owner`);
  await page.click('a[href*="communications"]');
  await sleep(800);
  const navText = await page.locator('body').innerText();
  if (!navText.includes('AI Resident')) {
    console.error('FAIL owner -> communications');
    failed += 1;
  } else {
    console.log('OK   owner -> communications');
  }

  for (const bad of ['/nope', '/property-management']) {
    let navCount = 0;
    const onNav = () => { navCount += 1; };
    page.on('framenavigated', onNav);
    await page.goto(`${BASE}${bad}`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(400);
    page.off('framenavigated', onNav);
    const body = await page.locator('body').innerText();
    if (navCount > 6) {
      console.error(`FAIL redirect loop on ${bad} (${navCount} navigations)`);
      failed += 1;
    } else if (!body.includes('Enter platform')) {
      console.error(`FAIL unknown route ${bad} should show dashboard`);
      failed += 1;
    } else {
      console.log(`OK   no loop on ${bad} (${navCount} navs)`);
    }
  }

  await browser.close();
} finally {
  preview.kill('SIGTERM');
}

process.exit(failed > 0 ? 1 : 0);
