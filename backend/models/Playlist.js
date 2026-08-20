import mongoose from "mongoose";

const playlistSongSchema = new mongoose.Schema(
  {
    songId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    artist: {
      type: String,
      default: "Unknown artist",
    },

    artwork: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const playlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    songs: {
      type: [playlistSongSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

playlistSchema.index({
  user: 1,
  createdAt: -1,
});

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;