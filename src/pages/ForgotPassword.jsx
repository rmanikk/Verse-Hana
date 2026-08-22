import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Music2,
} from "lucide-react";

import { API_URL } from "../config/api";

export default function ForgotPassword() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [devResetUrl, setDevResetUrl] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setDevResetUrl("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
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

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/forgot-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              email: cleanEmail,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to process request."
        );
      }

      setMessage(
        data.message
      );

      if (data.devResetUrl) {
        setDevResetUrl(
          data.devResetUrl
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="mb-8 flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600">
              <Music2
                size={23}
                className="text-white"
              />
            </div>

            <span className="text-2xl font-bold">
              VerseHana
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
              <Mail size={25} />
            </div>

            <h1 className="text-2xl font-bold">
              Forgot password?
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Enter your email and we'll help you reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          {devResetUrl && (
            <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-yellow-400">
                Development reset link
              </p>

              <a
                href={devResetUrl}
                className="break-all text-sm text-yellow-200 underline"
              >
                {devResetUrl}
              </a>
            </div>
          )}

          <div className="mt-7 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}