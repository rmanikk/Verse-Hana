import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-2xl">
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name} 🎵
          </h1>

          <p className="mt-3 text-[var(--text-secondary)]">
            {user?.email}
          </p>

          <p className="mt-6 text-sm text-green-400">
            🔐 This is a protected page.
          </p>

          <button
            onClick={logout}
            className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

export default Profile;