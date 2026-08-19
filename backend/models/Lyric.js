import mongoose from "mongoose";

const lyricSchema = new mongoose.Schema(
  {
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    language: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "English",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Lyric = mongoose.model("Lyric", lyricSchema);

export default Lyric;
