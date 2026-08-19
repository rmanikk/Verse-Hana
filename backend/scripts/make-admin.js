import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run make-admin -- you@example.com");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing from backend/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin", status: "active" },
    { new: true }
  );

  if (!user) {
    console.error(`No account was found for ${email}. Create it first, then run this command again.`);
    process.exitCode = 1;
  } else {
    console.log(`${user.email} is now an admin.`);
  }
} catch (error) {
  console.error("Could not promote the account:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
