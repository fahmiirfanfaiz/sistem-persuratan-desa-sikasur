/**
 * Vercel Serverless Entry Point
 *
 * Vercel runs serverless functions with plain Node.js — TypeScript files (.ts)
 * from the Prisma generated client cannot be imported without a loader.
 *
 * We register tsx as an ESM loader via Node's `module.register()` API
 * BEFORE any other imports so that .ts files resolve correctly at runtime.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Register tsx ESM hook — must come before any TypeScript module is imported
register("tsx/esm", pathToFileURL("./"));

// Dynamically import the Express app AFTER tsx is registered
// so the loader is active when the full module graph (including .ts files) loads
const { default: app } = await import("../src/index.js");

export default app;
