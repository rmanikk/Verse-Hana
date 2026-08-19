import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowLeft,
  HiHeart,
  HiMusicalNote,
  HiPlay,
  HiPause,
} from "react-icons/hi2";

import { usePlayer } from "../context/PlayerContext";

function LikedSongs() {
  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH LIKED SONGS
  // =====================================================

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/likes",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch liked songs."
          );
        }

        setLikedSongs(data.likes || []);
      } catch (err) {
        console.error("Liked songs error:", err);
        setError("We couldn't load your liked songs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, []);

  // =====================================================
  // UNLIKE SONG
  // =====================================================

  const handleUnlike = async (songId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/likes/${songId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to unlike song."
        );
      }

      setLikedSongs((songs) =>
        songs.filter(
          (song) =>
            String(song.songId) !== String(songId)
        )
      );
    } catch (err) {
      console.error("Unlike error:", err);
    }
  };

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

    const queue = likedSongs.map((item) => ({
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
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* HEADER */}

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
              Your collection
            </p>

            <h1 className="text-2xl font-bold">
              Liked Songs
            </h1>
          </div>

        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        {/* LOADING */}

        {loading && (
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

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          likedSongs.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10">
                <HiHeart className="text-4xl text-violet-400" />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                No liked songs yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                Songs you like will appear here. Start
                exploring and build your personal collection.
              </p>

              <Link
                to="/dashboard"
                className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
              >
                Discover music
              </Link>

            </div>
          )}

        {/* LIKED SONGS */}

        {!loading &&
          !error &&
          likedSongs.length > 0 && (
            <div className="space-y-3">

              {likedSongs.map((song, index) => {

                const isCurrent =
                  String(currentSong?.id) ===
                  String(song.songId);

                return (
                  <div
                    key={song._id || song.songId}
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
                        onClick={() =>
                          handlePlay(song)
                        }
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
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

                    {/* LIKE BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        handleUnlike(song.songId)
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-violet-400 transition hover:bg-red-500/10 hover:text-red-400"
                      title="Unlike"
                    >
                      <HiHeart className="text-xl" />
                    </button>

                  </div>
                );
              })}

            </div>
          )}

      </section>
    </main>
  );
}

export default LikedSongs;