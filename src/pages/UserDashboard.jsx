import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiHome,
  HiMagnifyingGlass,
  HiHeart,
  HiQueueList,
  HiClock,
  HiMusicalNote,
  HiArrowRightOnRectangle,
  HiPlay,
  HiPause,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

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

function UserDashboard() {
  const { user, logout } = useAuth();

  const [tracks, setTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [trackError, setTrackError] = useState("");

  const currentMood = useMemo(() => {
    const savedMood = localStorage.getItem("versehana_mood");

    return moods[savedMood] || moods.calm;
  }, []);

  // =====================================================
  // FETCH MUSIC FOR CURRENT MOOD
  // =====================================================

  useEffect(() => {
    const fetchMoodTracks = async () => {
      try {
        setLoadingTracks(true);
        setTrackError("");

        const savedMood =
          localStorage.getItem("versehana_mood") || "calm";

        const response = await fetch(
          `http://localhost:5000/api/music/mood/${savedMood}?limit=10`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch music."
          );
        }

        setTracks(data.tracks || []);
      } catch (error) {
        console.error("Mood music error:", error);

        setTrackError(
          "We couldn't load your music right now."
        );
      } finally {
        setLoadingTracks(false);
      }
    };

    fetchMoodTracks();
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

            <DashboardLink
              icon={<HiHome />}
              label="Home"
              active
            />

            <DashboardLink
              icon={<HiMagnifyingGlass />}
              label="Discover"
            />

            <DashboardLink
              icon={<HiMusicalNote />}
              label="Moods"
            />

            <DashboardLink
              icon={<HiHeart />}
              label="Liked Songs"
            />

            <DashboardLink
              icon={<HiQueueList />}
              label="Playlists"
            />

            <DashboardLink
              icon={<HiClock />}
              label="Recently Played"
            />

          </nav>

          {/* User */}

          <div className="border-t border-[var(--border)] p-4">

            <Link
              to="/profile"
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
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
                Welcome back,
              </p>

              <h1 className="text-lg font-bold sm:text-xl">
                {user?.name || "Music lover"} 👋
              </h1>
            </div>

            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Link>

          </header>

          {/* Dashboard */}

          <div className="mx-auto max-w-[1500px] space-y-10 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* =====================================================
                MOOD HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/15 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

              <div className="relative z-10">

                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400">
                    Your vibe
                  </span>

                  <span className="text-2xl">
                    {currentMood.emoji}
                  </span>

                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">

                  Music for your{" "}

                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {currentMood.name.toLowerCase()}
                  </span>{" "}
                  mood.

                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  {currentMood.description}. We've prepared a space where
                  every song is meant to match how you feel right now.
                </p>

                <Link
                  to="/mood"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                >
                  Change my mood
                  <HiArrowRightOnRectangle className="rotate-180" />
                </Link>

              </div>

            </section>

            {/* =====================================================
                RECOMMENDED
            ===================================================== */}

            <section>

              <div className="mb-5 flex items-end justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                    Curated for you
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Made for your mood
                  </h2>
                </div>

                <span className="hidden text-sm text-[var(--text-muted)] sm:block">
                  {tracks.length} songs
                </span>

              </div>

              {/* Loading */}

              {loadingTracks && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse"
                    >
                      <div className="aspect-square rounded-2xl bg-[var(--card)]" />

                      <div className="mt-3 h-4 w-3/4 rounded bg-[var(--card)]" />

                      <div className="mt-2 h-3 w-1/2 rounded bg-[var(--card)]" />
                    </div>
                  ))}

                </div>
              )}

              {/* Error */}

              {!loadingTracks && trackError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">

                  <p className="text-sm text-red-400">
                    {trackError}
                  </p>

                </div>
              )}

              {/* Tracks */}

              {!loadingTracks &&
                !trackError &&
                tracks.length > 0 && (

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

                    {tracks.map((track) => (
                      <SongCard
                        key={track.id}
                        track={track}
                        tracks={tracks}
                      />
                    ))}

                  </div>
                )}

              {/* No tracks */}

              {!loadingTracks &&
                !trackError &&
                tracks.length === 0 && (

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 text-center">

                    <HiMusicalNote className="mx-auto text-3xl text-[var(--text-muted)]" />

                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      We couldn't find songs for this mood yet.
                    </p>

                  </div>
                )}

            </section>

            {/* =====================================================
                RECENTLY PLAYED
            ===================================================== */}

            <section>

              <div className="mb-5">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Your history
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Recently played
                </h2>

              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 text-center">

                <HiClock className="mx-auto text-3xl text-[var(--text-muted)]" />

                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Your recently played songs will appear here.
                </p>

              </div>

            </section>

          </div>

        </section>

      </div>
    </main>
  );
}

/* =====================================================
   DASHBOARD LINK
===================================================== */

function DashboardLink({ icon, label, active = false }) {
  return (
    <button
      className={`
        flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
        ${
          active
            ? "bg-violet-500/10 text-violet-400"
            : "text-[var(--text-secondary)] hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
        }
      `}
    >
      <span className="text-lg">
        {icon}
      </span>

      {label}
    </button>
  );
}

/* =====================================================
   SONG CARD
===================================================== */

function SongCard({ track, tracks }) {
  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const isCurrentSong =
    currentSong?.id === track.id;

  const artwork =
    track.artwork?.["480x480"] ||
    track.artwork?.["150x150"] ||
    track.artwork?.["1000x1000"];

  const handlePlay = () => {
    // IMPORTANT:
    // Pass the complete tracks array so the
    // PlayerContext knows the Next/Previous queue.
    playSong(track, tracks);
  };

  return (
    <div className="group cursor-pointer">

      {/* Artwork */}

      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

        {artwork ? (
          <img
            src={artwork}
            alt={track.title}
            className={`
              h-full w-full object-cover transition duration-500
              ${isCurrentSong ? "scale-105" : "group-hover:scale-105"}
            `}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <HiMusicalNote className="text-5xl text-violet-400" />
          </div>
        )}

        {/* Overlay */}

        <div
          className={`
            absolute inset-0
            bg-black/30
            transition
            ${isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
        />

        {/* Play Button */}

        <button
          type="button"
          onClick={handlePlay}
          className={`
            absolute bottom-3 right-3
            flex h-11 w-11
            items-center justify-center
            rounded-full
            bg-violet-600
            text-white
            shadow-lg
            shadow-violet-500/30
            transition-all duration-300
            hover:scale-105
            ${
              isCurrentSong
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            }
          `}
          aria-label={
            isCurrentSong && isPlaying
              ? "Pause"
              : "Play"
          }
        >
          {isCurrentSong && isPlaying ? (
            <HiPause className="text-lg" />
          ) : (
            <HiPlay className="ml-0.5 text-lg" />
          )}
        </button>

        {/* Playing indicator */}

        {isCurrentSong && isPlaying && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

            <span className="text-[10px] font-medium text-white">
              Playing
            </span>
          </div>
        )}

      </div>

      {/* Track information */}

      <h3
        className="mt-3 truncate text-sm font-semibold"
        title={track.title}
      >
        {track.title}
      </h3>

      <p
        className="mt-1 truncate text-xs text-[var(--text-muted)]"
        title={track.user?.name}
      >
        {track.user?.name || "Unknown artist"}
      </p>

    </div>
  );
}

export default UserDashboard;