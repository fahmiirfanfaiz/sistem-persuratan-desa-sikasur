/**
 * Vercel Serverless Entry Point
 *
 * Vercel detects this file in /api and routes all requests here.
 * The vercel.json rewrites are configured to proxy every request
 * (including /api/**) through this single handler.
 */
import app from "../src/index.js";

export default app;
