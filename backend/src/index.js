import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})