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
import playlistRoutes from "./routes/playlistRoutes.js";

dotenv.config();

connectDB();

const app = express();

const PORT =
  process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/music",
  audiusRoutes
);

app.use(
  "/api/likes",
  likeRoutes
);

app.use(
  "/api/playlists",
  playlistRoutes
);

app.use(
  "/api/history",
  historyRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin",
  catalogRoutes
);

app.get("/", (req, res) => {
  res.json({
    message:
      "VerseHana API is running 🎵",
  });
});

app.listen(PORT, () => {
  console.log(
    `VerseHana backend running on http://localhost:${PORT}`
  );
});