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
  HiSparkles,
  HiChevronRight,
  HiBars3,
  HiXMark,
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

  // Mobile navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        const [
          likesResponse,
          playlistsResponse,
          historyResponse,
        ] = await Promise.all([
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
        const playlistsData =
          await playlistsResponse.json();
        const historyData =
          await historyResponse.json();

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

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">

        {/* =====================================================
            DESKTOP SIDEBAR
        ===================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 lg:flex lg:flex-col">

          {/* LOGO */}

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

          {/* NAVIGATION */}

          <nav className="flex-1 space-y-2 p-4">

            <SidebarLink
              to="/dashboard"
              icon={<HiHome />}
              label="Home"
            />

            <SidebarLink
              to="/discover"
              icon={<HiMagnifyingGlass />}
              label="Discover"
            />

            <SidebarLink
              to="/genres"
              icon={<HiMusicalNote />}
              label="Genres"
            />

            <SidebarLink
              to="/liked-songs"
              icon={<HiHeart />}
              label="Liked Songs"
            />

            <SidebarLink
              to="/playlists"
              icon={<HiQueueList />}
              label="Playlists"
            />

            <SidebarLink
              to="/recently-played"
              icon={<HiClock />}
              label="Recently Played"
            />

          </nav>

          {/* USER */}

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
            MOBILE MENU OVERLAY
        ===================================================== */}

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* =====================================================
            MOBILE SIDEBAR
        ===================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-[100] flex w-[280px] max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 lg:hidden ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >

          {/* MOBILE SIDEBAR HEADER */}

          <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] px-5">

            <div className="flex items-center gap-3">

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

            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-white"
              aria-label="Close menu"
            >
              <HiXMark className="text-2xl" />
            </button>

          </div>

          {/* MOBILE NAVIGATION */}

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">

            <MobileSidebarLink
              to="/dashboard"
              icon={<HiHome />}
              label="Home"
              onClick={closeMobileMenu}
            />

            <MobileSidebarLink
              to="/discover"
              icon={<HiMagnifyingGlass />}
              label="Discover"
              onClick={closeMobileMenu}
            />

            <MobileSidebarLink
              to="/genres"
              icon={<HiMusicalNote />}
              label="Genres"
              onClick={closeMobileMenu}
            />

            <MobileSidebarLink
              to="/liked-songs"
              icon={<HiHeart />}
              label="Liked Songs"
              onClick={closeMobileMenu}
            />

            <MobileSidebarLink
              to="/playlists"
              icon={<HiQueueList />}
              label="Playlists"
              onClick={closeMobileMenu}
            />

            <MobileSidebarLink
              to="/recently-played"
              icon={<HiClock />}
              label="Recently Played"
              onClick={closeMobileMenu}
            />

          </nav>

          {/* MOBILE USER */}

          <div className="shrink-0 border-t border-[var(--border)] p-4">

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="mb-3 flex items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
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

            </Link>

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

          {/* =====================================================
              TOP BAR
          ===================================================== */}

          <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 backdrop-blur-xl sm:h-20 sm:px-6 lg:px-10">

            {/* MOBILE */}

            <div className="flex min-w-0 items-center gap-3 lg:hidden">

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/30 hover:text-violet-400"
                aria-label="Open menu"
              >
                <HiBars3 className="text-xl" />
              </button>

              <div className="min-w-0">

                <p className="hidden text-xs text-[var(--text-muted)] sm:block">
                  Your account
                </p>

                <h1 className="truncate text-base font-bold sm:text-xl">
                  Profile
                </h1>

              </div>

            </div>

            {/* DESKTOP */}

            <div className="hidden lg:block">

              <p className="text-sm text-[var(--text-secondary)]">
                Your account
              </p>

              <h1 className="text-xl font-bold">
                Profile
              </h1>

            </div>

            {/* PROFILE */}

            <Link
              to="/profile"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-500/10 transition hover:scale-105 sm:h-10 sm:w-10"
              aria-label="Profile"
            >
              {userInitial}
            </Link>

          </header>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="mx-auto w-full max-w-[1500px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-5 shadow-2xl shadow-violet-950/10 sm:rounded-[28px] sm:p-8 lg:rounded-[32px] lg:p-10">

              {/* GLOW */}

              <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px] sm:h-96 sm:w-96 sm:blur-[120px]" />

              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px] sm:h-80 sm:w-80 sm:blur-[120px]" />

              <div className="relative z-10 flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center">

                {/* AVATAR */}

                <div className="relative mx-auto shrink-0 md:mx-0">

                  <div className="flex h-24 w-24 items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-extrabold text-white shadow-2xl shadow-violet-500/30 sm:h-32 sm:w-32 sm:rounded-[30px] sm:text-4xl lg:h-36 lg:w-36 lg:text-5xl">
                    {userInitial}
                  </div>

                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[var(--surface)] bg-violet-600 text-white sm:h-9 sm:w-9">
                    <HiMusicalNote className="text-xs sm:text-sm" />
                  </div>

                </div>

                {/* USER INFO */}

                <div className="min-w-0 flex-1 text-center md:text-left">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400 sm:text-xs sm:tracking-[0.22em]">
                    VerseHana member
                  </p>

                  <h2 className="mt-2 break-words text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    {user?.name || "Music Lover"}
                  </h2>

                  <p className="mt-2 truncate text-sm text-[var(--text-secondary)] sm:text-base">
                    {user?.email}
                  </p>

                  <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--text-secondary)] md:mx-0">
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

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                  Your music
                </p>

                <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                  Your activity
                </h2>

              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {/* LIKED */}

                <Link
                  to="/liked-songs"
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5 sm:p-5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 sm:h-11 sm:w-11">
                      <HiHeart className="text-lg sm:text-xl" />
                    </div>

                    <HiChevronRight className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-violet-400" />

                  </div>

                  <p className="mt-4 text-2xl font-extrabold sm:mt-5 sm:text-3xl">
                    {loadingStats ? "—" : likedCount}
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Liked Songs
                  </p>

                </Link>

                {/* PLAYLISTS */}

                <Link
                  to="/playlists"
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5 sm:p-5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400 sm:h-11 sm:w-11">
                      <HiQueueList className="text-lg sm:text-xl" />
                    </div>

                    <HiChevronRight className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-fuchsia-400" />

                  </div>

                  <p className="mt-4 text-2xl font-extrabold sm:mt-5 sm:text-3xl">
                    {loadingStats ? "—" : playlistCount}
                  </p>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Playlists
                  </p>

                </Link>

                {/* RECENTLY PLAYED */}

                <Link
                  to="/recently-played"
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5 sm:p-5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 sm:h-11 sm:w-11">
                      <HiClock className="text-lg sm:text-xl" />
                    </div>

                    <HiChevronRight className="text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-sky-400" />

                  </div>

                  <p className="mt-4 text-2xl font-extrabold sm:mt-5 sm:text-3xl">
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

            <section className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)]/60 p-5 sm:rounded-[28px] sm:p-6">

              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-[80px]" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl sm:h-14 sm:w-14 sm:rounded-2xl sm:text-2xl">
                    {currentMood.emoji}
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400 sm:text-xs sm:tracking-[0.18em]">
                      Your current vibe
                    </p>

                    <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
                      Feeling {currentMood.name}
                    </h2>

                    <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                      {currentMood.description}
                    </p>

                  </div>

                </div>

                <Link
                  to="/mood"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/20 sm:w-auto"
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

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                  Explore
                </p>

                <h2 className="mt-2 text-xl font-bold sm:text-2xl">
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

            <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)]/60 p-5 sm:rounded-[28px] sm:p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                    Account
                  </p>

                  <h2 className="mt-2 text-lg font-bold sm:text-xl">
                    Sign out of VerseHana
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                    You'll need to sign in again to access
                    your personal music space.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 sm:w-auto"
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
   DESKTOP SIDEBAR LINK
===================================================== */

function SidebarLink({
  to,
  icon,
  label,
}) {
  return (
    <Link
      to={to}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
    >
      <span className="text-lg">
        {icon}
      </span>

      {label}
    </Link>
  );
}

/* =====================================================
   MOBILE SIDEBAR LINK
===================================================== */

function MobileSidebarLink({
  to,
  icon,
  label,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
    >
      <span className="text-lg">
        {icon}
      </span>

      {label}
    </Link>
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
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 transition hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-violet-500/5 sm:gap-4"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-lg text-violet-400 transition group-hover:scale-105 sm:h-11 sm:w-11 sm:text-xl">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <h3 className="truncate text-sm font-semibold">
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