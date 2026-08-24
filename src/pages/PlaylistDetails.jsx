import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { Link, useNavigate, useParams } from "react-router-dom";

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
  HiTrash,
  HiArrowLeft,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";



function PlaylistDetails() {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [playlist, setPlaylist] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LIKED SONGS
  // =====================================================

  const [likedSongs, setLikedSongs] = useState(new Set());
  const [likingSong, setLikingSong] = useState(null);

  // =====================================================
  // REMOVING SONG
  // =====================================================

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
  // FETCH LIKED SONGS
  // =====================================================

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/likes`,
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

        const ids = new Set(
          (data.likes || []).map((song) =>
            String(song.songId)
          )
        );

        setLikedSongs(ids);
      } catch (error) {
        console.error(
          "Fetch liked songs error:",
          error
        );
      }
    };

    fetchLikedSongs();
  }, []);

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleLike = async (songId) => {
    if (!songId || likingSong === songId) {
      return;
    }

    try {
      setLikingSong(songId);

      const isLiked = likedSongs.has(String(songId));

      const response = await fetch(
        `${API_URL}/api/likes/${songId}`,
        {
          method: isLiked ? "DELETE" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              isLiked ? "unlike" : "like"
            } song.`
        );
      }

      setLikedSongs((previous) => {
        const updated = new Set(previous);

        if (isLiked) {
          updated.delete(String(songId));
        } else {
          updated.add(String(songId));
        }

        return updated;
      });
    } catch (error) {
      console.error("Like song error:", error);

      alert(
        error.message ||
          "Something went wrong while updating your liked songs."
      );
    } finally {
      setLikingSong(null);
    }
  };

  // =====================================================
  // CONVERT SONG FOR PLAYER
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
    if (removingSong === songId) {
      return;
    }

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
      console.error(
        "Remove playlist song error:",
        error
      );

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
        <div className="flex min-h-screen">

          {/* SIDEBAR */}

          <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 lg:flex lg:flex-col">

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
                className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400"
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

            <div className="border-t border-[var(--border)] p-4">

              <Link
                to="/profile"
                className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    "U"}
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

          {/* LOADING CONTENT */}

          <section className="min-w-0 flex-1">

            <header className="flex h-20 items-center border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">
              <div className="h-5 w-32 animate-pulse rounded bg-[var(--card)]" />
            </header>

            <div className="mx-auto max-w-[1500px] space-y-10 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

              <div className="h-10 w-24 animate-pulse rounded-xl bg-[var(--card)]" />

              <div className="grid gap-8 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 md:grid-cols-[260px_1fr] lg:p-10">

                <div className="aspect-square animate-pulse rounded-[28px] bg-[var(--card)]" />

                <div className="flex flex-col justify-end">

                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--card)]" />

                  <div className="mt-4 h-12 w-2/3 animate-pulse rounded bg-[var(--card)]" />

                  <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-[var(--card)]" />

                  <div className="mt-7 h-12 w-32 animate-pulse rounded-xl bg-[var(--card)]" />

                </div>

              </div>

            </div>

          </section>

        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !playlist) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

        <div className="flex min-h-screen">

          {/* SIDEBAR */}

          <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 lg:flex lg:flex-col">

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

            <nav className="flex-1 space-y-2 p-4">

              <Link
                to="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] hover:bg-violet-500/10"
              >
                <HiHome className="text-lg" />
                Home
              </Link>

              <Link
                to="/discover"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] hover:bg-violet-500/10"
              >
                <HiMagnifyingGlass className="text-lg" />
                Discover
              </Link>

              <Link
                to="/genres"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] hover:bg-violet-500/10"
              >
                <HiMusicalNote className="text-lg" />
                Genres
              </Link>

              <Link
                to="/liked-songs"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] hover:bg-violet-500/10"
              >
                <HiHeart className="text-lg" />
                Liked Songs
              </Link>

              <Link
                to="/playlists"
                className="flex items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm text-violet-400"
              >
                <HiQueueList className="text-lg" />
                Playlists
              </Link>

              <Link
                to="/recently-played"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] hover:bg-violet-500/10"
              >
                <HiClock className="text-lg" />
                Recently Played
              </Link>

            </nav>

            <div className="border-t border-[var(--border)] p-4">

              <Link
                to="/profile"
                className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-violet-500/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    "U"}
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
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400"
              >
                <HiArrowRightOnRectangle className="text-lg" />
                Logout
              </button>

            </div>

          </aside>

          <section className="flex min-w-0 flex-1 items-center justify-center">

            <div className="px-5 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
                <HiMusicalNote className="text-4xl text-red-400" />
              </div>

              <h1 className="mt-6 text-2xl font-bold">
                Playlist unavailable
              </h1>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {error ||
                  "This playlist could not be found."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/playlists")}
                className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
              >
                Back to Playlists
              </button>

            </div>

          </section>

        </div>
      </main>
    );
  }

  // =====================================================
  // PLAYLIST DATA
  // =====================================================

  const songs = playlist.songs || [];

  const artwork = songs[0]?.artwork || "";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
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

            {/* ACTIVE */}

            <Link
              to="/playlists"
              className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400"
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

          {/* USER */}

          <div className="border-t border-[var(--border)] p-4">

            <Link
              to="/profile"
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  "U"}
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

          <header className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">

            <div className="flex items-center gap-4">

              <Link
                to="/playlists"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
                title="Back to playlists"
              >
                <HiArrowLeft className="text-xl" />
              </Link>

              <div>

                <p className="text-sm text-[var(--text-secondary)]">
                  Your collection
                </p>

                <h1 className="max-w-[220px] truncate text-lg font-bold sm:max-w-md sm:text-xl">
                  {playlist.name}
                </h1>

              </div>

            </div>

            <Link
              to="/profile"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            >
              {user?.name?.charAt(0)?.toUpperCase() ||
                "U"}
            </Link>

          </header>

          {/* =====================================================
              PAGE CONTENT
          ===================================================== */}

          <div className="mx-auto max-w-[1500px] space-y-10 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* =====================================================
                PLAYLIST HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 shadow-2xl shadow-violet-950/10 sm:p-8 lg:p-10">

              {/* GLOW */}

              <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />

              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[120px]" />

              <div className="relative z-10 grid gap-8 md:grid-cols-[240px_1fr] md:items-end lg:grid-cols-[280px_1fr]">

                {/* ARTWORK */}

                <div className="group relative aspect-square overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 shadow-2xl">

                  {artwork ? (
                    <img
                      src={artwork}
                      alt={playlist.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <HiMusicalNote className="text-7xl text-violet-400/70" />
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                </div>

                {/* INFO */}

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                    Playlist
                  </p>

                  <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                    {playlist.name}
                  </h2>

                  {playlist.description && (
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                      {playlist.description}
                    </p>
                  )}

                  {/* STATS */}

                  <div className="mt-5 flex flex-wrap items-center gap-3">

                    <span className="rounded-full border border-[var(--border)] bg-black/10 px-3 py-1.5 text-xs text-[var(--text-secondary)]">
                      {songs.length}{" "}
                      {songs.length === 1
                        ? "song"
                        : "songs"}
                    </span>

                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-400">
                      Personal playlist
                    </span>

                  </div>

                  {/* PLAY ALL */}

                  {songs.length > 0 && (
                    <button
                      type="button"
                      onClick={handlePlayAll}
                      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/30"
                    >

                      {currentSong &&
                      songs.some(
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

            <section>

              <div className="mb-5 flex items-end justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                    Your playlist
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Songs
                  </h2>

                </div>

                {songs.length > 0 && (
                  <span className="text-sm text-[var(--text-muted)]">
                    {songs.length} tracks
                  </span>
                )}

              </div>

              {/* =====================================================
                  EMPTY PLAYLIST
              ===================================================== */}

              {songs.length === 0 && (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/60 px-5 text-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10">
                    <HiMusicalNote className="text-4xl text-violet-400" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    This playlist is empty
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                    Add songs from Discover to start
                    building your collection.
                  </p>

                  <Link
                    to="/discover"
                    className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                  >
                    Discover Music
                  </Link>

                </div>
              )}

              {/* =====================================================
                  SONG LIST
              ===================================================== */}

              {songs.length > 0 && (
                <div className="space-y-3">

                  {songs.map((song, index) => {

                    const isCurrent =
                      String(currentSong?.id) ===
                      String(song.songId);

                    const isSongPlaying =
                      isCurrent && isPlaying;

                    const isLiked =
                      likedSongs.has(
                        String(song.songId)
                      );

                    const isLiking =
                      likingSong === song.songId;

                    const isRemoving =
                      removingSong === song.songId;

                    return (
                      <div
                        key={`${song.songId}-${index}`}
                        className={`
                          group relative flex items-center gap-3
                          rounded-2xl border p-3
                          transition-all duration-300
                          sm:gap-4 sm:p-4

                          ${
                            isCurrent
                              ? "border-violet-500/30 bg-violet-500/10 shadow-lg shadow-violet-950/10"
                              : "border-[var(--border)] bg-[var(--surface)]/60 hover:border-violet-500/30 hover:bg-violet-500/5"
                          }
                        `}
                      >

                        {/* NUMBER */}

                        <div className="hidden w-7 shrink-0 text-center text-xs text-[var(--text-muted)] sm:block">

                          {isSongPlaying ? (
                            <span className="font-bold text-violet-400">
                              ♪
                            </span>
                          ) : (
                            index + 1
                          )}

                        </div>

                        {/* ARTWORK */}

                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--card)] sm:h-16 sm:w-16">

                          {song.artwork ? (
                            <img
                              src={song.artwork}
                              alt={song.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-violet-400">
                              <HiMusicalNote className="text-xl" />
                            </div>
                          )}

                          {/* PLAY OVERLAY */}

                          <button
                            type="button"
                            onClick={() =>
                              handlePlaySong(song)
                            }
                            className={`
                              absolute inset-0
                              flex items-center justify-center
                              bg-black/60
                              transition

                              ${
                                isSongPlaying
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }
                            `}
                            aria-label={
                              isSongPlaying
                                ? "Pause song"
                                : "Play song"
                            }
                          >

                            {isSongPlaying ? (
                              <HiPause className="text-xl text-white" />
                            ) : (
                              <HiPlay className="ml-0.5 text-xl text-white" />
                            )}

                          </button>

                        </div>

                        {/* SONG INFORMATION */}

                        <button
                          type="button"
                          onClick={() =>
                            handlePlaySong(song)
                          }
                          className="min-w-0 flex-1 text-left"
                        >

                          <h3
                            className={`
                              truncate text-sm font-semibold
                              sm:text-[15px]

                              ${
                                isCurrent
                                  ? "text-violet-400"
                                  : "text-[var(--text-primary)]"
                              }
                            `}
                            title={song.title}
                          >
                            {song.title}
                          </h3>

                          <p
                            className="mt-1 truncate text-xs text-[var(--text-muted)]"
                            title={
                              song.artist ||
                              "Unknown artist"
                            }
                          >
                            {song.artist ||
                              "Unknown artist"}
                          </p>

                        </button>

                        {/* PLAYING */}

                        {isSongPlaying && (
                          <span className="hidden rounded-full bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-400 lg:block">
                            Playing
                          </span>
                        )}

                        {/* LIKE BUTTON */}

                        <button
                          type="button"
                          onClick={() =>
                            handleLike(song.songId)
                          }
                          disabled={isLiking}
                          aria-label={
                            isLiked
                              ? "Unlike song"
                              : "Like song"
                          }
                          title={
                            isLiked
                              ? "Unlike"
                              : "Like"
                          }
                          className={`
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-full
                            transition-all duration-200

                            ${
                              isLiked
                                ? "bg-violet-500/10 text-violet-400"
                                : "text-[var(--text-muted)] hover:bg-violet-500/10 hover:text-violet-400"
                            }

                            ${
                              isLiking
                                ? "cursor-wait opacity-50"
                                : "hover:scale-105"
                            }
                          `}
                        >

                          <HiHeart
                            className={`
                              text-xl transition-transform
                              ${
                                isLiked
                                  ? "scale-110 fill-current"
                                  : "scale-100"
                              }
                            `}
                          />

                        </button>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSong(
                              song.songId
                            )
                          }
                          disabled={isRemoving}
                          title="Remove from playlist"
                          aria-label="Remove from playlist"
                          className={`
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-full
                            text-[var(--text-muted)]
                            transition-all duration-200

                            hover:bg-red-500/10
                            hover:text-red-400
                            hover:scale-105

                            ${
                              isRemoving
                                ? "cursor-wait opacity-50"
                                : ""
                            }
                          `}
                        >

                          {isRemoving ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                          ) : (
                            <HiTrash className="text-lg" />
                          )}

                        </button>

                      </div>
                    );
                  })}

                </div>
              )}

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}

export default PlaylistDetails;