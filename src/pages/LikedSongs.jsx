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
  HiPlus,
  HiXMark,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

const API_URL = "http://localhost:5000";

const SONGS_PER_PAGE = 10;

function LikedSongs() {
  const { user, logout } = useAuth();

  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    likedSongs.length / SONGS_PER_PAGE
  );

  const paginatedSongs = useMemo(() => {
    const startIndex =
      (currentPage - 1) * SONGS_PER_PAGE;

    return likedSongs.slice(
      startIndex,
      startIndex + SONGS_PER_PAGE
    );
  }, [likedSongs, currentPage]);

  // =====================================================
  // PLAYLIST
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
  // FETCH LIKED SONGS
  // =====================================================

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        setLoading(true);
        setError("");

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
            data.message ||
              "Failed to fetch liked songs."
          );
        }

        setLikedSongs(data.likes || []);
      } catch (err) {
        console.error(
          "Liked songs error:",
          err
        );

        setError(
          "We couldn't load your liked songs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, []);

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

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error(
        "Fetch playlists error:",
        error
      );
    }
  };

  // =====================================================
  // UNLIKE SONG
  // =====================================================

  const handleUnlike = async (songId) => {
    try {
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

      setLikedSongs((songs) => {
        const updatedSongs = songs.filter(
          (song) =>
            String(song.songId) !==
            String(songId)
        );

        // If deleting the last song on a page,
        // move back one page.
        const newTotalPages = Math.ceil(
          updatedSongs.length /
            SONGS_PER_PAGE
        );

        if (
          currentPage > newTotalPages &&
          newTotalPages > 0
        ) {
          setCurrentPage(newTotalPages);
        }

        return updatedSongs;
      });
    } catch (err) {
      console.error(
        "Unlike error:",
        err
      );
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

    const queue = likedSongs.map(
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

    playSong(
      convertedSong,
      queue
    );
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

  const addToPlaylist = async (
    playlistId
  ) => {
    if (!selectedSong) {
      return;
    }

    try {
      setPlaylistLoading(true);
      setActionMessage("");

      const response = await fetch(
        `${API_URL}/api/playlists/${playlistId}/songs`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            songId:
              selectedSong.songId,
            title:
              selectedSong.title,
            artist:
              selectedSong.artist ||
              "Unknown artist",
            artwork:
              selectedSong.artwork ||
              "",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add song to playlist."
        );
      }

      setActionMessage(
        "Song added to playlist."
      );

      setTimeout(() => {
        setPlaylistModalOpen(false);
        setSelectedSong(null);
        setActionMessage("");
      }, 900);
    } catch (error) {
      console.error(
        "Add to playlist error:",
        error
      );

      setActionMessage(
        error.message ||
          "Failed to add song to playlist."
      );
    } finally {
      setPlaylistLoading(false);
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

            {/* ACTIVE */}

            <div className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400">
              <HiHeart className="text-lg" />
              Liked Songs
            </div>

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

          {/* USER */}

          <div className="border-t border-[var(--border)] p-4">

            <Link
              to="/profile"
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "U"}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold">
                  {user?.name ||
                    "User"}
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
                Your personal collection
              </p>

              <h1 className="text-lg font-bold sm:text-xl">
                Liked Songs
              </h1>

            </div>

            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </Link>

          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* HERO */}

            <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

              <div className="relative z-10">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Your favorites
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Songs you{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    love.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  Every song you like is saved here
                  so you can easily come back to
                  the music that means something to
                  you.
                </p>

                {!loading &&
                  likedSongs.length > 0 && (
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
                      <HiHeart className="text-violet-400" />
                      {likedSongs.length}{" "}
                      {likedSongs.length === 1
                        ? "song"
                        : "songs"}
                    </div>
                  )}

              </div>

            </section>

            {/* LOADING */}

            {loading && (
              <div className="mt-10 space-y-3">

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3"
                    >

                      <div className="hidden h-5 w-6 animate-pulse rounded bg-[var(--card)] sm:block" />

                      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-[var(--card)]" />

                      <div className="flex-1">

                        <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--card)]" />

                        <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-[var(--card)]" />

                      </div>

                      <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--card)]" />

                      <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--card)]" />

                    </div>
                  )
                )}

              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

                <HiMusicalNote className="mx-auto text-4xl text-red-400" />

                <p className="mt-3 text-sm text-red-400">
                  {error}
                </p>

              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              likedSongs.length === 0 && (
                <div className="mt-10 flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 text-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10">
                    <HiHeart className="text-4xl text-violet-400" />
                  </div>

                  <h2 className="mt-6 text-2xl font-bold">
                    No liked songs yet
                  </h2>

                  <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                    Songs you like will appear here.
                    Start exploring and build your
                    personal collection.
                  </p>

                  <Link
                    to="/discover"
                    className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                  >
                    Discover music
                  </Link>

                </div>
              )}

            {/* SONG LIST */}

            {!loading &&
              !error &&
              likedSongs.length > 0 && (

                <section className="mt-10">

                  {/* SECTION HEADER */}

                  <div className="mb-5 flex items-end justify-between">

                    <div>

                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                        Collection
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        Your liked music
                      </h2>

                    </div>

                    <span className="text-xs text-[var(--text-muted)]">
                      Page {currentPage} of{" "}
                      {totalPages}
                    </span>

                  </div>

                  {/* SONGS */}

                  <div className="space-y-3">

                    {paginatedSongs.map(
                      (song, index) => {

                        const isCurrent =
                          String(
                            currentSong?.id
                          ) ===
                          String(
                            song.songId
                          );

                        const globalIndex =
                          (currentPage - 1) *
                            SONGS_PER_PAGE +
                          index;

                        return (
                          <div
                            key={
                              song._id ||
                              song.songId
                            }
                            className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-300 sm:gap-4 ${
                              isCurrent
                                ? "border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/5"
                                : "border-[var(--border)] bg-[var(--surface)]/60 hover:border-violet-500/30 hover:bg-violet-500/5"
                            }`}
                          >

                            {/* CURRENT SONG INDICATOR */}

                            {isCurrent && (
                              <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-violet-400 to-fuchsia-500" />
                            )}

                            {/* NUMBER */}

                            <div
                              className={`hidden w-7 shrink-0 text-center text-sm font-medium sm:block ${
                                isCurrent
                                  ? "text-violet-400"
                                  : "text-[var(--text-muted)]"
                              }`}
                            >
                              {isCurrent &&
                              isPlaying ? (
                                <span className="text-xs">
                                  ♪
                                </span>
                              ) : (
                                globalIndex + 1
                              )}
                            </div>

                            {/* ARTWORK */}

                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--card)] sm:h-16 sm:w-16">

                              {song.artwork ? (
                                <img
                                  src={
                                    song.artwork
                                  }
                                  alt={
                                    song.title
                                  }
                                  className={`h-full w-full object-cover transition duration-300 ${
                                    isCurrent
                                      ? "scale-105"
                                      : "group-hover:scale-105"
                                  }`}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                                  <HiMusicalNote className="text-xl text-violet-400" />
                                </div>
                              )}

                              {/* PLAY OVERLAY */}

                              <button
                                type="button"
                                onClick={() =>
                                  handlePlay(
                                    song
                                  )
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100"
                              >
                                {isCurrent &&
                                isPlaying ? (
                                  <HiPause className="text-xl text-white" />
                                ) : (
                                  <HiPlay className="ml-0.5 text-xl text-white" />
                                )}
                              </button>

                            </div>

                            {/* SONG INFO */}

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

                            </div>

                            {/* ACTIONS */}

                            <div className="flex shrink-0 items-center gap-1 sm:gap-2">

                              {/* PLAY */}

                              <button
                                type="button"
                                onClick={() =>
                                  handlePlay(
                                    song
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-violet-500/10 hover:text-violet-400 sm:h-10 sm:w-10"
                                title={
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
                                  <HiPlay className="text-lg" />
                                )}
                              </button>

                              {/* PLAYLIST */}

                              <button
                                type="button"
                                onClick={() =>
                                  openPlaylistModal(
                                    song
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-violet-500/10 hover:text-violet-400 sm:h-10 sm:w-10"
                                title="Add to playlist"
                              >
                                <HiPlus className="text-lg" />
                              </button>

                              {/* LIKE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleUnlike(
                                    song.songId
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full text-violet-400 transition hover:bg-red-500/10 hover:text-red-400 sm:h-10 sm:w-10"
                                title="Unlike"
                              >
                                <HiHeart className="fill-current text-lg" />
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
                              goToPage(
                                page
                              )
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                              currentPage ===
                              page
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
                        likedSongs.length
                      )}{" "}
                      of{" "}
                      {likedSongs.length}{" "}
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

            {/* HEADER */}

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
                disabled={
                  playlistLoading
                }
                onClick={() => {
                  setPlaylistModalOpen(
                    false
                  );
                  setSelectedSong(
                    null
                  );
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
                      src={
                        selectedSong.artwork
                      }
                      alt={
                        selectedSong.title
                      }
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
                      setPlaylistModalOpen(
                        false
                      )
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
                        key={
                          playlist._id
                        }
                        type="button"
                        disabled={
                          playlistLoading
                        }
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

export default LikedSongs;