import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiPlay,
  HiPause,
  HiTrash,
  HiMusicalNote,
} from "react-icons/hi2";

import { usePlayer } from "../context/PlayerContext";

const API_URL = "http://localhost:5000";

function PlaylistDetails() {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingSong, setRemovingSong] = useState(null);

  // =====================================================
  // FETCH PLAYLIST
  // =====================================================

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/playlists/${playlistId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch playlist."
          );
        }

        setPlaylist(data.playlist);
      } catch (error) {
        console.error("Fetch playlist error:", error);

        setError(
          "We couldn't load this playlist right now."
        );
      } finally {
        setLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  // =====================================================
  // CONVERT PLAYLIST SONG
  // =====================================================

  const convertSong = (song) => {
    return {
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
  };

  // =====================================================
  // PLAY SONG
  // =====================================================

  const handlePlaySong = (song) => {
    if (!playlist?.songs?.length) {
      return;
    }

    const convertedSong = convertSong(song);

    const queue = playlist.songs.map(convertSong);

    playSong(convertedSong, queue);
  };

  // =====================================================
  // PLAY ALL
  // =====================================================

  const handlePlayAll = () => {
    if (!playlist?.songs?.length) {
      return;
    }

    const queue = playlist.songs.map(convertSong);

    playSong(queue[0], queue);
  };

  // =====================================================
  // REMOVE SONG
  // =====================================================

  const handleRemoveSong = async (songId) => {
    try {
      setRemovingSong(songId);

      const response = await fetch(
        `${API_URL}/api/playlists/${playlistId}/songs/${songId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to remove song."
        );
      }

      setPlaylist(data.playlist);
    } catch (error) {
      console.error("Remove playlist song error:", error);

      alert(
        error.message || "Failed to remove song."
      );
    } finally {
      setRemovingSong(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

          <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--card)]" />

          <div className="mt-10 grid gap-8 md:grid-cols-[280px_1fr]">

            <div className="aspect-square animate-pulse rounded-3xl bg-[var(--card)]" />

            <div className="flex flex-col justify-end">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--card)]" />

              <div className="mt-4 h-12 w-2/3 animate-pulse rounded bg-[var(--card)]" />

              <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-[var(--card)]" />
            </div>

          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !playlist) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 text-[var(--text-primary)]">

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <HiMusicalNote className="text-4xl text-red-400" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Playlist unavailable
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {error || "This playlist could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/playlists")}
            className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            Back to Playlists
          </button>

        </div>

      </main>
    );
  }

  const songs = playlist.songs || [];

  const artwork = songs[0]?.artwork || "";

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[var(--border)]">

        <div className="mx-auto flex h-20 max-w-[1500px] items-center px-5 sm:px-8 lg:px-10">

          <Link
            to="/playlists"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
          >
            <HiArrowLeft className="text-xl" />
          </Link>

          <div className="ml-4">

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Your collection
            </p>

            <p className="text-sm font-semibold">
              Playlist
            </p>

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        {/* =====================================================
            PLAYLIST HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

          {/* Glow */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

          <div className="relative z-10 grid gap-8 md:grid-cols-[220px_1fr] md:items-end lg:grid-cols-[260px_1fr]">

            {/* ARTWORK */}

            <div className="aspect-square overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 shadow-2xl">

              {artwork ? (
                <img
                  src={artwork}
                  alt={playlist.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <HiMusicalNote className="text-7xl text-violet-400/70" />
                </div>
              )}

            </div>

            {/* INFO */}

            <div>

              <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
                Playlist
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                {playlist.name}
              </h1>

              {playlist.description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  {playlist.description}
                </p>
              )}

              <p className="mt-5 text-sm text-[var(--text-muted)]">
                {songs.length}{" "}
                {songs.length === 1 ? "song" : "songs"}
              </p>

              {/* PLAY ALL */}

              {songs.length > 0 && (
                <button
                  type="button"
                  onClick={handlePlayAll}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                >
                  {currentSong &&
                  playlist.songs.some(
                    (song) =>
                      String(song.songId) ===
                      String(currentSong.id)
                  ) &&
                  isPlaying ? (
                    <HiPause className="text-lg" />
                  ) : (
                    <HiPlay className="text-lg" />
                  )}

                  Play All
                </button>
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            SONGS
        ===================================================== */}

        <section className="mt-10">

          <div className="mb-5">

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Tracklist
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Songs
            </h2>

          </div>

          {/* EMPTY */}

          {songs.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                <HiMusicalNote className="text-3xl text-violet-400" />
              </div>

              <h3 className="mt-5 text-xl font-bold">
                This playlist is empty
              </h3>

              <p className="mt-2 max-w-md px-5 text-sm text-[var(--text-secondary)]">
                Add songs from your music discovery section
                to start building this playlist.
              </p>

              <Link
                to="/dashboard"
                className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Discover Music
              </Link>

            </div>
          )}

          {/* SONG LIST */}

          {songs.length > 0 && (
            <div className="space-y-2">

              {songs.map((song, index) => {

                const isCurrent =
                  String(currentSong?.id) ===
                  String(song.songId);

                const isSongPlaying =
                  isCurrent && isPlaying;

                return (
                  <div
                    key={`${song.songId}-${index}`}
                    className={`group flex items-center gap-4 rounded-2xl border p-3 transition ${
                      isCurrent
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-[var(--border)] bg-[var(--surface)]/60 hover:border-violet-500/20 hover:bg-violet-500/5"
                    }`}
                  >

                    {/* NUMBER */}

                    <div className="hidden w-7 text-center text-sm text-[var(--text-muted)] sm:block">
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
                        <div className="flex h-full w-full items-center justify-center">
                          <HiMusicalNote className="text-xl text-violet-400" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handlePlaySong(song)
                        }
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                      >
                        {isSongPlaying ? (
                          <HiPause className="text-xl text-white" />
                        ) : (
                          <HiPlay className="text-xl text-white" />
                        )}
                      </button>

                    </div>

                    {/* SONG INFO */}

                    <button
                      type="button"
                      onClick={() =>
                        handlePlaySong(song)
                      }
                      className="min-w-0 flex-1 text-left"
                    >

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

                    </button>

                    {/* PLAYING */}

                    {isSongPlaying && (
                      <span className="hidden rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400 sm:block">
                        Playing
                      </span>
                    )}

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveSong(song.songId)
                      }
                      disabled={
                        removingSong === song.songId
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-wait disabled:opacity-50"
                      title="Remove from playlist"
                    >
                      <HiTrash className="text-lg" />
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </section>

    </main>
  );
}

export default PlaylistDetails;