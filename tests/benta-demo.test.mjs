import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const src = (...parts) => join(root, 'src', ...parts);
const read = (...parts) => readFileSync(src(...parts), 'utf8');

describe('Benta demo checkout UI', () => {
  it('renders the Benta demo client component on the /benta page', () => {
    const page = read('app', 'benta', 'page.tsx');

    assert.match(page, /BentaDemo/);
    assert.doesNotMatch(page, /Wala pang benta/);
  });

  it('has a local-first demo checkout wired to demo seed, products, sales, and reports', () => {
    assert.ok(existsSync(src('components', 'benta', 'benta-demo.tsx')), 'missing Benta demo component');

    const demo = read('components', 'benta', 'benta-demo.tsx');

    for (const expected of [
      '"use client"',
      'seedDemoStore',
      'productRepository.listActive',
      'salesRepository.createCashSale',
      'reportsRepository.getDailySummary',
      'resetLocalData',
      'Cash Received',
      'Complete Demo Sale',
      'Change',
    ]) {
      assert.match(demo, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
