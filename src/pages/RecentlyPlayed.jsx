import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiHome,
  HiMagnifyingGlass,
  HiMusicalNote,
  HiHeart,
  HiQueueList,
  HiClock,
  HiArrowRightOnRectangle,
  HiPlay,
  HiPause,
  HiTrash,
  HiPlus,
  HiXMark,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

const API_URL = "http://localhost:5000";

const SONGS_PER_PAGE = 10;

function RecentlyPlayed() {
  const { user, logout } = useAuth();

  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LIKES
  // =====================================================

  const [likedSongs, setLikedSongs] = useState(new Set());

  // =====================================================
  // PLAYLISTS
  // =====================================================

  const [playlists, setPlaylists] = useState([]);

  const [playlistModalOpen, setPlaylistModalOpen] =
    useState(false);

  const [selectedSong, setSelectedSong] =
    useState(null);

  const [playlistLoading, setPlaylistLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    recentlyPlayed.length / SONGS_PER_PAGE
  );

  const paginatedSongs = useMemo(() => {
    const startIndex =
      (currentPage - 1) * SONGS_PER_PAGE;

    return recentlyPlayed.slice(
      startIndex,
      startIndex + SONGS_PER_PAGE
    );
  }, [recentlyPlayed, currentPage]);

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
        console.error(
          "Recently played error:",
          err
        );

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
  // FETCH LIKED SONGS
  // =====================================================

  const fetchLikedSongs = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/likes`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      const likedIds = new Set(
        (data.likes || []).map((like) =>
          String(like.songId)
        )
      );

      setLikedSongs(likedIds);
    } catch (err) {
      console.error(
        "Fetch liked songs error:",
        err
      );
    }
  };

  // =====================================================
  // FETCH PLAYLISTS
  // =====================================================

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/playlists`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error(
        "Fetch playlists error:",
        err
      );
    }
  };

  // =====================================================
  // INITIAL USER DATA
  // =====================================================

  useEffect(() => {
    if (user) {
      fetchLikedSongs();
      fetchPlaylists();
    }
  }, [user]);

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleLike = async (song) => {
    const songId = String(song.songId);

    const isLiked = likedSongs.has(songId);

    try {
      if (isLiked) {
        const response = await fetch(
          `${API_URL}/api/likes/${songId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to unlike song."
          );
        }

        setLikedSongs((previous) => {
          const updated = new Set(previous);
          updated.delete(songId);
          return updated;
        });
      } else {
        const response = await fetch(
          `${API_URL}/api/likes/${songId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              title: song.title,
              artist:
                song.artist ||
                "Unknown artist",
              artwork:
                song.artwork || "",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to like song."
          );
        }

        setLikedSongs((previous) => {
          const updated = new Set(previous);
          updated.add(songId);
          return updated;
        });
      }
    } catch (err) {
      console.error(
        "Like/unlike error:",
        err
      );

      setActionMessage(
        err.message ||
          "Something went wrong."
      );

      setTimeout(
        () => setActionMessage(""),
        2500
      );
    }
  };

  // =====================================================
  // OPEN PLAYLIST MODAL
  // =====================================================

  const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setPlaylistModalOpen(true);
    setActionMessage("");

    fetchPlaylists();
  };

  // =====================================================
  // ADD SONG TO PLAYLIST
  // =====================================================

  const addToPlaylist = async (playlistId) => {
    if (!selectedSong) return;

    try {
      setPlaylistLoading(true);
      setActionMessage("");

      const response = await fetch(
        `${API_URL}/api/playlists/${playlistId}/songs`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            songId: selectedSong.songId,
            title: selectedSong.title,
            artist:
              selectedSong.artist ||
              "Unknown artist",
            artwork:
              selectedSong.artwork || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add song to playlist."
        );
      }

      setActionMessage(
        "Song added to playlist."
      );

      // Refresh playlist data so song count updates
      await fetchPlaylists();

      setTimeout(() => {
        setPlaylistModalOpen(false);
        setSelectedSong(null);
        setActionMessage("");
      }, 900);
    } catch (err) {
      console.error(
        "Add to playlist error:",
        err
      );

      setActionMessage(
        err.message ||
          "Failed to add song to playlist."
      );
    } finally {
      setPlaylistLoading(false);
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
        name:
          song.artist ||
          "Unknown artist",
      },
    };

    const queue = recentlyPlayed.map(
      (item) => ({
        id: item.songId,
        title: item.title,

        artwork: item.artwork
          ? {
              "480x480": item.artwork,
            }
          : null,

        user: {
          name:
            item.artist ||
            "Unknown artist",
        },
      })
    );

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
      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Clear history error:",
        err
      );

      alert(
        "Failed to clear your history."
      );
    }
  };

  // =====================================================
  // PAGE NAVIGATION
  // =====================================================

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (
      currentPage >=
      totalPages - 2
    ) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

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

            <Link
              to="/playlists"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiQueueList className="text-lg" />
              Playlists
            </Link>

            {/* ACTIVE */}

            <div className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400">
              <HiClock className="text-lg" />
              Recently Played
            </div>

          </nav>

          {/* USER */}

          <div className="border-t border-[var(--border)] p-4">

            <Link
              to="/profile"
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
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
            MAIN
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* HEADER */}

          <header className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">

            <div>

              <p className="text-sm text-[var(--text-secondary)]">
                Your listening history
              </p>

              <h1 className="text-lg font-bold sm:text-xl">
                Recently Played
              </h1>

            </div>

            <div className="flex items-center gap-3">

              {recentlyPlayed.length > 0 && (
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
              )}

              <Link
                to="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
              >
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </Link>

            </div>

          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

              <div className="relative z-10">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Your history
                </p>

                <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Music you've{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    recently played.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  Quickly return to songs you've
                  listened to recently and keep
                  your favorite tracks organized.
                </p>

              </div>

            </section>

            {/* =====================================================
                LOADING
            ===================================================== */}

            {loading && (

              <section className="mt-10">

                <div className="space-y-3">

                  {[1, 2, 3, 4, 5, 6].map(
                    (item) => (

                      <div
                        key={item}
                        className="flex animate-pulse items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3"
                      >

                        <div className="h-14 w-14 shrink-0 rounded-xl bg-[var(--card)]" />

                        <div className="flex-1">

                          <div className="h-4 w-1/3 rounded bg-[var(--card)]" />

                          <div className="mt-2 h-3 w-1/5 rounded bg-[var(--card)]" />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>

            )}

            {/* =====================================================
                ERROR
            ===================================================== */}

            {!loading && error && (

              <section className="mt-10">

                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

                  <HiClock className="mx-auto text-4xl text-red-400" />

                  <p className="mt-4 text-sm text-red-400">
                    {error}
                  </p>

                </div>

              </section>

            )}

            {/* =====================================================
                EMPTY
            ===================================================== */}

            {!loading &&
              !error &&
              recentlyPlayed.length === 0 && (

                <section className="mt-10">

                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10">
                      <HiClock className="text-4xl text-violet-400" />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold">
                      Nothing played yet
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                      Songs you listen to will appear
                      here so you can quickly find
                      and replay your recent music.
                    </p>

                    <Link
                      to="/dashboard"
                      className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                    >
                      Start listening
                    </Link>

                  </div>

                </section>

              )}

            {/* =====================================================
                HISTORY
            ===================================================== */}

            {!loading &&
              !error &&
              recentlyPlayed.length > 0 && (

                <section className="mt-10">

                  {/* SECTION HEADER */}

                  <div className="mb-5 flex items-end justify-between">

                    <div>

                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                        Listening history
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        Recently played
                      </h2>

                    </div>

                    <span className="text-sm text-[var(--text-muted)]">
                      {recentlyPlayed.length} songs
                    </span>

                  </div>

                  {/* SONG LIST */}

                  <div className="space-y-3">

                    {paginatedSongs.map(
                      (song, index) => {

                        const isCurrent =
                          String(currentSong?.id) ===
                          String(song.songId);

                        const isLiked =
                          likedSongs.has(
                            String(song.songId)
                          );

                        const globalIndex =
                          (currentPage - 1) *
                            SONGS_PER_PAGE +
                          index;

                        return (

                          <div
                            key={
                              song._id ||
                              `${song.songId}-${globalIndex}`
                            }
                            className="group relative flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-3 transition-all duration-300 hover:-translate-y-[1px] hover:border-violet-500/30 hover:bg-violet-500/5 hover:shadow-lg hover:shadow-violet-500/5 sm:gap-4"
                          >

                            {/* NUMBER */}

                            <div className="hidden w-7 shrink-0 text-center text-sm font-medium text-[var(--text-muted)] sm:block">
                              {globalIndex + 1}
                            </div>

                            {/* ARTWORK */}

                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--card)] sm:h-[68px] sm:w-[68px]">

                              {song.artwork ? (

                                <img
                                  src={song.artwork}
                                  alt={song.title}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />

                              ) : (

                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400">
                                  <HiMusicalNote className="text-2xl" />
                                </div>

                              )}

                              {/* PLAY OVERLAY */}

                              <button
                                type="button"
                                onClick={() =>
                                  handlePlay(song)
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-all duration-200 group-hover:opacity-100"
                                aria-label={
                                  isCurrent &&
                                  isPlaying
                                    ? "Pause"
                                    : "Play"
                                }
                              >

                                {isCurrent &&
                                isPlaying ? (
                                  <HiPause className="text-xl text-white" />
                                ) : (
                                  <HiPlay className="ml-0.5 text-xl text-white" />
                                )}

                              </button>

                            </div>

                            {/* SONG INFORMATION */}

                            <div className="min-w-0 flex-1">

                              <h3
                                className={`truncate text-sm font-semibold sm:text-[15px] ${
                                  isCurrent
                                    ? "text-violet-400"
                                    : "text-[var(--text-primary)]"
                                }`}
                              >
                                {song.title}
                              </h3>

                              <p className="mt-1 truncate text-xs text-[var(--text-muted)] sm:text-sm">
                                {song.artist ||
                                  "Unknown artist"}
                              </p>

                              {isCurrent &&
                                isPlaying && (
                                  <div className="mt-1 flex items-center gap-1.5">

                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

                                    <span className="text-[11px] font-medium text-violet-400">
                                      Playing now
                                    </span>

                                  </div>
                                )}

                            </div>

                            {/* PLAYED TIME */}

                            <div className="hidden min-w-[145px] text-right text-xs text-[var(--text-muted)] xl:block">
                              {song.playedAt
                                ? new Date(
                                    song.playedAt
                                  ).toLocaleString()
                                : ""}
                            </div>

                            {/* ACTIONS */}

                            <div className="flex shrink-0 items-center gap-1">

                              {/* LIKE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleLike(song)
                                }
                                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                                  isLiked
                                    ? "text-violet-500 hover:bg-violet-500/10"
                                    : "text-[var(--text-muted)] hover:bg-violet-500/10 hover:text-violet-400"
                                }`}
                                title={
                                  isLiked
                                    ? "Unlike"
                                    : "Like"
                                }
                                aria-label={
                                  isLiked
                                    ? "Unlike song"
                                    : "Like song"
                                }
                              >

                                <HiHeart
                                  className={`text-xl ${
                                    isLiked
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />

                              </button>

                              {/* PLAYLIST */}

                              <button
                                type="button"
                                onClick={() =>
                                  openPlaylistModal(
                                    song
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] transition-all duration-200 hover:bg-violet-500/10 hover:text-violet-400"
                                title="Add to playlist"
                                aria-label="Add to playlist"
                              >
                                <HiPlus className="text-xl" />
                              </button>

                              {/* PLAY */}

                              <button
                                type="button"
                                onClick={() =>
                                  handlePlay(song)
                                }
                                className="hidden h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/20 transition hover:scale-105 hover:bg-violet-500 sm:flex"
                                title={
                                  isCurrent &&
                                  isPlaying
                                    ? "Pause"
                                    : "Play"
                                }
                                aria-label={
                                  isCurrent &&
                                  isPlaying
                                    ? "Pause"
                                    : "Play"
                                }
                              >

                                {isCurrent &&
                                isPlaying ? (
                                  <HiPause className="text-lg" />
                                ) : (
                                  <HiPlay className="ml-0.5 text-lg" />
                                )}

                              </button>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                  {/* =================================================
                      PAGINATION
                  ================================================= */}

                  {totalPages > 1 && (

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">

                      {/* PREVIOUS */}

                      <button
                        type="button"
                        disabled={
                          currentPage === 1
                        }
                        onClick={() =>
                          goToPage(
                            currentPage - 1
                          )
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                          currentPage === 1
                            ? "cursor-not-allowed border-[var(--border)] text-[var(--text-muted)] opacity-50"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                        }`}
                      >
                        ← Previous
                      </button>

                      {/* PAGE NUMBERS */}

                      {getPageNumbers().map(
                        (page) => (

                          <button
                            key={page}
                            type="button"
                            onClick={() =>
                              goToPage(page)
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                              currentPage === page
                                ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {page}
                          </button>

                        )
                      )}

                      {/* NEXT */}

                      <button
                        type="button"
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          goToPage(
                            currentPage + 1
                          )
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                          currentPage ===
                          totalPages
                            ? "cursor-not-allowed border-[var(--border)] text-[var(--text-muted)] opacity-50"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                        }`}
                      >
                        Next →
                      </button>

                    </div>

                  )}

                  {/* PAGE INFO */}

                  {totalPages > 1 && (

                    <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
                      Showing{" "}
                      {(currentPage - 1) *
                        SONGS_PER_PAGE +
                        1}{" "}
                      –{" "}
                      {Math.min(
                        currentPage *
                          SONGS_PER_PAGE,
                        recentlyPlayed.length
                      )}{" "}
                      of{" "}
                      {recentlyPlayed.length}{" "}
                      songs
                    </p>

                  )}

                </section>

              )}

          </div>

        </section>

      </div>

      {/* =====================================================
          PLAYLIST MODAL
      ===================================================== */}

      {playlistModalOpen && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {

            if (!playlistLoading) {
              setPlaylistModalOpen(false);
              setSelectedSong(null);
            }

          }}
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Save music
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Add to playlist
                </h3>

              </div>

              <button
                type="button"
                disabled={playlistLoading}
                onClick={() => {
                  setPlaylistModalOpen(false);
                  setSelectedSong(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white"
              >
                <HiXMark className="text-xl" />
              </button>

            </div>

            {/* SELECTED SONG */}

            {selectedSong && (

              <div className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-4">

                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">

                  {selectedSong.artwork ? (

                    <img
                      src={selectedSong.artwork}
                      alt={selectedSong.title}
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center">
                      <HiMusicalNote className="text-violet-400" />
                    </div>

                  )}

                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold">
                    {selectedSong.title}
                  </p>

                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {selectedSong.artist ||
                      "Unknown artist"}
                  </p>

                </div>

              </div>

            )}

            {/* PLAYLISTS */}

            <div className="max-h-[320px] overflow-y-auto p-4">

              {playlists.length === 0 ? (

                <div className="py-8 text-center">

                  <HiQueueList className="mx-auto text-4xl text-[var(--text-muted)]" />

                  <p className="mt-3 text-sm font-medium">
                    No playlists yet
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Create a playlist first.
                  </p>

                  <Link
                    to="/playlists"
                    onClick={() =>
                      setPlaylistModalOpen(false)
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    <HiPlus />
                    Create playlist
                  </Link>

                </div>

              ) : (

                <div className="space-y-2">

                  {playlists.map(
                    (playlist) => (

                      <button
                        key={playlist._id}
                        type="button"
                        disabled={playlistLoading}
                        onClick={() =>
                          addToPlaylist(
                            playlist._id
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-3 text-left transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                          <HiQueueList className="text-xl" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold">
                            {playlist.name}
                          </p>

                          <p className="text-xs text-[var(--text-muted)]">
                            {playlist.songs?.length ||
                              0}{" "}
                            songs
                          </p>

                        </div>

                        <HiPlus className="text-lg text-[var(--text-muted)]" />

                      </button>

                    )
                  )}

                </div>

              )}

            </div>

            {/* ACTION MESSAGE */}

            {actionMessage && (

              <div className="border-t border-[var(--border)] px-6 py-4">

                <p
                  className={`text-center text-sm ${
                    actionMessage.includes(
                      "successfully"
                    ) ||
                    actionMessage.includes(
                      "added"
                    )
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {actionMessage}
                </p>

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}

export default RecentlyPlayed;