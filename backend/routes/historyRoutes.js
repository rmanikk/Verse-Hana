import express from "express";
import History from "../models/History.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=====================================================
ADD SONG TO HISTORY
POST /api/history
=====================================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      songId,
      title,
      artist,
      artwork,
    } = req.body;

    if (!songId || !title) {
      return res.status(400).json({
        message: "Song ID and title are required.",
      });
    }

    const history = await History.create({
      user: req.user.id,
      songId,
      title,
      artist,
      artwork,
      playedAt: new Date(),
    });

    res.status(201).json({
      message: "Song added to history.",
      history,
    });

  } catch (error) {
    console.error("Add history error:", error);

    res.status(500).json({
      message: "Failed to add song to history.",
    });
  }
});


/*
=====================================================
GET RECENTLY PLAYED
GET /api/history
=====================================================
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const history = await History.find({
      user: req.user.id,
    })
      .sort({
        playedAt: -1,
      })
      .limit(20);

    res.json({
      history,
    });

  } catch (error) {
    console.error("Get history error:", error);

    res.status(500).json({
      message: "Failed to fetch recently played songs.",
    });
  }
});


/*
=====================================================
CLEAR HISTORY
DELETE /api/history
=====================================================
*/

router.delete("/", authMiddleware, async (req, res) => {
  try {
    await History.deleteMany({
      user: req.user.id,
    });

    res.json({
      message: "Recently played history cleared.",
    });

  } catch (error) {
    console.error("Clear history error:", error);

    res.status(500).json({
      message: "Failed to clear history.",
    });
  }
});


export default router;