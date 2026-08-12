import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "VerseHana API is running 🎵",
  });
});

app.listen(PORT, () => {
  console.log(`VerseHana backend running on http://localhost:${PORT}`);
});