import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { Link } from "react-router-dom";
import {
  HiHome,
  HiMagnifyingGlass,
  HiMusicalNote,
  HiHeart,
  HiQueueList,
  HiClock,
  HiArrowRightOnRectangle,
  HiPlus,
  HiTrash,
  HiPlay,
  HiXMark,
  HiBars3,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";



function Playlists() {
  const { user, logout } = useAuth();

  const [playlists, setPlaylists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // =====================================================
  // MOBILE MENU
  // =====================================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =====================================================
  // FETCH PLAYLISTS
  // =====================================================

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/playlists`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch playlists."
        );
      }

      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error("Fetch playlists error:", error);

      setError(
        "We couldn't load your playlists right now."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CREATE PLAYLIST
  // =====================================================

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        `${API_URL}/api/playlists`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create playlist."
        );
      }

      setPlaylists((previous) => [
        data.playlist,
        ...previous,
      ]);

      setName("");
      setDescription("");
      setShowCreate(false);
    } catch (error) {
      console.error(
        "Create playlist error:",
        error
      );

      alert(
        error.message ||
          "Failed to create playlist."
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // DELETE PLAYLIST
  // =====================================================

  const handleDeletePlaylist = async (
    event,
    playlistId
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this playlist?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(playlistId);

      const response = await fetch(
        `${API_URL}/api/playlists/${playlistId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete playlist."
        );
      }

      setPlaylists((previous) =>
        previous.filter(
          (playlist) =>
            playlist._id !== playlistId
        )
      );
    } catch (error) {
      console.error(
        "Delete playlist error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete playlist."
      );
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    closeMobileMenu();
    await logout();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">

        {/* =====================================================
            DESKTOP SIDEBAR
        ===================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 lg:flex lg:flex-col">

          {/* LOGO */}

          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-[var(--border)] px-6">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
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

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">

            <Link
              to="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiHome className="shrink-0 text-lg" />
              Home
            </Link>

            <Link
              to="/discover"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiMagnifyingGlass className="shrink-0 text-lg" />
              Discover
            </Link>

            <Link
              to="/genres"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiMusicalNote className="shrink-0 text-lg" />
              Genres
            </Link>

            <Link
              to="/liked-songs"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiHeart className="shrink-0 text-lg" />
              Liked Songs
            </Link>

            {/* ACTIVE */}

            <div className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400">
              <HiQueueList className="shrink-0 text-lg" />
              Playlists
            </div>

            <Link
              to="/recently-played"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiClock className="shrink-0 text-lg" />
              Recently Played
            </Link>

          </nav>

          {/* USER */}

          <div className="shrink-0 border-t border-[var(--border)] p-4">

            <Link
              to="/profile"
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
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
              <HiArrowRightOnRectangle className="shrink-0 text-lg" />
              Logout
            </button>

          </div>

        </aside>

        {/* =====================================================
            MOBILE SIDEBAR OVERLAY
        ===================================================== */}

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
          >
            <aside
              className="flex h-full w-[min(82vw,320px)] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* MOBILE LOGO */}

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
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white"
                  aria-label="Close menu"
                >
                  <HiXMark className="text-xl" />
                </button>

              </div>

              {/* MOBILE NAVIGATION */}

              <nav className="flex-1 space-y-2 overflow-y-auto p-4">

                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                >
                  <HiHome className="text-xl" />
                  Home
                </Link>

                <Link
                  to="/discover"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                >
                  <HiMagnifyingGlass className="text-xl" />
                  Discover
                </Link>

                <Link
                  to="/genres"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                >
                  <HiMusicalNote className="text-xl" />
                  Genres
                </Link>

                <Link
                  to="/liked-songs"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                >
                  <HiHeart className="text-xl" />
                  Liked Songs
                </Link>

                {/* ACTIVE */}

                <div className="flex items-center gap-3 rounded-xl bg-violet-500/10 px-4 py-3.5 text-sm font-medium text-violet-400">
                  <HiQueueList className="text-xl" />
                  Playlists
                </div>

                <Link
                  to="/recently-played"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                >
                  <HiClock className="text-xl" />
                  Recently Played
                </Link>

              </nav>

              {/* MOBILE USER */}

              <div className="shrink-0 border-t border-[var(--border)] p-4">

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
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
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <HiArrowRightOnRectangle className="text-lg" />
                  Logout
                </button>

              </div>

            </aside>
          </div>
        )}

        {/* =====================================================
            MAIN
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 backdrop-blur-xl sm:h-20 sm:px-6 lg:px-10">

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">

              {/* MOBILE HAMBURGER */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-400 lg:hidden"
                aria-label="Open navigation menu"
              >
                <HiBars3 className="text-xl" />
              </button>

              {/* HEADER ICON */}

              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 sm:flex">
                <HiQueueList className="text-xl" />
              </div>

              {/* TITLE */}

              <div className="min-w-0">

                <p className="hidden text-xs font-medium uppercase tracking-[0.2em] text-violet-400 sm:block">
                  Your collection
                </p>

                <h1 className="truncate text-base font-bold sm:text-xl">
                  Playlists
                </h1>

              </div>

            </div>

            {/* CREATE BUTTON */}

            <button
              type="button"
              onClick={() =>
                setShowCreate(true)
              }
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] hover:shadow-violet-500/30 sm:h-11 sm:px-4"
              aria-label="Create playlist"
              title="Create Playlist"
            >
              <HiPlus className="text-lg" />

              <span className="hidden sm:inline">
                Create Playlist
              </span>

            </button>

          </header>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">

            {/* =====================================================
                PAGE INTRO
            ===================================================== */}

            <section className="relative mb-8 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-5 sm:mb-10 sm:p-7 lg:p-9">

              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-[90px]" />

              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[90px]" />

              <div className="relative z-10">

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                  Your music
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Your playlists.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:mt-3 sm:text-base sm:leading-7">
                  Create collections for every mood,
                  moment and version of yourself.
                </p>

              </div>

            </section>

            {/* =====================================================
                LOADING
            ===================================================== */}

            {loading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">

                {[1, 2, 3, 4, 5, 6, 7, 8].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4"
                    >

                      <div className="aspect-[1.25] rounded-2xl bg-[var(--card)]" />

                      <div className="mt-4 h-5 w-3/4 rounded bg-[var(--card)]" />

                      <div className="mt-2 h-3 w-1/2 rounded bg-[var(--card)]" />

                    </div>
                  )
                )}

              </div>
            )}

            {/* =====================================================
                ERROR
            ===================================================== */}

            {!loading && error && (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center sm:p-10">

                <HiQueueList className="mx-auto text-4xl text-red-400 sm:text-5xl" />

                <p className="mt-4 text-sm text-red-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchPlaylists}
                  className="mt-5 rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  Try again
                </button>

              </div>
            )}

            {/* =====================================================
                EMPTY STATE
            ===================================================== */}

            {!loading &&
              !error &&
              playlists.length === 0 && (
                <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 px-5 py-12 text-center sm:min-h-[420px]">

                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

                  <div className="relative z-10">

                    <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-400 sm:h-20 sm:w-20">
                      <HiQueueList className="text-3xl sm:text-4xl" />
                    </div>

                    <h2 className="mt-5 text-xl font-bold sm:mt-6 sm:text-2xl">
                      No playlists yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                      Create your first playlist and
                      start collecting songs that match
                      your vibe.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowCreate(true)
                      }
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                    >
                      <HiPlus className="text-lg" />
                      Create Playlist
                    </button>

                  </div>

                </div>
              )}

            {/* =====================================================
                PLAYLIST GRID
            ===================================================== */}

            {!loading &&
              !error &&
              playlists.length > 0 && (
                <section>

                  <div className="mb-5 flex items-end justify-between gap-4">

                    <div className="min-w-0">

                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                        Collections
                      </p>

                      <h2 className="mt-1.5 text-xl font-bold sm:mt-2 sm:text-2xl">
                        Your playlists
                      </h2>

                    </div>

                    <span className="shrink-0 text-xs text-[var(--text-muted)] sm:text-sm">
                      {playlists.length}{" "}
                      {playlists.length === 1
                        ? "playlist"
                        : "playlists"}
                    </span>

                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">

                    {playlists.map((playlist) => {

                      const firstSong =
                        playlist.songs?.[0];

                      const artwork =
                        firstSong?.artwork || "";

                      const songCount =
                        playlist.songs?.length || 0;

                      return (
                        <Link
                          key={playlist._id}
                          to={`/playlists/${playlist._id}`}
                          className="group relative min-w-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10 sm:p-4"
                        >

                          {/* ARTWORK */}

                          <div className="relative aspect-[1.25] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/30 via-violet-500/10 to-fuchsia-500/20">

                            {artwork ? (
                              <img
                                src={artwork}
                                alt={playlist.name}
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 sm:h-20 sm:w-20 sm:rounded-3xl">
                                  <HiQueueList className="text-3xl text-violet-400 sm:text-4xl" />
                                </div>

                                <span className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400/70 sm:text-xs">
                                  Playlist
                                </span>

                              </div>
                            )}

                            {/* DARK OVERLAY */}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 transition duration-300 group-hover:opacity-80" />

                            {/* PLAY BUTTON */}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">

                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-2xl shadow-violet-500/40 transition duration-300 group-hover:scale-105 sm:h-14 sm:w-14">

                                <HiPlay className="ml-0.5 text-xl sm:text-2xl" />

                              </div>

                            </div>

                            {/* SONG COUNT */}

                            <div className="absolute bottom-2.5 left-2.5 rounded-lg bg-black/50 px-2 py-1.5 text-[10px] font-medium text-white backdrop-blur-md sm:bottom-3 sm:left-3 sm:px-2.5 sm:text-xs">
                              {songCount}{" "}
                              {songCount === 1
                                ? "song"
                                : "songs"}
                            </div>

                          </div>

                          {/* INFO */}

                          <div className="min-w-0 px-1 pt-3.5 sm:pt-4">

                            <h2
                              className="truncate text-base font-bold sm:text-lg"
                              title={playlist.name}
                            >
                              {playlist.name}
                            </h2>

                            {playlist.description ? (
                              <p
                                className="mt-1 truncate text-xs text-[var(--text-secondary)] sm:text-sm"
                                title={
                                  playlist.description
                                }
                              >
                                {playlist.description}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">
                                No description
                              </p>
                            )}

                            <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">

                              <span className="truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                                Your collection
                              </span>

                              <span className="hidden shrink-0 text-xs font-medium text-violet-400 opacity-0 transition group-hover:opacity-100 sm:inline">
                                Open playlist →
                              </span>

                            </div>

                          </div>

                          {/* DELETE BUTTON */}

                          <button
                            type="button"
                            onClick={(event) =>
                              handleDeletePlaylist(
                                event,
                                playlist._id
                              )
                            }
                            disabled={
                              deleting ===
                              playlist._id
                            }
                            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-100 backdrop-blur-md transition duration-200 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:right-6 sm:top-6 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Delete playlist"
                            aria-label="Delete playlist"
                          >
                            {deleting ===
                            playlist._id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                              <HiTrash className="text-sm" />
                            )}
                          </button>

                        </Link>
                      );
                    })}

                  </div>

                </section>
              )}

          </div>

        </section>

      </div>

      {/* =====================================================
          CREATE PLAYLIST MODAL
      ===================================================== */}

      {showCreate && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-5 backdrop-blur-sm sm:px-5"
          onClick={() =>
            !creating &&
            setShowCreate(false)
          }
        >

          <div
            className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-6">

              <div className="min-w-0">

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                  New collection
                </p>

                <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                  Create Playlist
                </h2>

                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)] sm:text-sm sm:leading-6">
                  Give your playlist a name and start
                  building your collection.
                </p>

              </div>

              <button
                type="button"
                disabled={creating}
                onClick={() =>
                  setShowCreate(false)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <HiXMark className="text-xl" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreatePlaylist}
              className="space-y-5 p-5 sm:p-6"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Playlist name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="My late night songs"
                  maxLength={100}
                  autoFocus
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium">

                  Description

                  <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
                    optional
                  </span>

                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Songs for those 2 AM thoughts..."
                  maxLength={300}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  disabled={creating}
                  className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    !name.trim()
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    "Creating..."
                  ) : (
                    <>
                      <HiPlus className="text-lg" />
                      Create
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

export default Playlists;