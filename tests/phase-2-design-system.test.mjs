import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const src = (...parts) => join(root, 'src', ...parts);
const read = (...parts) => readFileSync(src(...parts), 'utf8');

describe('Phase 2 design system and mobile app shell', () => {
  it('defines TindaJuan brand tokens and reusable utility classes', () => {
    const css = read('app', 'globals.css');

    for (const token of [
      '--color-primary-green: #16a34a',
      '--color-dark-green: #14532d',
      '--color-warm-orange: #f97316',
      '--color-soft-yellow: #facc15',
      '--radius-card: 1.5rem',
      '--touch-target: 44px',
    ]) {
      assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    for (const className of ['.tj-card', '.tj-input', '.tj-touch-target', '.safe-bottom-padding']) {
      assert.match(css, new RegExp(className.replace('.', '\\.')));
    }
  });

  it('adds core reusable components required by the Phase 2 roadmap', () => {
    for (const component of ['money-text.tsx', 'primary-button.tsx', 'module-card.tsx']) {
      assert.ok(existsSync(src('components', 'app', component)), `missing ${component}`);
    }

    const moneyText = read('components', 'app', 'money-text.tsx');
    assert.match(moneyText, /Intl\.NumberFormat\("en-PH"/);
    assert.match(moneyText, /currency:\s*"PHP"/);

    const primaryButton = read('components', 'app', 'primary-button.tsx');
    assert.match(primaryButton, /min-h-\[var\(--touch-target\)\]/);
    assert.match(primaryButton, /variant/);
  });

  it('polishes the shell for mobile, tablet, and desktop navigation', () => {
    const appShell = read('components', 'app', 'app-shell.tsx');
    const bottomNav = read('components', 'app', 'bottom-nav.tsx');
    const desktopSidebar = read('components', 'app', 'desktop-sidebar.tsx');

    assert.match(appShell, /DesktopSidebar/);
    assert.match(appShell, /safe-bottom-padding/);
    assert.match(bottomNav, /pb-\[calc\(0\.5rem\+env\(safe-area-inset-bottom\)\)\]/);
    assert.match(bottomNav, /min-h-\[var\(--touch-target\)\]/);
    assert.match(desktopSidebar, /TindaJuan/);

    for (const label of ['Benta', 'Services', 'Paninda', 'Suki', 'Kaha', 'Reports', 'Settings']) {
      assert.match(desktopSidebar, new RegExp(label));
    }
  });

  it('uses polished cards and Taglish empty states on the home and module pages', () => {
    const home = read('app', 'page.tsx');
    const paninda = read('app', 'paninda', 'page.tsx');
    const kaha = read('app', 'kaha', 'page.tsx');

    assert.match(home, /MoneyText/);
    assert.match(home, /ModuleCard/);
    assert.match(home, /Offline-ready/);
    assert.match(paninda, /Wala pang paninda/);
    assert.match(kaha, /Nababawas ito sa kaha/);
  });
});
