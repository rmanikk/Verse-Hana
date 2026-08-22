import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

/*
  Generates a secure 6-digit OTP.
*/
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
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
   SEND OTP EMAIL
===================================================== */

/*
  Uses Resend in production.

  Required .env variables:

  RESEND_API_KEY=your_resend_api_key
  MAIL_FROM=VerseHana <your_verified_email@domain.com>

  Development:
  If Resend is not configured, the OTP is printed
  in the backend terminal.
*/

const sendOTPEmail = async ({ email, otp }) => {
  /*
    DEVELOPMENT MODE

    If Resend isn't configured, don't fail the
    password-reset flow. Print the OTP instead.
  */

  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
    if (process.env.NODE_ENV !== "production") {
      console.log("");
      console.log("==========================================");
      console.log("VERSEHANA PASSWORD RESET OTP");
      console.log(`Email: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log("Expires in: 10 minutes");
      console.log("==========================================");
      console.log("");

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

        subject: "Your VerseHana password reset OTP",

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

            <h2 style="margin-bottom: 10px;">
              Reset your VerseHana password
            </h2>

            <p>
              We received a request to reset the password
              for your VerseHana account.
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
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <p style="color: #71717a; font-size: 13px;">
              VerseHana Security
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

    const email = normalizeEmail(req.body.email);

    const password = String(req.body.password || "");

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
    const email = normalizeEmail(req.body.email);

    const password = String(req.body.password || "");

    const rememberMe = Boolean(req.body.rememberMe);

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
   FORGOT PASSWORD — SEND OTP
===================================================== */

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body.email
      );

      /*
        IMPORTANT:

        You specifically wanted the reset process
        to NOT continue when the email isn't in
        the database.

        Therefore we return 404 here.
      */

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

      /*
        Don't allow suspended accounts to start
        a password reset.
      */

      if (user.status === "suspended") {
        return res.status(403).json({
          message:
            "This account has been suspended.",
        });
      }

      /*
        Generate a 6-digit OTP.
      */

      const otp = generateOTP();

      /*
        Store only a HASH of the OTP in MongoDB.

        If the database is ever exposed, the actual
        OTP isn't directly visible.
      */

      const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      user.resetPasswordOtp = hashedOTP;

      /*
        OTP expires after 10 minutes.
      */

      user.resetPasswordOtpExpires =
        new Date(
          Date.now() + 10 * 60 * 1000
        );

      /*
        Reset attempts whenever a new OTP
        is generated.
      */

      user.resetPasswordOtpAttempts = 0;

      await user.save();

      /*
        Send OTP email.
      */

      try {
        await sendOTPEmail({
          email: user.email,
          otp,
        });
      } catch (mailError) {
        /*
          Don't leave a usable OTP in the database
          if email delivery failed.
        */

        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;
        user.resetPasswordOtpAttempts = 0;

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
   VERIFY OTP
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

      /*
        Make sure an OTP actually exists.
      */

      if (
        !user.resetPasswordOtp ||
        !user.resetPasswordOtpExpires
      ) {
        return res.status(400).json({
          message:
            "No active verification code was found. Please request a new one.",
        });
      }

      /*
        Check expiration.
      */

      if (
        user.resetPasswordOtpExpires <
        new Date()
      ) {
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;
        user.resetPasswordOtpAttempts = 0;

        await user.save();

        return res.status(400).json({
          message:
            "This verification code has expired. Please request a new one.",
        });
      }

      /*
        Prevent unlimited OTP attempts.

        Maximum: 5 attempts.
      */

      if (
        user.resetPasswordOtpAttempts >= 5
      ) {
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;
        user.resetPasswordOtpAttempts = 0;

        await user.save();

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new code.",
        });
      }

      /*
        Hash the submitted OTP and compare
        it against the stored hash.
      */

      const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      if (
        hashedOTP !== user.resetPasswordOtp
      ) {
        user.resetPasswordOtpAttempts += 1;

        await user.save();

        const remaining =
          5 -
          user.resetPasswordOtpAttempts;

        return res.status(400).json({
          message:
            remaining > 0
              ? `Incorrect verification code. ${remaining} attempt${
                  remaining === 1 ? "" : "s"
                } remaining.`
              : "Too many incorrect attempts. Please request a new code.",
        });
      }

      /*
        OTP is correct.

        We don't change the password yet.

        The frontend can now move the user to
        the "new password" screen.
      */

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

      /*
        Make sure OTP exists.
      */

      if (
        !user.resetPasswordOtp ||
        !user.resetPasswordOtpExpires
      ) {
        return res.status(400).json({
          message:
            "Your verification session has expired. Please request a new code.",
        });
      }

      /*
        Check expiration.
      */

      if (
        user.resetPasswordOtpExpires <
        new Date()
      ) {
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;
        user.resetPasswordOtpAttempts = 0;

        await user.save();

        return res.status(400).json({
          message:
            "This verification code has expired. Please request a new one.",
        });
      }

      /*
        Don't allow more than 5 attempts.
      */

      if (
        user.resetPasswordOtpAttempts >= 5
      ) {
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;
        user.resetPasswordOtpAttempts = 0;

        await user.save();

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new code.",
        });
      }

      /*
        Verify OTP again.

        IMPORTANT:

        We verify the OTP AGAIN here instead of
        trusting the frontend's previous verification.

        This prevents someone from simply modifying
        frontend requests and skipping OTP verification.
      */

      const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      if (
        hashedOTP !== user.resetPasswordOtp
      ) {
        user.resetPasswordOtpAttempts += 1;

        await user.save();

        return res.status(400).json({
          message:
            "Incorrect verification code.",
        });
      }

      /*
        Everything is valid.

        Update password.
      */

      user.password =
        await bcrypt.hash(
          password,
          12
        );

      /*
        Increment authVersion.

        This invalidates previously issued JWTs
        if your auth middleware checks authVersion.
      */

      user.authVersion += 1;

      /*
        Clear OTP immediately.

        OTP can never be reused.
      */

      user.resetPasswordOtp = null;

      user.resetPasswordOtpExpires = null;

      user.resetPasswordOtpAttempts = 0;

      await user.save();

      /*
        Clear any existing authentication cookie.
      */

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
   RESEND OTP
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

      /*
        Generate new OTP.
      */

      const otp = generateOTP();

      const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      user.resetPasswordOtp = hashedOTP;

      user.resetPasswordOtpExpires =
        new Date(
          Date.now() + 10 * 60 * 1000
        );

      user.resetPasswordOtpAttempts = 0;

      await user.save();

      try {
        await sendOTPEmail({
          email: user.email,
          otp,
        });
      } catch (mailError) {
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;
        user.resetPasswordOtpAttempts = 0;

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