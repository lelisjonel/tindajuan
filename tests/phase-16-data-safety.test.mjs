import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

describe("Phase 16 data safety and privacy", () => {
  it("shows local-first storage, privacy, and offline guidance", () => {
    const notice = read("src/components/settings/data-safety-notice.tsx");
    const setup = read("src/app/setup/page.tsx");
    const settings = read("src/app/settings/page.tsx");
    assert.match(notice, /current device and browser/i);
    assert.match(notice, /offline/i);
    assert.match(notice, /customer phone numbers/i);
    assert.match(notice, /account references/i);
    assert.match(setup, /DataSafetyNotice/);
    assert.match(settings, /DataSafetyNotice/);
  });

  it("provides recoverable storage error guidance", () => {
    const errors = read("src/lib/errors.ts");
    const backup = read("src/components/settings/backup-recovery-card.tsx");
    assert.match(errors, /storage space|storage limit/i);
    assert.match(errors, /backup/i);
    assert.match(backup, /friendlyDataError/);
  });
});