import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Explicitly approved media only. Unknown external requests remain prohibited
// by the individual browser suites; this is not a general CDN allowlist.
const assets = [
  ['https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/fe1a7012-e883-4026-a630-67bb8babf92e.webp', 'a5128666c6136fc4dbdae8212992fc205edf52184634ae218cf1980144f5a4f6'],
  ['https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/9273dd44-3498-4309-9c30-d763a10345b6.webp', 'df968d42507c936fcc2a73125acdd00f94dff01cdee8bddaaacb1b6048c1fb92'],
];

export async function loadLoginArtwork() {
  const bytesByUrl = new Map();
  for (const [url, expectedHash] of assets) {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, 'Approved login artwork must be available');
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, 'Approved login artwork must not change');
    bytesByUrl.set(url, bytes);
  }
  return bytesByUrl;
}
