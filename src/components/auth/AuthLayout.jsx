import { Link } from "react-router-dom";
import { HiMusicalNote } from "react-icons/hi2";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[-150px] h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[150px]" />

        <div className="absolute bottom-[-150px] right-[-150px] h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[130px]" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
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

          {/* Auth Card */}
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)]/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            
            {/* Heading */}
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {subtitle}
              </p>
            </div>

            {/* Form */}
            <div className="mt-8">
              {children}
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-[var(--text-muted)] transition hover:text-violet-400"
            >
              ← Back to VerseHana
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;