import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

describe("Phase 15 mobile usability improvements", () => {
  it("confirms destructive demo and inventory actions", () => {
    const benta = read("src/components/benta/benta-demo.tsx");
    const paninda = read("src/components/paninda/paninda-manager.tsx");
    const setup = read("src/components/setup/store-setup-form.tsx");
    assert.match(benta, /window\.confirm\([\s\S]*Reset demo data/);
    assert.match(paninda, /window\.confirm\([\s\S]*Archive/);
    assert.match(setup, /window\.confirm\([\s\S]*demo data/);
  });

  it("uses mobile-friendly input modes for fast selling and service recording", () => {
    const benta = read("src/components/benta/benta-demo.tsx");
    const services = read("src/components/services/services-manager.tsx");
    assert.match(benta, /id="benta-product-search"[\s\S]*inputMode="search"/);
    assert.match(benta, /id="cash-received"[\s\S]*inputMode="decimal"/);
    assert.match(services, /Mobile Number/);
    assert.match(services, /inputMode="tel"/);
    assert.match(services, /Customer price includes your service fee/);
  });
});