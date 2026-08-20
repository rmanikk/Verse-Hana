import express from "express";
import Playlist from "../models/Playlist.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=====================================================
CREATE PLAYLIST
POST /api/playlists
=====================================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Playlist name is required.",
      });
    }

    const playlist = await Playlist.create({
      user: req.user.id,
      name: name.trim(),
      description: description?.trim() || "",
      songs: [],
    });

    res.status(201).json({
      message: "Playlist created successfully.",
      playlist,
    });
  } catch (error) {
    console.error("Create playlist error:", error);

    res.status(500).json({
      message: "Failed to create playlist.",
    });
  }
});


/*
=====================================================
GET USER PLAYLISTS
GET /api/playlists
=====================================================
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      playlists,
    });
  } catch (error) {
    console.error("Get playlists error:", error);

    res.status(500).json({
      message: "Failed to fetch playlists.",
    });
  }
});


/*
=====================================================
GET SINGLE PLAYLIST
GET /api/playlists/:playlistId
=====================================================
*/

router.get("/:playlistId", authMiddleware, async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findOne({
      _id: playlistId,
      user: req.user.id,
    });

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found.",
      });
    }

    res.json({
      playlist,
    });
  } catch (error) {
    console.error("Get playlist error:", error);

    res.status(500).json({
      message: "Failed to fetch playlist.",
    });
  }
});


/*
=====================================================
ADD SONG TO PLAYLIST
POST /api/playlists/:playlistId/songs
=====================================================
*/

router.post(
  "/:playlistId/songs",
  authMiddleware,
  async (req, res) => {
    try {
      const { playlistId } = req.params;

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

      const playlist = await Playlist.findOne({
        _id: playlistId,
        user: req.user.id,
      });

      if (!playlist) {
        return res.status(404).json({
          message: "Playlist not found.",
        });
      }

      // Check if song already exists
      const alreadyExists = playlist.songs.some(
        (song) =>
          String(song.songId) === String(songId)
      );

      if (alreadyExists) {
        return res.status(400).json({
          message: "Song already exists in this playlist.",
        });
      }

      playlist.songs.push({
        songId,
        title,
        artist: artist || "Unknown artist",
        artwork: artwork || "",
      });

      await playlist.save();

      res.status(201).json({
        message: "Song added to playlist successfully.",
        playlist,
      });
    } catch (error) {
      console.error("Add song to playlist error:", error);

      res.status(500).json({
        message: "Failed to add song to playlist.",
      });
    }
  }
);


/*
=====================================================
REMOVE SONG FROM PLAYLIST
DELETE /api/playlists/:playlistId/songs/:songId
=====================================================
*/

router.delete(
  "/:playlistId/songs/:songId",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        playlistId,
        songId,
      } = req.params;

      const playlist = await Playlist.findOne({
        _id: playlistId,
        user: req.user.id,
      });

      if (!playlist) {
        return res.status(404).json({
          message: "Playlist not found.",
        });
      }

      const originalLength = playlist.songs.length;

      playlist.songs = playlist.songs.filter(
        (song) =>
          String(song.songId) !== String(songId)
      );

      if (playlist.songs.length === originalLength) {
        return res.status(404).json({
          message: "Song not found in playlist.",
        });
      }

      await playlist.save();

      res.json({
        message: "Song removed from playlist successfully.",
        playlist,
      });
    } catch (error) {
      console.error(
        "Remove song from playlist error:",
        error
      );

      res.status(500).json({
        message: "Failed to remove song from playlist.",
      });
    }
  }
);


/*
=====================================================
DELETE PLAYLIST
DELETE /api/playlists/:playlistId
=====================================================
*/

router.delete(
  "/:playlistId",
  authMiddleware,
  async (req, res) => {
    try {
      const { playlistId } = req.params;

      const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        user: req.user.id,
      });

      if (!playlist) {
        return res.status(404).json({
          message: "Playlist not found.",
        });
      }

      res.json({
        message: "Playlist deleted successfully.",
      });
    } catch (error) {
      console.error("Delete playlist error:", error);

      res.status(500).json({
        message: "Failed to delete playlist.",
      });
    }
  }
);


export default router;