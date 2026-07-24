/**
 * Vercel Serverless Entry Point
 *
 * Express app is imported directly — no TypeScript loader needed since
 * Prisma now generates compiled JavaScript to node_modules/@prisma/client.
 */
import app from "../src/index.js";

export default app;
