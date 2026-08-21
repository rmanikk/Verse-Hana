import { useEffect, useState } from "react";
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
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

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

            <div className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400">
              <HiQueueList className="text-lg" />
              Playlists
            </div>

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

          {/* =====================================================
              HEADER
          ===================================================== */}

          <header className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <HiQueueList className="text-xl" />
              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Your collection
                </p>

                <h1 className="text-lg font-bold sm:text-xl">
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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] hover:shadow-violet-500/30"
            >
              <HiPlus className="text-lg" />

              <span className="hidden sm:block">
                Create Playlist
              </span>
            </button>

          </header>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* PAGE INTRO */}

            <section className="relative mb-10 overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8">

              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-[90px]" />

              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[90px]" />

              <div className="relative z-10">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Your music
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Your playlists.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  Create collections for every mood,
                  moment and version of yourself.
                </p>

              </div>

            </section>

            {/* =====================================================
                LOADING
            ===================================================== */}

            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
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
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center">

                <HiQueueList className="mx-auto text-5xl text-red-400" />

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
                <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 px-6 text-center">

                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

                  <div className="relative z-10">

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-400">
                      <HiQueueList className="text-4xl" />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold">
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

                  <div className="mb-5 flex items-end justify-between">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                        Collections
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        Your playlists
                      </h2>
                    </div>

                    <span className="text-sm text-[var(--text-muted)]">
                      {playlists.length}{" "}
                      {playlists.length === 1
                        ? "playlist"
                        : "playlists"}
                    </span>

                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

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
                          className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10"
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

                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10">
                                  <HiQueueList className="text-4xl text-violet-400" />
                                </div>

                                <span className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-violet-400/70">
                                  Playlist
                                </span>

                              </div>
                            )}

                            {/* DARK OVERLAY */}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 transition duration-300 group-hover:opacity-80" />

                            {/* PLAY BUTTON */}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">

                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-2xl shadow-violet-500/40 transition duration-300 group-hover:scale-105">
                                <HiPlay className="ml-0.5 text-2xl" />
                              </div>

                            </div>

                            {/* SONG COUNT */}

                            <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                              {songCount}{" "}
                              {songCount === 1
                                ? "song"
                                : "songs"}
                            </div>

                          </div>

                          {/* INFO */}

                          <div className="px-1 pt-4">

                            <h2
                              className="truncate text-lg font-bold"
                              title={playlist.name}
                            >
                              {playlist.name}
                            </h2>

                            {playlist.description ? (
                              <p
                                className="mt-1 truncate text-sm text-[var(--text-secondary)]"
                                title={
                                  playlist.description
                                }
                              >
                                {playlist.description}
                              </p>
                            ) : (
                              <p className="mt-1 text-sm text-[var(--text-muted)]">
                                No description
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between">

                              <span className="text-xs text-[var(--text-muted)]">
                                Your collection
                              </span>

                              <span className="text-xs font-medium text-violet-400 opacity-0 transition group-hover:opacity-100">
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
                            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition duration-200 group-hover:opacity-100 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete playlist"
                          >
                            <HiTrash className="text-sm" />
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={() =>
            !creating &&
            setShowCreate(false)
          }
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  New collection
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Create Playlist
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
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
              >
                <HiXMark className="text-xl" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreatePlaylist}
              className="space-y-5 p-6"
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

              <div className="flex gap-3 pt-1">

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