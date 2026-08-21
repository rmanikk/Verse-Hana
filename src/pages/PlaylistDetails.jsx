import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiPlay,
  HiPause,
  HiTrash,
  HiMusicalNote,
  HiHeart,
} from "react-icons/hi2";

import { usePlayer } from "../context/PlayerContext";

const API_URL = "http://localhost:5000";

function PlaylistDetails() {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const { currentSong, isPlaying, playSong } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingSong, setRemovingSong] = useState(null);

  // =====================================================
  // LIKED SONGS
  // =====================================================

  const [likedSongs, setLikedSongs] = useState(new Set());
  const [likingSong, setLikingSong] = useState(null);

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
  // LIKE / UNLIKE SONG
  // =====================================================

  const handleLike = async (songId) => {
    if (!songId || likingSong === songId) {
      return;
    }

    const songKey = String(songId);
    const isLiked = likedSongs.has(songKey);

    try {
      setLikingSong(songId);

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
          updated.delete(songKey);
        } else {
          updated.add(songKey);
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
        <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

          <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--card)]" />

          <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr]">

            <div className="aspect-square animate-pulse rounded-3xl bg-[var(--card)]" />

            <div className="flex flex-col justify-end">

              <div className="h-4 w-24 animate-pulse rounded bg-[var(--card)]" />

              <div className="mt-4 h-12 w-2/3 animate-pulse rounded bg-[var(--card)]" />

              <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-[var(--card)]" />

              <div className="mt-7 h-12 w-32 animate-pulse rounded-xl bg-[var(--card)]" />

            </div>

          </div>
        </section>
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
      </main>
    );
  }

  const songs = playlist.songs || [];

  const artwork = songs[0]?.artwork || "";

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-[1500px] items-center px-5 sm:px-8 lg:px-10">

          <Link
            to="/playlists"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
          >
            <HiArrowLeft className="text-xl" />
          </Link>

          <div className="ml-4">

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400">
              Your collection
            </p>

            <p className="mt-0.5 text-sm font-semibold">
              {playlist.name}
            </p>

          </div>

        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        {/* =================================================
            PLAYLIST HERO
        ================================================= */}

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

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            </div>

            {/* INFO */}

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
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

        {/* =================================================
            TRACKLIST
        ================================================= */}

        <section className="mt-10">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                Tracklist
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Songs
              </h2>

            </div>

            {songs.length > 0 && (
              <p className="text-xs text-[var(--text-muted)]">
                {songs.length} tracks
              </p>
            )}

          </div>

          {/* EMPTY */}

          {songs.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/60 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                <HiMusicalNote className="text-3xl text-violet-400" />
              </div>

              <h3 className="mt-5 text-xl font-bold">
                This playlist is empty
              </h3>

              <p className="mt-2 max-w-md px-5 text-sm leading-6 text-[var(--text-secondary)]">
                Add songs from your music discovery
                section to start building this playlist.
              </p>

              <Link
                to="/discover"
                className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
              >
                Discover Music
              </Link>

            </div>
          )}

          {/* SONG LIST */}

          {songs.length > 0 && (
            <div className="space-y-2">

              {songs.map((song, index) => {

                const songId = String(song.songId);

                const isCurrent =
                  String(currentSong?.id) === songId;

                const isSongPlaying =
                  isCurrent && isPlaying;

                const isLiked =
                  likedSongs.has(songId);

                const isLiking =
                  likingSong === song.songId;

                return (
                  <div
                    key={`${song.songId}-${index}`}
                    className={`
                      group relative flex items-center gap-3
                      rounded-2xl border p-3
                      transition-all duration-300
                      sm:gap-4
                      ${
                        isCurrent
                          ? "border-violet-500/30 bg-violet-500/10 shadow-lg shadow-violet-950/10"
                          : "border-[var(--border)] bg-[var(--surface)]/60 hover:border-violet-500/25 hover:bg-violet-500/5"
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
                          absolute inset-0 flex items-center
                          justify-center bg-black/55
                          transition
                          ${
                            isSongPlaying
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }
                        `}
                        aria-label={
                          isSongPlaying
                            ? "Pause"
                            : "Play"
                        }
                      >
                        {isSongPlaying ? (
                          <HiPause className="text-xl text-white" />
                        ) : (
                          <HiPlay className="ml-0.5 text-xl text-white" />
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
                        className={`
                          truncate text-sm font-semibold
                          sm:text-[15px]
                          ${
                            isCurrent
                              ? "text-violet-400"
                              : "text-[var(--text-primary)]"
                          }
                        `}
                      >
                        {song.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
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

                    {/* LIKE */}

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
                        rounded-full transition-all
                        ${
                          isLiked
                            ? "bg-violet-500/10 text-violet-400"
                            : "text-[var(--text-muted)] hover:bg-violet-500/10 hover:text-violet-400"
                        }
                        ${
                          isLiking
                            ? "cursor-wait opacity-50"
                            : ""
                        }
                      `}
                    >
                      <HiHeart
                        className={`
                          text-xl transition-transform duration-200
                          ${
                            isLiked
                              ? "scale-110"
                              : "scale-100"
                          }
                        `}
                      />
                    </button>

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
                      aria-label="Remove from playlist"
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