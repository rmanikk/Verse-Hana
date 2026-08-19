import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import audiusRoutes from "./routes/audiusRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ================= ROUTES =================

// Authentication
app.use("/api/auth", authRoutes);
// Music
app.use("/api/music", audiusRoutes);
//Like
app.use("/api/likes", likeRoutes);
//history
app.use("/api/history", historyRoutes);
// Admin
app.use("/api/admin", adminRoutes);
app.use("/api/admin", catalogRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "VerseHana API is running 🎵",
  });
});

// ================= SERVER =================

app.listen(PORT, () => {
  console.log(
    `VerseHana backend running on http://localhost:${PORT}`
  );
});
