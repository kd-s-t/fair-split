// Server-side crypto polyfill for Node.js environments
// This ensures crypto.subtle is available for SSR and API routes

import { webcrypto } from "node:crypto";

// In Node, attach webcrypto as the global Web Crypto
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = webcrypto as unknown as Crypto;
}
