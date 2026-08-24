import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   CONFIG
===================================================== */

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password = "") =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);

/* =====================================================
   OTP
===================================================== */

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

/* =====================================================
   JWT
===================================================== */

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

/* =====================================================
   AUTH COOKIE
===================================================== */

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

/* =====================================================
   BREVO SMTP
===================================================== */

const createMailTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error(
      "SMTP email configuration is missing."
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/* =====================================================
   SEND OTP EMAIL
===================================================== */

const sendOTPEmail = async ({ email, otp }) => {
  if (!process.env.MAIL_FROM) {
    throw new Error(
      "MAIL_FROM is missing from environment variables."
    );
  }

  const transporter = createMailTransporter();

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,

      subject:
        "Your VerseHana password reset code",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #18181b;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
          "
        >

          <h2>
            Reset your VerseHana password
          </h2>

          <p>
            We received a request to reset
            the password for your VerseHana
            account.
          </p>

          <p>
            Your verification code is:
          </p>

          <div
            style="
              display: inline-block;
              padding: 14px 24px;
              background: #7c3aed;
              color: white;
              border-radius: 12px;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 10px 0 20px;
            "
          >
            ${otp}
          </div>

          <p>
            This code expires in
            <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password
            reset, you can safely ignore this
            email.
          </p>

          <p
            style="
              color: #71717a;
              font-size: 13px;
            "
          >
            VerseHana Security
          </p>

        </div>
      `,
    });

    console.log(
      `Password reset email sent successfully to ${email}`
    );
  } catch (error) {
    console.error(
      "Brevo SMTP error:",
      error
    );

    throw error;
  }
};

/* =====================================================
   SIGNUP
===================================================== */

router.post("/signup", async (req, res) => {
  try {
    const name = String(
      req.body.name || ""
    ).trim();

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

    if (
      name.length < 2 ||
      name.length > 60
    ) {
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

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      status: "active",
    });

    return res.status(201).json({
      message:
        "Account created successfully.",

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

    console.error(
      "Signup error:",
      error
    );

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

    const rememberMe = Boolean(
      req.body.rememberMe
    );

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
      message:
        "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while logging in.",
    });
  }
});

/* =====================================================
   FORGOT PASSWORD
   SEND OTP
===================================================== */

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body.email
      );

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(404).json({
          message:
            "No account was found with this email address.",
        });
      }

      if (user.status === "suspended") {
        return res.status(403).json({
          message:
            "This account has been suspended.",
        });
      }

      const otp = generateOTP();

      user.resetOtpHash =
        hashOTP(otp);

      user.resetOtpExpires =
        new Date(
          Date.now() + 10 * 60 * 1000
        );

      user.resetOtpAttempts = 0;

      user.resetOtpVerified = false;

      user.resetOtpVerifiedExpires =
        null;

      await user.save();

      try {
        await sendOTPEmail({
          email: user.email,
          otp,
        });
      } catch (mailError) {
        user.resetOtpHash = null;
        user.resetOtpExpires = null;
        user.resetOtpAttempts = 0;
        user.resetOtpVerified = false;
        user.resetOtpVerifiedExpires =
          null;

        await user.save();

        console.error(
          "Password reset email error:",
          mailError
        );

        return res.status(500).json({
          message:
            "We couldn't send the verification code right now. Please try again later.",
        });
      }

      return res.status(200).json({
        message:
          "A verification code has been sent to your email.",
      });
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
   VERIFY RESET OTP
===================================================== */

router.post(
  "/verify-reset-otp",
  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body.email
      );

      const otp = String(
        req.body.otp || ""
      ).trim();

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please provide a valid email address.",
        });
      }

      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          message:
            "Please enter the 6-digit verification code.",
        });
      }

      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(404).json({
          message:
            "No account was found with this email address.",
        });
      }

      if (
        !user.resetOtpHash ||
        !user.resetOtpExpires
      ) {
        return res.status(400).json({
          message:
            "No active verification code was found. Please request a new one.",
        });
      }

      if (
        user.resetOtpExpires < new Date()
      ) {
        user.resetOtpHash = null;
        user.resetOtpExpires = null;
        user.resetOtpAttempts = 0;
        user.resetOtpVerified = false;
        user.resetOtpVerifiedExpires =
          null;

        await user.save();

        return res.status(400).json({
          message:
            "This verification code has expired. Please request a new one.",
        });
      }

      if (
        user.resetOtpAttempts >= 5
      ) {
        user.resetOtpHash = null;
        user.resetOtpExpires = null;
        user.resetOtpAttempts = 0;
        user.resetOtpVerified = false;
        user.resetOtpVerifiedExpires =
          null;

        await user.save();

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new code.",
        });
      }

      const hashedOTP =
        hashOTP(otp);

      if (
        hashedOTP !== user.resetOtpHash
      ) {
        user.resetOtpAttempts += 1;

        await user.save();

        const remaining =
          5 -
          user.resetOtpAttempts;

        return res.status(400).json({
          message:
            remaining > 0
              ? `Incorrect verification code. ${remaining} attempt${
                  remaining === 1
                    ? ""
                    : "s"
                } remaining.`
              : "Too many incorrect attempts. Please request a new code.",
        });
      }

      user.resetOtpVerified = true;

      user.resetOtpVerifiedExpires =
        new Date(
          Date.now() + 10 * 60 * 1000
        );

      await user.save();

      return res.status(200).json({
        message:
          "Verification code confirmed.",
        verified: true,
      });
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while verifying the code.",
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
      const email = normalizeEmail(
        req.body.email
      );

      const otp = String(
        req.body.otp || ""
      ).trim();

      const password = String(
        req.body.password || ""
      );

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please provide a valid email address.",
        });
      }

      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          message:
            "Please provide the 6-digit verification code.",
        });
      }

      if (!isStrongPassword(password)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
        });
      }

      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(404).json({
          message:
            "No account was found with this email address.",
        });
      }

      if (
        !user.resetOtpVerified ||
        !user.resetOtpVerifiedExpires
      ) {
        return res.status(400).json({
          message:
            "Please verify your email code first.",
        });
      }

      if (
        user.resetOtpVerifiedExpires <
        new Date()
      ) {
        user.resetOtpHash = null;
        user.resetOtpExpires = null;
        user.resetOtpAttempts = 0;
        user.resetOtpVerified = false;
        user.resetOtpVerifiedExpires =
          null;

        await user.save();

        return res.status(400).json({
          message:
            "Your verification session has expired. Please request a new code.",
        });
      }

      const hashedOTP =
        hashOTP(otp);

      if (
        hashedOTP !== user.resetOtpHash
      ) {
        return res.status(400).json({
          message:
            "Incorrect verification code.",
        });
      }

      user.password =
        await bcrypt.hash(
          password,
          12
        );

      user.authVersion += 1;

      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;
      user.resetOtpVerified = false;
      user.resetOtpVerifiedExpires =
        null;

      await user.save();

      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite:
          process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
        secure:
          process.env.NODE_ENV === "production",
        path: "/",
      });

      return res.status(200).json({
        message:
          "Password updated successfully. You can now log in with your new password.",
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
   RESEND RESET OTP
===================================================== */

router.post(
  "/resend-reset-otp",
  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body.email
      );

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please provide a valid email address.",
        });
      }

      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(404).json({
          message:
            "No account was found with this email address.",
        });
      }

      if (user.status === "suspended") {
        return res.status(403).json({
          message:
            "This account has been suspended.",
        });
      }

      const otp = generateOTP();

      user.resetOtpHash =
        hashOTP(otp);

      user.resetOtpExpires =
        new Date(
          Date.now() + 10 * 60 * 1000
        );

      user.resetOtpAttempts = 0;
      user.resetOtpVerified = false;
      user.resetOtpVerifiedExpires =
        null;

      await user.save();

      try {
        await sendOTPEmail({
          email: user.email,
          otp,
        });
      } catch (mailError) {
        user.resetOtpHash = null;
        user.resetOtpExpires = null;
        user.resetOtpAttempts = 0;
        user.resetOtpVerified = false;
        user.resetOtpVerifiedExpires =
          null;

        await user.save();

        console.error(
          "Resend OTP email error:",
          mailError
        );

        return res.status(500).json({
          message:
            "We couldn't send a new verification code right now.",
        });
      }

      return res.status(200).json({
        message:
          "A new verification code has been sent.",
      });
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to resend the verification code.",
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
          req.user.status || "active",
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
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      secure:
        process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(200).json({
      message:
        "Logout successful.",
    });
  }
);

export default router;