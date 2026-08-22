import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Music2,
  X,
} from "lucide-react";

import { API_URL } from "../config/api";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

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

    if (!token) {
      setError(
        "This password reset link is invalid."
      );
      return;
    }

    if (!passwordValid) {
      setError(
        "Please choose a stronger password."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/reset-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              token,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reset password."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1800);
    } catch (err) {
      setError(
        err.message ||
          "Unable to reset password."
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

          {success ? (
            <div className="py-8 text-center">
              <CheckCircle2
                size={54}
                className="mx-auto mb-5 text-green-400"
              />

              <h1 className="text-2xl font-bold">
                Password updated
              </h1>

              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Your password has been changed successfully.
              </p>

              <p className="mt-5 text-xs text-white/40">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <h1 className="text-2xl font-bold">
                  Create new password
                </h1>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <X
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    New password
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
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm outline-none placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) =>
                            !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="mb-3 text-xs font-medium text-white/60">
                    Password requirements
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <PasswordRule
                      valid={
                        passwordRules.length
                      }
                      text="8+ characters"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.lowercase
                      }
                      text="Lowercase"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.uppercase
                      }
                      text="Uppercase"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.number
                      }
                      text="Number"
                    />
                  </div>
                </div>

                <div>
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
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm outline-none placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) =>
                            !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </form>

              <div className="mt-7 text-center">
                <Link
                  to="/login"
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordRule({
  valid,
  text,
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid
          ? "text-green-400"
          : "text-white/40"
      }`}
    >
      {valid ? (
        <CheckCircle2 size={14} />
      ) : (
        <X size={14} />
      )}

      {text}
    </div>
  );
}