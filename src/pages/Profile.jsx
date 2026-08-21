import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiHome,
  HiMagnifyingGlass,
  HiHeart,
  HiQueueList,
  HiClock,
  HiMusicalNote,
  HiArrowRightOnRectangle,
  HiUser,
  HiSparkles,
  HiChevronRight,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

const moods = {
  happy: {
    name: "Happy",
    emoji: "😊",
    description: "Bright & uplifting",
  },
  calm: {
    name: "Calm",
    emoji: "😌",
    description: "Peaceful & relaxed",
  },
  rain: {
    name: "Rain",
    emoji: "🌧️",
    description: "Cozy & reflective",
  },
  night: {
    name: "Night",
    emoji: "🌙",
    description: "Late-night vibes",
  },
  love: {
    name: "Love",
    emoji: "❤️",
    description: "Warm & emotional",
  },
  focus: {
    name: "Focus",
    emoji: "💪",
    description: "Locked in",
  },
  party: {
    name: "Party",
    emoji: "🎉",
    description: "Let's have fun",
  },
  sad: {
    name: "Sad",
    emoji: "😢",
    description: "Feel it all",
  },
};

function Profile() {
  const { user, logout } = useAuth();

  const [likedCount, setLikedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);

  const savedMood =
    localStorage.getItem("versehana_mood") || "calm";

  const currentMood = moods[savedMood] || moods.calm;

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  // =====================================================
  // FETCH PROFILE STATS
  // =====================================================

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const [likesResponse, playlistsResponse, historyResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/likes`, {
              credentials: "include",
            }),

            fetch(`${API_URL}/api/playlists`, {
              credentials: "include",
            }),

            fetch(`${API_URL}/api/history`, {
              credentials: "include",
            }),
          ]);

        const likesData = await likesResponse.json();
        const playlistsData = await playlistsResponse.json();
        const historyData = await historyResponse.json();

        setLikedCount(
          (likesData.likes || []).length
        );

        setPlaylistCount(
          (playlistsData.playlists || []).length
        );

        setHistoryCount(
          (
            historyData.history ||
            historyData.histories ||
            historyData.recentSongs ||
            []
          ).length
        );
      } catch (error) {
        console.error(
          "Profile statistics error:",
          error
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 lg:flex lg:flex-col">

          {/* Logo */}

          <div className="flex h-20 items-center gap-3 border-b border-[var(--border)] px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <HiMusicalNote className="text-xl" />
            </div>

            <span className="text-xl font-extrabold tracking-tight">
              Verse
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Hana
              </span>
            </span>
          </div>

          {/* Navigation */}

          <nav className="flex-1 space-y-2 p-4">

            <Link
              to="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiHome className="text-lg" />
              Home
            </Link>

            <Link
              to="/discover"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiMagnifyingGlass className="text-lg" />
              Discover
            </Link>

            <Link
              to="/genres"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiMusicalNote className="text-lg" />
              Genres
            </Link>

            <Link
              to="/liked-songs"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiHeart className="text-lg" />
              Liked Songs
            </Link>

            <Link
              to="/playlists"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiQueueList className="text-lg" />
              Playlists
            </Link>

            <Link
              to="/recently-played"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiClock className="text-lg" />
              Recently Played
            </Link>

          </nav>

          {/* User */}

          <div className="border-t border-[var(--border)] p-4">

            <div className="mb-3 flex items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {userInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-[var(--text-muted)]">
                  {user?.email}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-400"
            >
              <HiArrowRightOnRectangle className="text-lg" />
              Logout
            </button>

          </div>

        </aside>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* Top Bar */}

          <header className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">

            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Your account
              </p>

              <h1 className="text-lg font-bold sm:text-xl">
                Profile
              </h1>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
              {userInitial}
            </div>

          </header>

          {/* Content */}

          <div className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 shadow-2xl shadow-violet-950/10 sm:p-8 lg:p-10">

              {/* Glow */}

              <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />

              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[120px]" />

              <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">

                {/* Avatar */}

                <div className="relative shrink-0">

                  <div className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-4xl font-extrabold text-white shadow-2xl shadow-violet-500/30 sm:h-36 sm:w-36 sm:text-5xl">
                    {userInitial}
                  </div>

                  <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[var(--surface)] bg-violet-600 text-white">
                    <HiMusicalNote className="text-sm" />
                  </div>

                </div>

                {/* User Info */}

                <div className="min-w-0 flex-1">

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                    VerseHana member
                  </p>

                  <h2 className="mt-2 truncate text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    {user?.name || "Music Lover"}
                  </h2>

                  <p className="mt-2 truncate text-sm text-[var(--text-secondary)] sm:text-base">
                    {user?.email}
                  </p>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                    Your personal space for the music you love,
                    the moods you feel, and the songs you keep
                    coming back to.
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                MUSIC STATS
            ================================================= */}

            <section>

              <div className="mb-5">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Your music
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Your activity
                </h2>

              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                {/* Liked */}

                <Link
                  to="/liked-songs"
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                      <HiHeart className="text-xl" />
                    </div>

                    <HiChevronRight className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-violet-400" />

                  </div>

                  <p className="mt-5 text-3xl font-extrabold">
                    {loadingStats ? "—" : likedCount}
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Liked Songs
                  </p>

                </Link>

                {/* Playlists */}

                <Link
                  to="/playlists"
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
                      <HiQueueList className="text-xl" />
                    </div>

                    <HiChevronRight className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-fuchsia-400" />

                  </div>

                  <p className="mt-5 text-3xl font-extrabold">
                    {loadingStats ? "—" : playlistCount}
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Playlists
                  </p>

                </Link>

                {/* Recently Played */}

                <Link
                  to="/recently-played"
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                      <HiClock className="text-xl" />
                    </div>

                    <HiChevronRight className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-sky-400" />

                  </div>

                  <p className="mt-5 text-3xl font-extrabold">
                    {loadingStats ? "—" : historyCount}
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Recently Played
                  </p>

                </Link>

              </div>

            </section>

            {/* =================================================
                CURRENT MOOD
            ================================================= */}

            <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/60 p-6">

              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-[80px]" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                    {currentMood.emoji}
                  </div>

                  <div>

                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-400">
                      Your current vibe
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Feeling {currentMood.name}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {currentMood.description}
                    </p>

                  </div>

                </div>

                <Link
                  to="/mood"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/20"
                >
                  <HiSparkles />
                  Change Mood
                </Link>

              </div>

            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section>

              <div className="mb-5">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Explore
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Quick access
                </h2>

              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <ProfileAction
                  to="/discover"
                  icon={<HiMagnifyingGlass />}
                  title="Discover Music"
                  description="Find something new to listen to"
                />

                <ProfileAction
                  to="/liked-songs"
                  icon={<HiHeart />}
                  title="Your Liked Songs"
                  description="All the songs you've saved"
                />

                <ProfileAction
                  to="/playlists"
                  icon={<HiQueueList />}
                  title="Your Playlists"
                  description="Organize your favorite music"
                />

              </div>

            </section>

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/60 p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                    Account
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    Sign out of VerseHana
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    You'll need to sign in again to access
                    your personal music space.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  <HiArrowRightOnRectangle className="text-lg" />
                  Logout
                </button>

              </div>

            </section>

          </div>

        </section>

      </div>
    </main>
  );
}

/* =====================================================
   PROFILE ACTION
===================================================== */

function ProfileAction({
  to,
  icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 transition hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-violet-500/5"
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-400 transition group-hover:scale-105">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
          {description}
        </p>

      </div>

      <HiChevronRight className="shrink-0 text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-violet-400" />

    </Link>
  );
}

export default Profile;