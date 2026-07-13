import express from "express";
import authRoute from "./routes/authRoute.js";

const app = express();
const port = 5000;

app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})