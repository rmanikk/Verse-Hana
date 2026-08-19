import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowLeft,
  HiClock,
  HiMusicalNote,
  HiPlay,
  HiPause,
  HiTrash,
} from "react-icons/hi2";

import { usePlayer } from "../context/PlayerContext";

const API_URL = "http://localhost:5000";

function RecentlyPlayed() {
  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH RECENTLY PLAYED
  // =====================================================

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/history`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch recently played songs."
          );
        }

        setRecentlyPlayed(data.history || []);
      } catch (err) {
        console.error("Recently played error:", err);

        setError(
          "We couldn't load your recently played songs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // =====================================================
  // PLAY SONG
  // =====================================================

  const handlePlay = (song) => {
    const convertedSong = {
      id: song.songId,
      title: song.title,

      artwork: song.artwork
        ? {
            "480x480": song.artwork,
          }
        : null,

      user: {
        name: song.artist || "Unknown artist",
      },
    };

    const queue = recentlyPlayed.map((item) => ({
      id: item.songId,
      title: item.title,

      artwork: item.artwork
        ? {
            "480x480": item.artwork,
          }
        : null,

      user: {
        name: item.artist || "Unknown artist",
      },
    }));

    playSong(convertedSong, queue);
  };

  // =====================================================
  // CLEAR HISTORY
  // =====================================================

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your recently played history?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/history`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to clear recently played history."
        );
      }

      setRecentlyPlayed([]);
    } catch (err) {
      console.error("Clear history error:", err);

      alert("Failed to clear your history.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

        <header className="border-b border-[var(--border)]">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">

            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
            >
              <HiArrowLeft className="text-xl" />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                Your history
              </p>

              <h1 className="text-2xl font-bold">
                Recently Played
              </h1>
            </div>

          </div>
        </header>

        <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

          <div className="space-y-3">

            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3"
              >
                <div className="h-14 w-14 rounded-xl bg-[var(--card)]" />

                <div className="flex-1">
                  <div className="h-4 w-1/3 rounded bg-[var(--card)]" />

                  <div className="mt-2 h-3 w-1/5 rounded bg-[var(--card)]" />
                </div>
              </div>
            ))}

          </div>

        </section>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

        <header className="border-b border-[var(--border)]">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">

            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
            >
              <HiArrowLeft className="text-xl" />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                Your history
              </p>

              <h1 className="text-2xl font-bold">
                Recently Played
              </h1>
            </div>

          </div>
        </header>

        <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

            <HiClock className="mx-auto text-4xl text-red-400" />

            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>

          </div>

        </section>

      </main>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================

  if (recentlyPlayed.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

        <header className="border-b border-[var(--border)]">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">

            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
            >
              <HiArrowLeft className="text-xl" />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                Your history
              </p>

              <h1 className="text-2xl font-bold">
                Recently Played
              </h1>
            </div>

          </div>
        </header>

        <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

          <div className="flex min-h-[500px] flex-col items-center justify-center text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10">
              <HiClock className="text-4xl text-violet-400" />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Nothing played yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Songs you listen to will appear here so you
              can quickly find and replay your recent music.
            </p>

            <Link
              to="/dashboard"
              className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
            >
              Start listening
            </Link>

          </div>

        </section>

      </main>
    );
  }

  // =====================================================
  // HISTORY
  // =====================================================

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* HEADER */}

      <header className="border-b border-[var(--border)]">

        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">

          <div className="flex items-center gap-4">

            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
            >
              <HiArrowLeft className="text-xl" />
            </Link>

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                Your history
              </p>

              <h1 className="text-2xl font-bold">
                Recently Played
              </h1>

            </div>

          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-400"
          >
            <HiTrash className="text-lg" />

            <span className="hidden sm:inline">
              Clear history
            </span>
          </button>

        </div>

      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        <div className="mb-5">

          <p className="text-sm text-[var(--text-muted)]">
            Your last {recentlyPlayed.length} played songs
          </p>

        </div>

        <div className="space-y-3">

          {recentlyPlayed.map((song, index) => {

            const isCurrent =
              String(currentSong?.id) ===
              String(song.songId);

            return (
              <div
                key={song._id || `${song.songId}-${index}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 transition hover:border-violet-500/30 hover:bg-violet-500/5"
              >

                {/* NUMBER */}

                <div className="hidden w-6 text-center text-sm text-[var(--text-muted)] sm:block">
                  {index + 1}
                </div>

                {/* ARTWORK */}

                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">

                  {song.artwork ? (
                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-violet-400">
                      <HiMusicalNote className="text-xl" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePlay(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                    aria-label={
                      isCurrent && isPlaying
                        ? "Pause"
                        : "Play"
                    }
                  >

                    {isCurrent && isPlaying ? (
                      <HiPause className="text-xl text-white" />
                    ) : (
                      <HiPlay className="ml-0.5 text-xl text-white" />
                    )}

                  </button>

                </div>

                {/* SONG INFO */}

                <div className="min-w-0 flex-1">

                  <h3
                    className={`truncate text-sm font-semibold ${
                      isCurrent
                        ? "text-violet-400"
                        : ""
                    }`}
                  >
                    {song.title}
                  </h3>

                  <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                    {song.artist || "Unknown artist"}
                  </p>

                </div>

                {/* PLAYING */}

                {isCurrent && isPlaying && (
                  <div className="hidden items-center gap-2 sm:flex">

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

                    <span className="text-xs text-violet-400">
                      Playing
                    </span>

                  </div>
                )}

                {/* PLAY TIME */}

                <div className="hidden text-xs text-[var(--text-muted)] md:block">
                  {new Date(song.playedAt).toLocaleString()}
                </div>

              </div>
            );
          })}

        </div>

      </section>

    </main>
  );
}

export default RecentlyPlayed;