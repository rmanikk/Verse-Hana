import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "This account has been suspended.",
      });
    }

    if ((decoded.authVersion ?? 0) !== user.authVersion) {
      return res.status(401).json({
        message:
          "Your session is no longer valid. Please sign in again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication.",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
};

export default protect;