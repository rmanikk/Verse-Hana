import express from "express";
import mongoose from "mongoose";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import Artist from "../models/Artist.js";
import Mood from "../models/Mood.js";
import Song from "../models/Song.js";
import Lyric from "../models/Lyric.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query) => {
  const pageValue = Number.parseInt(query.page, 10);
  const limitValue = Number.parseInt(query.limit, 10);

  return {
    page: Number.isNaN(pageValue) ? 1 : Math.max(pageValue, 1),
    limit: Number.isNaN(limitValue)
      ? 12
      : Math.min(Math.max(limitValue, 1), 100),
  };
};

const makePagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
};

const toSlug = (value) =>
  toText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const validObjectId = (value) => mongoose.isValidObjectId(value);

const getSearchFilter = (search, fields) => {
  if (!search) {
    return {};
  }

  const expression = new RegExp(escapeRegex(search), "i");
  return { $or: fields.map((field) => ({ [field]: expression })) };
};

const uniqueIds = (values) => {
  if (!Array.isArray(values) || values.some((value) => !validObjectId(value))) {
    return null;
  }

  return [...new Set(values.map(String))];
};

const verifyMoods = async (moodIds) => {
  const ids = uniqueIds(moodIds);

  if (ids === null) {
    return null;
  }

  const count = await Mood.countDocuments({ _id: { $in: ids } });
  return count === ids.length ? ids : null;
};

const writeAudit = async ({ req, action, entityType, targetName, previousValue = "", nextValue = "" }) => {
  await AuditLog.create({
    actor: req.user._id,
    action,
    entityType,
    targetName,
    previousValue,
    nextValue,
  });
};

const sendRouteError = (res, error, label) => {
  console.error(`${label} error:`, error);

  if (error.code === 11000) {
    return res.status(409).json({
      message: "An item with that unique value already exists.",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: `Failed to ${label.toLowerCase()}.` });
};

router.use(protect, adminOnly);

router.get("/artists", async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query);
    const search = toText(req.query.search).slice(0, 80);
    const filter = getSearchFilter(search, ["name", "country"]);
    const [items, total] = await Promise.all([
      Artist.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Artist.countDocuments(filter),
    ]);

    return res.json({ items, pagination: makePagination({ page, limit, total }) });
  } catch (error) {
    return sendRouteError(res, error, "load artists");
  }
});

router.post("/artists", async (req, res) => {
  try {
    const name = toText(req.body.name);

    if (!name) {
      return res.status(400).json({ message: "Artist name is required." });
    }

    const artist = await Artist.create({
      name,
      bio: toText(req.body.bio),
      imageUrl: toText(req.body.imageUrl),
      country: toText(req.body.country),
      isFeatured: toBoolean(req.body.isFeatured),
    });
    await writeAudit({ req, action: "artist.created", entityType: "artist", targetName: artist.name, nextValue: "created" });

    return res.status(201).json({ item: artist });
  } catch (error) {
    return sendRouteError(res, error, "create artist");
  }
});

router.patch("/artists/:artistId", async (req, res) => {
  try {
    if (!validObjectId(req.params.artistId)) {
      return res.status(400).json({ message: "Invalid artist ID." });
    }

    const updates = {};
    ["name", "bio", "imageUrl", "country"].forEach((field) => {
      if (field in req.body) updates[field] = toText(req.body[field]);
    });
    if ("isFeatured" in req.body) updates.isFeatured = toBoolean(req.body.isFeatured);

    if ("name" in updates && !updates.name) {
      return res.status(400).json({ message: "Artist name is required." });
    }

    const artist = await Artist.findByIdAndUpdate(req.params.artistId, updates, {
      new: true,
      runValidators: true,
    });

    if (!artist) return res.status(404).json({ message: "Artist not found." });
    await writeAudit({ req, action: "artist.updated", entityType: "artist", targetName: artist.name, nextValue: "updated" });

    return res.json({ item: artist });
  } catch (error) {
    return sendRouteError(res, error, "update artist");
  }
});

router.delete("/artists/:artistId", async (req, res) => {
  try {
    if (!validObjectId(req.params.artistId)) {
      return res.status(400).json({ message: "Invalid artist ID." });
    }

    const artist = await Artist.findById(req.params.artistId);
    if (!artist) return res.status(404).json({ message: "Artist not found." });

    const songCount = await Song.countDocuments({ artist: artist._id });
    if (songCount) {
      return res.status(409).json({
        message: "Delete or reassign this artist's songs before deleting the artist.",
      });
    }

    await artist.deleteOne();
    await writeAudit({ req, action: "artist.deleted", entityType: "artist", targetName: artist.name, previousValue: "active", nextValue: "deleted" });

    return res.json({ message: "Artist deleted." });
  } catch (error) {
    return sendRouteError(res, error, "delete artist");
  }
});

router.get("/moods", async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query);
    const search = toText(req.query.search).slice(0, 80);
    const filter = getSearchFilter(search, ["name", "slug", "description"]);
    const [items, total] = await Promise.all([
      Mood.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Mood.countDocuments(filter),
    ]);

    return res.json({ items, pagination: makePagination({ page, limit, total }) });
  } catch (error) {
    return sendRouteError(res, error, "load moods");
  }
});

router.post("/moods", async (req, res) => {
  try {
    const name = toText(req.body.name);
    const slug = toSlug(req.body.slug || name);

    if (!name || !slug) {
      return res.status(400).json({ message: "Mood name and a valid slug are required." });
    }

    const mood = await Mood.create({
      name,
      slug,
      emoji: toText(req.body.emoji) || "🎵",
      description: toText(req.body.description),
      color: toText(req.body.color) || "#8b5cf6",
      isActive: toBoolean(req.body.isActive, true),
    });
    await writeAudit({ req, action: "mood.created", entityType: "mood", targetName: mood.name, nextValue: "created" });

    return res.status(201).json({ item: mood });
  } catch (error) {
    return sendRouteError(res, error, "create mood");
  }
});

router.patch("/moods/:moodId", async (req, res) => {
  try {
    if (!validObjectId(req.params.moodId)) {
      return res.status(400).json({ message: "Invalid mood ID." });
    }

    const updates = {};
    ["name", "emoji", "description", "color"].forEach((field) => {
      if (field in req.body) updates[field] = toText(req.body[field]);
    });
    if ("slug" in req.body) updates.slug = toSlug(req.body.slug);
    if ("isActive" in req.body) updates.isActive = toBoolean(req.body.isActive);

    if (("name" in updates && !updates.name) || ("slug" in updates && !updates.slug)) {
      return res.status(400).json({ message: "Mood name and slug are required." });
    }

    const mood = await Mood.findByIdAndUpdate(req.params.moodId, updates, {
      new: true,
      runValidators: true,
    });

    if (!mood) return res.status(404).json({ message: "Mood not found." });
    await writeAudit({ req, action: "mood.updated", entityType: "mood", targetName: mood.name, nextValue: "updated" });

    return res.json({ item: mood });
  } catch (error) {
    return sendRouteError(res, error, "update mood");
  }
});

router.delete("/moods/:moodId", async (req, res) => {
  try {
    if (!validObjectId(req.params.moodId)) {
      return res.status(400).json({ message: "Invalid mood ID." });
    }

    const mood = await Mood.findById(req.params.moodId);
    if (!mood) return res.status(404).json({ message: "Mood not found." });

    const songCount = await Song.countDocuments({ moods: mood._id });
    if (songCount) {
      return res.status(409).json({
        message: "Remove this mood from its songs before deleting it.",
      });
    }

    await mood.deleteOne();
    await writeAudit({ req, action: "mood.deleted", entityType: "mood", targetName: mood.name, previousValue: "active", nextValue: "deleted" });

    return res.json({ message: "Mood deleted." });
  } catch (error) {
    return sendRouteError(res, error, "delete mood");
  }
});

const validateSongRelations = async ({ artist, moods }) => {
  if (!validObjectId(artist) || !(await Artist.exists({ _id: artist }))) {
    return { error: "Choose a valid artist." };
  }

  const moodIds = await verifyMoods(moods || []);
  if (moodIds === null) {
    return { error: "One or more selected moods no longer exist." };
  }

  return { artist, moods: moodIds };
};

router.get("/songs", async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query);
    const search = toText(req.query.search).slice(0, 80);
    const filter = getSearchFilter(search, ["title"]);
    const [items, total] = await Promise.all([
      Song.find(filter)
        .populate("artist", "name")
        .populate("moods", "name emoji color")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Song.countDocuments(filter),
    ]);

    return res.json({ items, pagination: makePagination({ page, limit, total }) });
  } catch (error) {
    return sendRouteError(res, error, "load songs");
  }
});

router.post("/songs", async (req, res) => {
  try {
    const title = toText(req.body.title);
    if (!title) return res.status(400).json({ message: "Song title is required." });

    const relations = await validateSongRelations(req.body);
    if (relations.error) return res.status(400).json({ message: relations.error });

    const duration = Number(req.body.duration || 0);
    if (Number.isNaN(duration) || duration < 0) {
      return res.status(400).json({ message: "Duration must be zero or greater." });
    }

    const song = await Song.create({
      title,
      artist: relations.artist,
      moods: relations.moods,
      artwork: toText(req.body.artwork),
      audioUrl: toText(req.body.audioUrl),
      duration,
      isPublished: toBoolean(req.body.isPublished),
    });
    await writeAudit({ req, action: "song.created", entityType: "song", targetName: song.title, nextValue: "created" });

    await song.populate(["artist", "moods"]);
    return res.status(201).json({ item: song });
  } catch (error) {
    return sendRouteError(res, error, "create song");
  }
});

router.patch("/songs/:songId", async (req, res) => {
  try {
    if (!validObjectId(req.params.songId)) {
      return res.status(400).json({ message: "Invalid song ID." });
    }

    const updates = {};
    ["title", "artwork", "audioUrl"].forEach((field) => {
      if (field in req.body) updates[field] = toText(req.body[field]);
    });
    if ("isPublished" in req.body) updates.isPublished = toBoolean(req.body.isPublished);
    if ("duration" in req.body) {
      const duration = Number(req.body.duration);
      if (Number.isNaN(duration) || duration < 0) {
        return res.status(400).json({ message: "Duration must be zero or greater." });
      }
      updates.duration = duration;
    }
    if ("title" in updates && !updates.title) {
      return res.status(400).json({ message: "Song title is required." });
    }
    if ("artist" in req.body) {
      if (!validObjectId(req.body.artist) || !(await Artist.exists({ _id: req.body.artist }))) {
        return res.status(400).json({ message: "Choose a valid artist." });
      }
      updates.artist = req.body.artist;
    }
    if ("moods" in req.body) {
      const moodIds = await verifyMoods(req.body.moods);
      if (moodIds === null) {
        return res.status(400).json({ message: "One or more selected moods no longer exist." });
      }
      updates.moods = moodIds;
    }

    const song = await Song.findByIdAndUpdate(req.params.songId, updates, {
      new: true,
      runValidators: true,
    }).populate("artist", "name").populate("moods", "name emoji color");

    if (!song) return res.status(404).json({ message: "Song not found." });
    await writeAudit({ req, action: "song.updated", entityType: "song", targetName: song.title, nextValue: "updated" });

    return res.json({ item: song });
  } catch (error) {
    return sendRouteError(res, error, "update song");
  }
});

router.delete("/songs/:songId", async (req, res) => {
  try {
    if (!validObjectId(req.params.songId)) {
      return res.status(400).json({ message: "Invalid song ID." });
    }

    const song = await Song.findByIdAndDelete(req.params.songId);
    if (!song) return res.status(404).json({ message: "Song not found." });

    await Lyric.deleteMany({ song: song._id });
    await writeAudit({ req, action: "song.deleted", entityType: "song", targetName: song.title, previousValue: "active", nextValue: "deleted" });

    return res.json({ message: "Song and its linked lyrics were deleted." });
  } catch (error) {
    return sendRouteError(res, error, "delete song");
  }
});

router.get("/lyrics", async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query);
    const search = toText(req.query.search).slice(0, 80);
    const songFilter = search ? getSearchFilter(search, ["title"]) : {};
    const matchingSongs = search ? await Song.find(songFilter).select("_id").lean() : null;
    const filter = matchingSongs ? { song: { $in: matchingSongs.map((song) => song._id) } } : {};
    const [items, total] = await Promise.all([
      Lyric.find(filter)
        .populate({ path: "song", select: "title artist", populate: { path: "artist", select: "name" } })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lyric.countDocuments(filter),
    ]);

    return res.json({ items, pagination: makePagination({ page, limit, total }) });
  } catch (error) {
    return sendRouteError(res, error, "load lyrics");
  }
});

router.post("/lyrics", async (req, res) => {
  try {
    const song = req.body.song;
    const content = toText(req.body.content);

    if (!validObjectId(song) || !(await Song.exists({ _id: song }))) {
      return res.status(400).json({ message: "Choose a valid song." });
    }
    if (!content) return res.status(400).json({ message: "Lyric content is required." });
    if (await Lyric.exists({ song })) {
      return res.status(409).json({ message: "This song already has lyrics. Edit the existing lyrics instead." });
    }

    const lyric = await Lyric.create({
      song,
      content,
      language: toText(req.body.language) || "English",
      isPublished: toBoolean(req.body.isPublished),
    });
    await lyric.populate({ path: "song", select: "title artist", populate: { path: "artist", select: "name" } });
    await writeAudit({ req, action: "lyric.created", entityType: "lyric", targetName: lyric.song.title, nextValue: "created" });

    return res.status(201).json({ item: lyric });
  } catch (error) {
    return sendRouteError(res, error, "create lyrics");
  }
});

router.patch("/lyrics/:lyricId", async (req, res) => {
  try {
    if (!validObjectId(req.params.lyricId)) {
      return res.status(400).json({ message: "Invalid lyric ID." });
    }

    const updates = {};
    ["content", "language"].forEach((field) => {
      if (field in req.body) updates[field] = toText(req.body[field]);
    });
    if ("isPublished" in req.body) updates.isPublished = toBoolean(req.body.isPublished);
    if ("song" in req.body) {
      if (!validObjectId(req.body.song) || !(await Song.exists({ _id: req.body.song }))) {
        return res.status(400).json({ message: "Choose a valid song." });
      }
      updates.song = req.body.song;
    }
    if ("content" in updates && !updates.content) {
      return res.status(400).json({ message: "Lyric content is required." });
    }

    const lyric = await Lyric.findByIdAndUpdate(req.params.lyricId, updates, {
      new: true,
      runValidators: true,
    }).populate({ path: "song", select: "title artist", populate: { path: "artist", select: "name" } });

    if (!lyric) return res.status(404).json({ message: "Lyrics not found." });
    await writeAudit({ req, action: "lyric.updated", entityType: "lyric", targetName: lyric.song.title, nextValue: "updated" });

    return res.json({ item: lyric });
  } catch (error) {
    return sendRouteError(res, error, "update lyrics");
  }
});

router.delete("/lyrics/:lyricId", async (req, res) => {
  try {
    if (!validObjectId(req.params.lyricId)) {
      return res.status(400).json({ message: "Invalid lyric ID." });
    }

    const lyric = await Lyric.findByIdAndDelete(req.params.lyricId)
      .populate({ path: "song", select: "title" });
    if (!lyric) return res.status(404).json({ message: "Lyrics not found." });

    await writeAudit({ req, action: "lyric.deleted", entityType: "lyric", targetName: lyric.song?.title || "lyrics", previousValue: "active", nextValue: "deleted" });

    return res.json({ message: "Lyrics deleted." });
  } catch (error) {
    return sendRouteError(res, error, "delete lyrics");
  }
});

export default router;
