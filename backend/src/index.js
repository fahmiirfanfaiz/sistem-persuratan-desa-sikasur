import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import letterRoute from "./routes/letterRoute.js";
import submissionRoute from "./routes/submissionRoute.js";
import userRoute from "./routes/userRoute.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ],
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/letters", letterRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/users", userRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
