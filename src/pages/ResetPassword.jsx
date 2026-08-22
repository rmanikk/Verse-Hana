import { useEffect, useRef, useState } from "react";
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
  Mail,
  Music2,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import { API_URL } from "../config/api";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const email =
    searchParams.get("email") || "";

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);

  const inputRefs = useRef([]);

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

  const [resending, setResending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [verified, setVerified] =
    useState(false);

  const [countdown, setCountdown] =
    useState(60);

  /*
   * Password requirements
   */
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

  /*
   * OTP countdown
   */
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((value) =>
        value > 0 ? value - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  /*
   * If email is missing, don't allow reset.
   */
  useEffect(() => {
    if (!email) {
      setError(
        "Invalid password reset request."
      );
    }
  }, [email]);

  /*
   * OTP input handler
   */
  const handleOtpChange = (
    index,
    value
  ) => {
    setError("");

    /*
     * Only allow numbers.
     */
    const cleanValue =
      value.replace(/\D/g, "");

    if (!cleanValue) {
      const updated = [...otp];
      updated[index] = "";

      setOtp(updated);

      return;
    }

    /*
     * Handle pasted/multiple digits.
     */
    if (cleanValue.length > 1) {
      const digits =
        cleanValue.slice(0, 6).split("");

      const updated = [
        "",
        "",
        "",
        "",
        "",
        "",
      ];

      digits.forEach((digit, i) => {
        updated[i] = digit;
      });

      setOtp(updated);

      const nextIndex =
        Math.min(digits.length, 5);

      inputRefs.current[
        nextIndex
      ]?.focus();

      return;
    }

    const updated = [...otp];

    updated[index] = cleanValue;

    setOtp(updated);

    /*
     * Move to next input automatically.
     */
    if (
      cleanValue &&
      index < 5
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  /*
   * Backspace navigation
   */
  const handleOtpKeyDown = (
    index,
    event
  ) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  /*
   * Verify OTP
   */
  const handleVerifyOtp = async () => {
    setError("");

    const cleanOtp =
      otp.join("");

    if (cleanOtp.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/verify-reset-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email,
              otp: cleanOtp,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid verification code."
        );
      }

      setVerified(true);

      /*
       * OTP is verified.
       * The backend should keep the reset authorization
       * temporarily for the password update.
       */
    } catch (err) {
      setError(
        err.message ||
          "Unable to verify the code."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Resend OTP
   */
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) {
      return;
    }

    setError("");

    try {
      setResending(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to resend verification code."
        );
      }

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setCountdown(60);

      setVerified(false);

      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err.message ||
          "Unable to resend the code."
      );
    } finally {
      setResending(false);
    }
  };

  /*
   * Reset password
   */
  const handleResetPassword = async (
    e
  ) => {
    e.preventDefault();

    setError("");

    if (!verified) {
      setError(
        "Please verify your email code first."
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
            credentials: "include",
            body: JSON.stringify({
              email,
              otp: otp.join(""),
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

  /*
   * Success screen
   */
  if (success) {
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">

            <CheckCircle2
              size={56}
              className="mx-auto mb-5 text-green-400"
            />

            <h1 className="text-2xl font-bold">
              Password updated
            </h1>

            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Your VerseHana password has
              been changed successfully.
            </p>

            <p className="mt-5 text-xs text-white/40">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* Logo */}
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

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          {!verified ? (
            <>
              {/* OTP HEADER */}
              <div className="mb-7 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                  <ShieldCheck size={26} />
                </div>

                <h1 className="text-2xl font-bold">
                  Verify your email
                </h1>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Enter the 6-digit code sent
                  to
                </p>

                <p className="mt-1 break-all text-sm font-medium text-violet-400">
                  {email}
                </p>
              </div>

              {/* ERROR */}
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

              {/* OTP */}
              <div className="mb-6">

                <label className="mb-3 block text-center text-sm font-medium">
                  Verification code
                </label>

                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map(
                    (digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          inputRefs.current[
                            index
                          ] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(
                            index,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) =>
                          handleOtpKeyDown(
                            index,
                            e
                          )
                        }
                        className="h-12 w-10 rounded-xl border border-white/10 bg-white/5 text-center text-lg font-bold outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:h-14 sm:w-12"
                      />
                    )
                  )}
                </div>
              </div>

              {/* Verify */}
              <button
                type="button"
                onClick={
                  handleVerifyOtp
                }
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Verifying...
                  </>
                ) : (
                  "Verify code"
                )}
              </button>

              {/* RESEND */}
              <div className="mt-5 text-center">

                {countdown > 0 ? (
                  <p className="text-sm text-white/40">
                    Resend code in{" "}
                    <span className="font-medium text-white/70">
                      {countdown}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleResendOtp
                    }
                    disabled={resending}
                    className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={15}
                      className={
                        resending
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {resending
                      ? "Sending..."
                      : "Resend code"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* PASSWORD HEADER */}
              <div className="mb-7 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <ShieldCheck size={26} />
                </div>

                <h1 className="text-2xl font-bold">
                  Create new password
                </h1>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Your email has been verified.
                  Choose a new password below.
                </p>
              </div>

              {/* ERROR */}
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
                onSubmit={
                  handleResetPassword
                }
                className="space-y-5"
              >

                {/* PASSWORD */}
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

                {/* REQUIREMENTS */}
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

                {/* CONFIRM PASSWORD */}
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

                {/* RESET */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !passwordValid ||
                    password !==
                      confirmPassword
                  }
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
            </>
          )}

          {/* BACK TO LOGIN */}
          <div className="mt-7 text-center">
            <Link
              to="/login"
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Back to login
            </Link>
          </div>

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