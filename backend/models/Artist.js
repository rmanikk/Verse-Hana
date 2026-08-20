import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    // Audius artist/user ID
    audiusId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 120,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;