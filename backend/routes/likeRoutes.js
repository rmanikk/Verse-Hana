import express from "express";
import Like from "../models/Like.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=====================================================
LIKE SONG
POST /api/likes/:songId
=====================================================
*/

router.post("/:songId", authMiddleware, async (req, res) => {
  try {
    const { songId } = req.params;

    const {
      title,
      artist,
      artwork,
    } = req.body;

    // Check if already liked
    const existingLike = await Like.findOne({
      user: req.user.id,
      songId,
    });

    if (existingLike) {
      return res.status(400).json({
        message: "Song already liked.",
      });
    }

    const like = await Like.create({
      user: req.user.id,
      songId,
      title,
      artist,
      artwork,
    });

    res.status(201).json({
      message: "Song liked successfully.",
      like,
    });

  } catch (error) {
    console.error("Like song error:", error);

    res.status(500).json({
      message: "Failed to like song.",
    });
  }
});


/*
=====================================================
UNLIKE SONG
DELETE /api/likes/:songId
=====================================================
*/

router.delete("/:songId", authMiddleware, async (req, res) => {
  try {
    const { songId } = req.params;

    const like = await Like.findOneAndDelete({
      user: req.user.id,
      songId,
    });

    if (!like) {
      return res.status(404).json({
        message: "Song is not liked.",
      });
    }

    res.json({
      message: "Song unliked successfully.",
    });

  } catch (error) {
    console.error("Unlike song error:", error);

    res.status(500).json({
      message: "Failed to unlike song.",
    });
  }
});


/*
=====================================================
GET LIKED SONGS
GET /api/likes
=====================================================
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const likes = await Like.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      likes,
    });

  } catch (error) {
    console.error("Get liked songs error:", error);

    res.status(500).json({
      message: "Failed to fetch liked songs.",
    });
  }
});


/*
=====================================================
CHECK IF SONG IS LIKED
GET /api/likes/:songId
=====================================================
*/

router.get("/:songId", authMiddleware, async (req, res) => {
  try {
    const { songId } = req.params;

    const like = await Like.findOne({
      user: req.user.id,
      songId,
    });

    res.json({
      liked: !!like,
    });

  } catch (error) {
    console.error("Check like error:", error);

    res.status(500).json({
      message: "Failed to check like status.",
    });
  }
});


export default router;