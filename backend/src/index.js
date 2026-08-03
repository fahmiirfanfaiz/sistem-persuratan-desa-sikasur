import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import letterRoute from "./routes/letterRoute.js";
import submissionRoute from "./routes/submissionRoute.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";

const app = express();

// Build allowed origins list:
// - Always include localhost for local development
// - Append any extra origins from ALLOWED_ORIGINS env var (comma-separated)
const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "https://persuratan-sikasur.vercel.app",
];

const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...defaultOrigins, ...extraOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health-check endpoint (useful for Vercel & uptime monitors)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoute);
app.use("/api/letters", letterRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/users", userRoute);
app.use("/api/admin", adminRoute);

// Global error handling middleware (handles Multer errors, validation errors, etc.)
app.use((err, _req, res, _next) => {
  if (err && err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file terlalu besar. Maksimal ukuran per dokumen adalah 2 MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Kendala unggah dokumen: ${err.message}`,
    });
  }

  if (err) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message || "Terjadi kesalahan pada server.",
    });
  }
});

// Only bind to a port when running locally (not when imported by Vercel handler)
if (process.env.VERCEL !== "1") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
