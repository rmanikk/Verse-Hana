import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowLeft,
  HiPlus,
  HiMusicalNote,
  HiTrash,
  HiPlay,
} from "react-icons/hi2";

const API_URL = "http://localhost:5000";

function Playlists() {
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
      console.error("Create playlist error:", error);

      alert(
        error.message || "Failed to create playlist."
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
          data.message || "Failed to delete playlist."
        );
      }

      setPlaylists((previous) =>
        previous.filter(
          (playlist) =>
            playlist._id !== playlistId
        )
      );
    } catch (error) {
      console.error("Delete playlist error:", error);

      alert(
        error.message || "Failed to delete playlist."
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

      {/* =================================================
          HEADER
      ================================================= */}

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
                Your collection
              </p>

              <h1 className="text-2xl font-bold">
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
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
          >
            <HiPlus className="text-lg" />
            <span className="hidden sm:block">
              Create Playlist
            </span>
          </button>

        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="aspect-square rounded-2xl bg-[var(--card)]" />

                <div className="mt-4 h-5 w-3/4 rounded bg-[var(--card)]" />

                <div className="mt-2 h-3 w-1/2 rounded bg-[var(--card)]" />
              </div>
            ))}

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchPlaylists}
              className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
            >
              Try again
            </button>

          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          playlists.length === 0 && (
            <div className="flex min-h-[450px] flex-col items-center justify-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10">
                <HiMusicalNote className="text-4xl text-violet-400" />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                No playlists yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                Create your first playlist and start
                collecting songs that match your vibe.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(true)
                }
                className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
              >
                <HiPlus className="text-lg" />
                Create Playlist
              </button>

            </div>
          )}

        {/* =================================================
            PLAYLIST GRID
        ================================================= */}

        {!loading &&
          !error &&
          playlists.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {playlists.map((playlist) => {

                const firstSong =
                  playlist.songs?.[0];

                const artwork =
                  firstSong?.artwork || "";

                return (
                  <Link
                    key={playlist._id}
                    to={`/playlists/${playlist._id}`}
                    className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                  >

                    {/* ARTWORK */}

                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">

                      {artwork ? (
                        <img
                          src={artwork}
                          alt={playlist.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <HiMusicalNote className="text-6xl text-violet-400/70" />
                        </div>
                      )}

                      {/* PLAY */}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-xl">
                          <HiPlay className="ml-0.5 text-xl" />
                        </div>

                      </div>

                    </div>

                    {/* INFO */}

                    <div className="mt-4">

                      <h2
                        className="truncate text-lg font-bold"
                        title={playlist.name}
                      >
                        {playlist.name}
                      </h2>

                      {playlist.description && (
                        <p
                          className="mt-1 truncate text-sm text-[var(--text-secondary)]"
                          title={playlist.description}
                        >
                          {playlist.description}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        {playlist.songs?.length || 0}{" "}
                        {playlist.songs?.length === 1
                          ? "song"
                          : "songs"}
                      </p>

                    </div>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={(event) =>
                        handleDeletePlaylist(
                          event,
                          playlist._id
                        )
                      }
                      disabled={
                        deleting === playlist._id
                      }
                      className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-red-500"
                      title="Delete playlist"
                    >
                      <HiTrash className="text-sm" />
                    </button>

                  </Link>
                );
              })}

            </div>
          )}

      </section>

      {/* =================================================
          CREATE PLAYLIST MODAL
      ================================================= */}

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={() =>
            !creating && setShowCreate(false)
          }
        >

          <div
            className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mb-6">

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                New collection
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Create Playlist
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Give your playlist a name and start
                building your collection.
              </p>

            </div>

            <form
              onSubmit={handleCreatePlaylist}
              className="space-y-4"
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
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500"
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
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  disabled={creating}
                  className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--card)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating || !name.trim()
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