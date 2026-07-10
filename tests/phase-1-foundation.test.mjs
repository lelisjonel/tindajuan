import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const src = (...parts) => join(root, 'src', ...parts);
const read = (...parts) => readFileSync(src(...parts), 'utf8');

describe('Phase 1 project foundation', () => {
  const routes = ['benta', 'services', 'paninda', 'suki', 'menu', 'kaha', 'reports', 'settings'];

  it('has a public page for each initial MVP route', () => {
    for (const route of routes) {
      assert.ok(existsSync(src('app', route, 'page.tsx')), `missing /${route} page`);
    }
  });

  it('uses TindaJuan metadata and app shell instead of create-next-app defaults', () => {
    const layout = read('app', 'layout.tsx');
    const home = read('app', 'page.tsx');

    assert.match(layout, /title:\s*"TindaJuan"/);
    assert.match(layout, /description:\s*"Mobile-first POS/);
    assert.doesNotMatch(home, /Create Next App/i);
    assert.match(home, /Benta, paninda, utang, kaha/);
  });

  it('defines mobile-first navigation with the five primary tabs and menu routes', () => {
    const bottomNav = read('components', 'app', 'bottom-nav.tsx');
    const appShell = read('components', 'app', 'app-shell.tsx');
    const menuPage = read('app', 'menu', 'page.tsx');

    for (const label of ['Benta', 'Services', 'Paninda', 'Suki', 'Menu']) {
      assert.match(bottomNav, new RegExp(label));
    }

    assert.match(appShell, /<BottomNav/);

    for (const path of ['/kaha', '/reports', '/settings']) {
      assert.match(menuPage, new RegExp(path));
    }
  });
});
