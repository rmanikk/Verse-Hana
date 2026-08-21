import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    // Audius track ID
    audiusId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },

    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    moods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mood",
      },
    ],
    genres: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
  },
],

    artwork: {
      type: String,
      trim: true,
      default: "",
    },

    audioUrl: {
      type: String,
      trim: true,
      default: "",
    },

    duration: {
      type: Number,
      min: 0,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

songSchema.index({ title: 1, artist: 1 }, { unique: true });

const Song = mongoose.model("Song", songSchema);

export default Song;