import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const History = mongoose.model("History", historySchema);

export default History;