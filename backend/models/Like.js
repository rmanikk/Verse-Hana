import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent the same user from liking the same song twice
likeSchema.index(
  { user: 1, songId: 1 },
  { unique: true }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;