import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 60,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^[a-z0-9-]+$/,
    },
    emoji: {
      type: String,
      trim: true,
      maxlength: 12,
      default: "🎵",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      maxlength: 24,
      default: "#8b5cf6",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Mood = mongoose.model("Mood", moodSchema);

export default Mood;
