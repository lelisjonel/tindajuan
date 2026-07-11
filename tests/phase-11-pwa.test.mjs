import * as assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = process.cwd();
const file = (...parts) => join(root, ...parts);
const read = (...parts) => readFileSync(file(...parts), "utf8");

describe("Phase 11 PWA polish", () => {
  it("defines an installable manifest with app icons and standalone display", () => {
    const manifest = JSON.parse(read("public", "manifest.webmanifest"));
    assert.equal(manifest.name, "AyosTinda");
    assert.equal(manifest.short_name, "AyosTinda");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.theme_color, "#16803C");
    assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
    assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  });

  it("includes icon assets, offline fallback, and service worker", () => {
    for (const asset of [
      "public/icons/icon-192.svg",
      "public/icons/icon-512.svg",
      "public/offline.html",
      "public/sw.js",
      "src/components/app/service-worker-register.tsx",
    ]) {
      assert.ok(existsSync(file(asset)), `missing ${asset}`);
    }
    const serviceWorker = read("public", "sw.js");
    assert.match(serviceWorker, /offline\.html/);
    assert.match(serviceWorker, /cache/);
  });

  it("declares PWA metadata and registers the service worker in the app shell", () => {
    const layout = read("src", "app", "layout.tsx");
    assert.match(layout, /manifest/);
    assert.match(layout, /appleWebApp/);
    assert.match(layout, /ServiceWorkerRegister/);
  });
});
