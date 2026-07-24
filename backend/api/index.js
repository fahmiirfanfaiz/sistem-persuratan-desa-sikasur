/**
 * Vercel Serverless Entry Point
 *
 * Prisma v7's `prisma-client` generator produces TypeScript-only output (.ts files).
 * A TypeScript loader (tsx) is required at runtime to import them.
 *
 * KEY: We use a STATIC `import "tsx/esm"` — not register() — so Vercel's
 * nft (Node File Trace) bundler statically traces tsx as a dependency and
 * includes it in the function bundle. register() with a string argument
 * is invisible to static analysis tools.
 *
 * tsx must also be in production `dependencies` (not devDependencies)
 * so it is available in Vercel's production runtime environment.
 */

// 1. Static import installs tsx as an ESM loader (side-effect only)
//    nft traces this and bundles the tsx package automatically.
import "tsx/esm";

// 2. Dynamic import runs AFTER tsx is registered as a loader,
//    so Prisma's .ts files in src/generated/prisma/ resolve correctly.
const { default: app } = await import("../src/index.js");

export default app;
