import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiArrowRight, HiMusicalNote } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Frontend validation
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      // Login successful
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message || "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">

        {/* Ambient Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-180px] top-[-120px] h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[150px]" />

          <div className="absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[140px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-md">

          {/* Brand */}
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <HiMusicalNote className="text-xl" />
              </div>

              <span className="text-2xl font-extrabold tracking-tight">
                Verse
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Hana
                </span>
              </span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)]/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">

            {/* Heading */}
            <div className="text-center">

              <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-400">
                🎧 Welcome back
              </span>

              <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Sign in and continue your musical journey.
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
                  >
                    Forgot password?
                  </Link>

                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Remember Me */}
              <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded accent-violet-600"
                />

                <span>
                  Remember me
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? "Logging in..." : "Login"}

                {!loading && (
                  <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </button>

            </form>

            {/* Signup */}
            <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
              Don't have an account?{" "}

              <Link
                to="/signup"
                className="font-semibold text-violet-400 transition hover:text-violet-300"
              >
                Create account
              </Link>
            </p>

          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-[var(--text-muted)] transition hover:text-violet-400"
            >
              ← Back to VerseHana
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Login;