import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Music2,
  X,
} from "lucide-react";

import { API_URL } from "../config/api";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordRules = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  const passwordValid =
    passwordRules.length &&
    passwordRules.lowercase &&
    passwordRules.uppercase &&
    passwordRules.number;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (cleanName.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (cleanName.length > 60) {
      setError(
        "Name must be 60 characters or less."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!passwordValid) {
      setError(
        "Please choose a stronger password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create your account."
        );
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      setError(
        err.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-3 py-6 text-[var(--text-primary)] sm:px-4 sm:py-8">
      <div className="w-full max-w-md min-w-0">

        {/* Logo */}
        <div className="mb-7 flex justify-center sm:mb-8">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600">
              <Music2
                size={23}
                className="text-white"
              />
            </div>

            <span className="text-xl font-bold sm:text-2xl">
              VerseHana
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-8">

          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Start your VerseHana journey
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 break-words rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 break-words rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm leading-5 text-green-400">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Name */}
            <div className="min-w-0">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                disabled={loading}
                maxLength={60}
                className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div className="min-w-0">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                disabled={loading}
                className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="min-w-0">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  disabled={loading}
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-14 text-sm outline-none transition placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Password rules */}
            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <p className="mb-3 text-xs font-medium text-white/60">
                Password must contain:
              </p>

              <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                <PasswordRule
                  valid={passwordRules.length}
                  text="8+ characters"
                />

                <PasswordRule
                  valid={passwordRules.lowercase}
                  text="Lowercase letter"
                />

                <PasswordRule
                  valid={passwordRules.uppercase}
                  text="Uppercase letter"
                />

                <PasswordRule
                  valid={passwordRules.number}
                  text="Number"
                />
              </div>
            </div>

            {/* Confirm password */}
            <div className="min-w-0">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  disabled={loading}
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-14 text-sm outline-none transition placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Login */}
          <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-white/40 hover:text-white/70"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 text-xs ${
        valid
          ? "text-green-400"
          : "text-white/40"
      }`}
    >
      {valid ? (
        <Check
          size={14}
          className="shrink-0"
        />
      ) : (
        <X
          size={14}
          className="shrink-0"
        />
      )}

      <span className="break-words">
        {text}
      </span>
    </div>
  );
}