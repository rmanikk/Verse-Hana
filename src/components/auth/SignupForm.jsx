import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiEye,
  HiEyeSlash,
  HiUser,
  HiEnvelope,
  HiLockClosed,
} from "react-icons/hi2";

import AuthLayout from "./AuthLayout";

function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log("Signup data:", formData);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join VerseHana and discover music that matches your emotions."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            Full name
          </label>

          <div className="relative">
            <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3.5 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            Email address
          </label>

          <div className="relative">
            <HiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3.5 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            Password
          </label>

          <div className="relative">
            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3.5 pl-11 pr-12 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-violet-400"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <HiEyeSlash /> : <HiEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            Confirm password
          </label>

          <div className="relative">
            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3.5 pl-11 pr-12 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((prev) => !prev)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-violet-400"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <HiEyeSlash /> : <HiEye />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:scale-[1.01] hover:shadow-violet-500/30"
        >
          Create Account
        </button>

        {/* Login */}
        <p className="pt-2 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-violet-400 transition hover:text-violet-300"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignupForm;