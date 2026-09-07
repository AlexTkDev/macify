import assert from "node:assert/strict";
import test from "node:test";

import { parseRemoteImageUrl as parseLocalRemoteImageUrl } from "../lib/local-media.mjs";
import { parseRemoteImageUrl as parseWorkerRemoteImageUrl } from "../../src/lib/media-validation.ts";

const parsers = [
  ["Worker", parseWorkerRemoteImageUrl],
  ["local sync", parseLocalRemoteImageUrl],
];

for (const [name, parseRemoteImageUrl] of parsers) {
  test(`${name} accepts public HTTPS image hosts without an allowlist`, () => {
    assert.equal(
      parseRemoteImageUrl("https://new-app.example/assets/icon.png")?.toString(),
      "https://new-app.example/assets/icon.png",
    );
  });

  test(`${name} rejects unsafe image destinations`, () => {
    for (const value of [
      "http://example.com/icon.png",
      "https://user:password@example.com/icon.png",
      "https://localhost/icon.png",
      "https://app.local/icon.png",
      "https://127.0.0.1/icon.png",
      "https://10.0.0.1/icon.png",
      "https://169.254.169.254/icon.png",
      "https://192.168.1.2/icon.png",
      "https://[::1]/icon.png",
    ]) {
      assert.equal(parseRemoteImageUrl(value), null, value);
    }
  });
}
