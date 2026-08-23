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
  Music2,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import { API_URL } from "../config/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill("")
  );

  const inputRefs = useRef([]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);

  const [countdown, setCountdown] =
    useState(RESEND_SECONDS);

  /* =====================================================
     PASSWORD RULES
  ===================================================== */

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

  /* =====================================================
     OTP COUNTDOWN
  ===================================================== */

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

  /* =====================================================
     EMAIL VALIDATION
  ===================================================== */

  useEffect(() => {
    if (!email) {
      setError(
        "Invalid password reset request."
      );
    }
  }, [email]);

  /* =====================================================
     OTP CHANGE
  ===================================================== */

  const handleOtpChange = (index, value) => {
    setError("");

    const cleanValue = value.replace(/\D/g, "");

    /*
     * Empty value
     */
    if (!cleanValue) {
      setOtp((current) => {
        const updated = [...current];
        updated[index] = "";
        return updated;
      });

      return;
    }

    /*
     * Handle pasted / multiple digits.
     *
     * If the user pastes a 6-digit code,
     * distribute it across all boxes.
     */
    if (cleanValue.length > 1) {
      const digits = cleanValue
        .slice(0, OTP_LENGTH)
        .split("");

      const updated = Array(OTP_LENGTH).fill("");

      digits.forEach((digit, i) => {
        updated[i] = digit;
      });

      setOtp(updated);

      /*
       * Focus the next empty box or
       * the final box.
       */
      const nextIndex = Math.min(
        digits.length,
        OTP_LENGTH - 1
      );

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    /*
     * Normal single-digit input.
     */
    setOtp((current) => {
      const updated = [...current];
      updated[index] = cleanValue;
      return updated;
    });

    /*
     * Move to next box.
     */
    if (
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  /* =====================================================
     OTP KEYBOARD NAVIGATION
  ===================================================== */

  const handleOtpKeyDown = (
    index,
    event
  ) => {
    /*
     * Backspace:
     * If current box is empty,
     * move to previous box.
     */
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }

    /*
     * Arrow left.
     */
    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      event.preventDefault();

      inputRefs.current[
        index - 1
      ]?.focus();
    }

    /*
     * Arrow right.
     */
    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      event.preventDefault();

      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  /* =====================================================
     OTP PASTE
  ===================================================== */

  const handleOtpPaste = (
    index,
    event
  ) => {
    event.preventDefault();

    setError("");

    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    const updated = [...otp];

    pasted.split("").forEach(
      (digit, offset) => {
        const targetIndex =
          index + offset;

        if (
          targetIndex < OTP_LENGTH
        ) {
          updated[targetIndex] = digit;
        }
      }
    );

    setOtp(updated);

    const nextIndex = Math.min(
      index + pasted.length,
      OTP_LENGTH - 1
    );

    inputRefs.current[
      nextIndex
    ]?.focus();
  };

  /* =====================================================
     VERIFY OTP
  ===================================================== */

  const handleVerifyOtp = async () => {
    setError("");

    const cleanOtp = otp.join("");

    if (
      cleanOtp.length !== OTP_LENGTH
    ) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    if (!email) {
      setError(
        "Invalid password reset request."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
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
      setError("");
    } catch (err) {
      setError(
        err.message ||
          "Unable to verify the code."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESEND OTP
  ===================================================== */

  const handleResendOtp = async () => {
    if (
      countdown > 0 ||
      resending ||
      !email
    ) {
      return;
    }

    setError("");

    try {
      setResending(true);

      /*
       * IMPORTANT:
       * Use the dedicated resend endpoint.
       */
      const response = await fetch(
        `${API_URL}/api/auth/resend-reset-otp`,
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

      /*
       * Clear old OTP.
       */
      setOtp(
        Array(OTP_LENGTH).fill("")
      );

      /*
       * Restart countdown.
       */
      setCountdown(
        RESEND_SECONDS
      );

      /*
       * Reset verification state.
       */
      setVerified(false);

      /*
       * Focus first box.
       */
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } catch (err) {
      setError(
        err.message ||
          "Unable to resend the code."
      );
    } finally {
      setResending(false);
    }
  };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handleResetPassword = async (
    event
  ) => {
    event.preventDefault();

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

      const response = await fetch(
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

      /*
       * Redirect to login.
       */
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

  /* =====================================================
     SUCCESS SCREEN
  ===================================================== */

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Logo />

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

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Logo />

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-8">

          {!verified ? (
            <>
              {/* =================================================
                  OTP HEADER
              ================================================= */}

              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                  <ShieldCheck size={26} />
                </div>

                <h1 className="text-2xl font-bold">
                  Verify your email
                </h1>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Enter the 6-digit code sent to
                </p>

                <p className="mt-1 break-all text-sm font-medium text-violet-400">
                  {email || "your email"}
                </p>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <ErrorMessage
                  message={error}
                />
              )}

              {/* =================================================
                  OTP INPUTS
              ================================================= */}

              <div className="mb-6">
                <label className="mb-3 block text-center text-sm font-medium">
                  Verification code
                </label>

                <div className="flex justify-center gap-1.5 xs:gap-2 sm:gap-3">
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
                        autoComplete={
                          index === 0
                            ? "one-time-code"
                            : "off"
                        }
                        maxLength={1}
                        value={digit}
                        aria-label={`Verification digit ${
                          index + 1
                        }`}
                        onChange={(event) =>
                          handleOtpChange(
                            index,
                            event.target
                              .value
                          )
                        }
                        onKeyDown={(event) =>
                          handleOtpKeyDown(
                            index,
                            event
                          )
                        }
                        onPaste={(event) =>
                          handleOtpPaste(
                            index,
                            event
                          )
                        }
                        className="h-11 w-9 rounded-xl border border-white/10 bg-white/5 text-center text-base font-bold outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:h-14 sm:w-12 sm:text-lg"
                      />
                    )
                  )}
                </div>
              </div>

              {/* =================================================
                  VERIFY BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={
                  handleVerifyOtp
                }
                disabled={
                  loading ||
                  otp.join("").length !==
                    OTP_LENGTH
                }
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

              {/* =================================================
                  RESEND
              ================================================= */}

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
                    className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition hover:text-violet-300 disabled:opacity-50"
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
              {/* =================================================
                  PASSWORD HEADER
              ================================================= */}

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
                <ErrorMessage
                  message={error}
                />
              )}

              {/* =================================================
                  PASSWORD FORM
              ================================================= */}

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
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm outline-none placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 transition hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* PASSWORD REQUIREMENTS */}

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
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm outline-none placeholder:text-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 transition hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {confirmPassword &&
                    password !==
                      confirmPassword && (
                      <p className="mt-2 text-xs text-red-400">
                        Passwords do not match.
                      </p>
                    )}
                </div>

                {/* RESET BUTTON */}

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

          {/* =================================================
              BACK TO LOGIN
          ================================================= */}

          <div className="mt-7 text-center">
            <Link
              to="/login"
              className="text-sm text-violet-400 transition hover:text-violet-300"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LOGO
===================================================== */

function Logo() {
  return (
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
  );
}

/* =====================================================
   ERROR MESSAGE
===================================================== */

function ErrorMessage({ message }) {
  return (
    <div className="mb-5 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <X
        size={18}
        className="mt-0.5 shrink-0"
      />

      <span>{message}</span>
    </div>
  );
}

/* =====================================================
   PASSWORD RULE
===================================================== */

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