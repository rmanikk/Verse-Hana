import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

const normalizeEmail = (email = "") =>
  email.trim().toLowerCase();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password = "") =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      authVersion: user.authVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

const setAuthCookie = (res, token, rememberMe) => {
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    path: "/",
  };

  if (rememberMe) {
    cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
  }

  res.cookie("token", token, cookie);
};

/*
  Password reset email

  Development:
  If RESEND_API_KEY is not configured, the reset URL
  is printed to the backend console and returned as
  devResetUrl.

  Production:
  Configure Resend so the reset link is emailed.
*/
const sendResetEmail = async ({ email, resetUrl }) => {
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.MAIL_FROM
  ) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[DEV] Password reset link for ${email}: ${resetUrl}`
      );

      return;
    }

    throw new Error(
      "Password reset email is not configured."
    );
  }

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [email],
        subject: "Reset your VerseHana password",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b">
            <h2>Reset your VerseHana password</h2>

            <p>
              We received a request to reset your password.
            </p>

            <p>
              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  padding:12px 18px;
                  border-radius:10px;
                  background:#7c3aed;
                  color:#fff;
                  text-decoration:none;
                "
              >
                Reset password
              </a>
            </p>

            <p>
              This link expires in 60 minutes.
            </p>

            <p>
              If you did not request this,
              you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`Resend error: ${body}`);
  }
};

/* =====================================================
   SIGNUP
===================================================== */

router.post("/signup", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    const email = normalizeEmail(
      req.body.email
    );

    const password = String(
      req.body.password || ""
    );

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({
        message:
          "Name must be between 2 and 60 characters.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message:
          "Please provide a valid email address.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      status: "active",
    });

    return res.status(201).json({
      message: "Account created successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    console.error("Signup error:", error);

    return res.status(500).json({
      message:
        "Server error while creating account.",
    });
  }
});

/* =====================================================
   LOGIN
===================================================== */

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    const password = String(
      req.body.password || ""
    );

    const rememberMe =
      Boolean(req.body.rememberMe);

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message:
          "This account has been suspended.",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const token = createToken(user);

    setAuthCookie(
      res,
      token,
      rememberMe
    );

    return res.status(200).json({
      message: "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message:
        "Server error while logging in.",
    });
  }
});

/* =====================================================
   FORGOT PASSWORD
===================================================== */

router.post(
  "/forgot-password",
  async (req, res) => {
    const genericMessage =
      "If an account exists for that email, a password reset link has been sent.";

    try {
      const email = normalizeEmail(
        req.body.email
      );

      if (!isValidEmail(email)) {
        return res.status(200).json({
          message: genericMessage,
        });
      }

      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(200).json({
          message: genericMessage,
        });
      }

      const rawToken =
        crypto.randomBytes(32).toString("hex");

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(rawToken)
          .digest("hex");

      user.resetPasswordToken =
        hashedToken;

      user.resetPasswordExpires =
        new Date(
          Date.now() +
            60 * 60 * 1000
        );

      await user.save();

      const resetUrl =
        `${CLIENT_URL}/reset-password?token=` +
        encodeURIComponent(rawToken);

      try {
        await sendResetEmail({
          email: user.email,
          resetUrl,
        });
      } catch (mailError) {
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        console.error(
          "Password reset email error:",
          mailError
        );

        return res.status(500).json({
          message:
            "We couldn't send the reset email right now. Please try again later.",
        });
      }

      const payload = {
        message: genericMessage,
      };

      /*
        Development helper only.
        Never returned in production.
      */
      if (
        process.env.NODE_ENV !== "production" &&
        !process.env.RESEND_API_KEY
      ) {
        payload.devResetUrl =
          resetUrl;
      }

      return res.status(200).json(
        payload
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to process the password reset request.",
      });
    }
  }
);

/* =====================================================
   RESET PASSWORD
===================================================== */

router.post(
  "/reset-password",
  async (req, res) => {
    try {
      const rawToken = String(
        req.body.token || ""
      );

      const password = String(
        req.body.password || ""
      );

      if (
        !rawToken ||
        !isStrongPassword(password)
      ) {
        return res.status(400).json({
          message:
            "Please provide a valid reset token and a strong password.",
        });
      }

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(rawToken)
          .digest("hex");

      const user =
        await User.findOne({
          resetPasswordToken:
            hashedToken,

          resetPasswordExpires: {
            $gt: new Date(),
          },
        });

      if (!user) {
        return res.status(400).json({
          message:
            "This reset link is invalid or has expired.",
        });
      }

      user.password =
        await bcrypt.hash(
          password,
          12
        );

      user.authVersion += 1;

      user.resetPasswordToken =
        null;

      user.resetPasswordExpires =
        null;

      await user.save();

      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        path: "/",
      });

      return res.status(200).json({
        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while resetting your password.",
      });
    }
  }
);

/* =====================================================
   CURRENT USER
===================================================== */

router.get(
  "/me",
  protect,
  async (req, res) => {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status:
          req.user.status ||
          "active",
      },
    });
  }
);

/* =====================================================
   LOGOUT
===================================================== */

router.post(
  "/logout",
  (req, res) => {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
    });

    return res.status(200).json({
      message:
        "Logout successful.",
    });
  }
);

export default router;