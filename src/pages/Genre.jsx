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

const SONGS_PER_PAGE = 8;

const genres = [
  {
    id: "electronic",
    name: "Electronic",
    emoji: "🎛️",
    description: "Electronic, EDM and energetic sounds",
  },
  {
    id: "hiphop",
    name: "Hip Hop",
    emoji: "🎤",
    description: "Rap, beats and hip hop culture",
  },
  {
    id: "pop",
    name: "Pop",
    emoji: "🎵",
    description: "Catchy songs and modern pop",
  },
  {
    id: "rock",
    name: "Rock",
    emoji: "🎸",
    description: "Guitars, drums and powerful energy",
  },
  {
    id: "rnb",
    name: "R&B",
    emoji: "🎙️",
    description: "Smooth vocals and soulful sounds",
  },
  {
    id: "jazz",
    name: "Jazz",
    emoji: "🎷",
    description: "Smooth, classic and expressive",
  },
  {
    id: "classical",
    name: "Classical",
    emoji: "🎻",
    description: "Orchestral and timeless compositions",
  },
  {
    id: "lofi",
    name: "Lo-Fi",
    emoji: "🌙",
    description: "Relaxed beats for studying and chilling",
  },
  {
    id: "metal",
    name: "Metal",
    emoji: "🤘",
    description: "Heavy riffs and intense sounds",
  },
  {
    id: "indie",
    name: "Indie",
    emoji: "🎧",
    description: "Independent and alternative sounds",
  },
];

function Genre() {
  const { user, logout } = useAuth();

  const { currentSong, isPlaying, playSong } = usePlayer();

  const [selectedGenre, setSelectedGenre] = useState("");
  const [tracks, setTracks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    tracks.length / SONGS_PER_PAGE
  );

  const paginatedTracks = useMemo(() => {
    const startIndex =
      (currentPage - 1) * SONGS_PER_PAGE;

    return tracks.slice(
      startIndex,
      startIndex + SONGS_PER_PAGE
    );
  }, [tracks, currentPage]);

  // =====================================================
  // LIKES
  // =====================================================

  const [likedSongs, setLikedSongs] = useState(
    new Set()
  );

  // =====================================================
  // PLAYLISTS
  // =====================================================

  const [playlists, setPlaylists] = useState([]);

  const [playlistModalOpen, setPlaylistModalOpen] =
    useState(false);

  const [selectedTrack, setSelectedTrack] =
    useState(null);

  const [playlistLoading, setPlaylistLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

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
    } catch (error) {
      console.error(
        "Fetch liked songs error:",
        error
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
    } catch (error) {
      console.error(
        "Fetch playlists error:",
        error
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
  // FETCH GENRE MUSIC
  // =====================================================

  const fetchGenreMusic = async (genre) => {
    try {
      setSelectedGenre(genre);
      setCurrentPage(1);
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/music/genre/${genre}?limit=40`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch genre music."
        );
      }

      setTracks(data.tracks || []);
    } catch (error) {
      console.error(
        "Genre music error:",
        error
      );

      setTracks([]);

      setError(
        error.message ||
          "We couldn't load this genre right now."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PLAY
  // =====================================================

  const handlePlay = (track) => {
    playSong(track, tracks);
  };

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleLike = async (track) => {
    const songId = String(track.id);

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
        const artwork =
          track.artwork?.["480x480"] ||
          track.artwork?.["150x150"] ||
          track.artwork?.["1000x1000"] ||
          "";

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
              title: track.title,
              artist:
                track.user?.name ||
                track.artist ||
                "Unknown artist",
              artwork,
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
    } catch (error) {
      console.error(
        "Like/unlike error:",
        error
      );

      setActionMessage(
        error.message ||
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

  const openPlaylistModal = (track) => {
    setSelectedTrack(track);
    setPlaylistModalOpen(true);
    setActionMessage("");

    fetchPlaylists();
  };

  // =====================================================
  // ADD SONG TO PLAYLIST
  // =====================================================

  const addToPlaylist = async (playlistId) => {
    if (!selectedTrack) return;

    try {
      setPlaylistLoading(true);
      setActionMessage("");

      const artwork =
        selectedTrack.artwork?.["480x480"] ||
        selectedTrack.artwork?.["150x150"] ||
        selectedTrack.artwork?.["1000x1000"] ||
        "";

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
            songId: selectedTrack.id,
            title: selectedTrack.title,
            artist:
              selectedTrack.user?.name ||
              selectedTrack.artist ||
              "Unknown artist",
            artwork,
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

      setTimeout(() => {
        setPlaylistModalOpen(false);
        setSelectedTrack(null);
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
      top: 700,
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

    if (currentPage >= totalPages - 2) {
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
  // SELECTED GENRE
  // =====================================================

  const selectedGenreData = genres.find(
    (genre) => genre.id === selectedGenre
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

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

            <div className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400">
              <HiMusicalNote className="text-lg" />
              Genres
            </div>

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

          <header className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">

            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Explore music by style
              </p>

              <h1 className="text-lg font-bold sm:text-xl">
                Genres
              </h1>
            </div>

            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </Link>

          </header>

          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

              <div className="relative z-10">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Explore your sound
                </p>

                <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Find music by{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    genre.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  From electronic beats to classical
                  compositions, discover music based on
                  the sound you love.
                </p>

              </div>

            </section>

            {/* =====================================================
                GENRES
            ===================================================== */}

            <section className="mt-10">

              <div className="mb-5">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Browse
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Explore genres
                </h2>

              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

                {genres.map((genre) => (

                  <button
                    key={genre.id}
                    type="button"
                    onClick={() =>
                      fetchGenreMusic(genre.id)
                    }
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-300 hover:-translate-y-1 ${
                      selectedGenre === genre.id
                        ? "border-violet-500/50 bg-violet-500/15"
                        : "border-[var(--border)] bg-[var(--surface)]/60 hover:border-violet-500/30 hover:bg-violet-500/5"
                    }`}
                  >

                    <div className="text-3xl">
                      {genre.emoji}
                    </div>

                    <h3 className="mt-4 text-sm font-bold">
                      {genre.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
                      {genre.description}
                    </p>

                  </button>

                ))}

              </div>

            </section>

            {/* =====================================================
                MUSIC RESULTS
            ===================================================== */}

            {selectedGenre && (

              <section className="mt-12">

                <div className="mb-5 flex items-end justify-between">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                      Genre selection
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {selectedGenreData?.emoji}{" "}
                      {selectedGenreData?.name}
                    </h2>

                  </div>

                  {!loading &&
                    tracks.length > 0 && (

                      <span className="text-sm text-[var(--text-muted)]">
                        {tracks.length} songs
                      </span>

                    )}

                </div>

                {/* LOADING */}

                {loading && (

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                      (item) => (

                        <div
                          key={item}
                          className="animate-pulse"
                        >

                          <div className="aspect-square rounded-2xl bg-[var(--card)]" />

                          <div className="mt-3 h-4 w-3/4 rounded bg-[var(--card)]" />

                          <div className="mt-2 h-3 w-1/2 rounded bg-[var(--card)]" />

                        </div>

                      )
                    )}

                  </div>

                )}

                {/* ERROR */}

                {!loading && error && (

                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

                    <HiMusicalNote className="mx-auto text-4xl text-red-400" />

                    <p className="mt-3 text-sm text-red-400">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        fetchGenreMusic(
                          selectedGenre
                        )
                      }
                      className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Try again
                    </button>

                  </div>

                )}

                {/* EMPTY */}

                {!loading &&
                  !error &&
                  tracks.length === 0 && (

                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 text-center">

                      <HiMusicalNote className="text-5xl text-[var(--text-muted)]" />

                      <h3 className="mt-4 text-xl font-semibold">
                        No music found
                      </h3>

                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Try selecting another genre.
                      </p>

                    </div>

                  )}

                {/* TRACKS */}

                {!loading &&
                  !error &&
                  tracks.length > 0 && (

                    <>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                        {paginatedTracks.map(
                          (track) => (

                            <GenreCard
                              key={track.id}
                              track={track}
                              tracks={tracks}
                              currentSong={currentSong}
                              isPlaying={isPlaying}
                              onPlay={handlePlay}
                              likedSongs={likedSongs}
                              onLike={handleLike}
                              onAddToPlaylist={
                                openPlaylistModal
                              }
                            />

                          )
                        )}

                      </div>

                      {/* PAGINATION */}

                      {totalPages > 1 && (

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">

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
                            tracks.length
                          )}{" "}
                          of {tracks.length} songs
                        </p>

                      )}

                    </>

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
              setSelectedTrack(null);
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
                  setSelectedTrack(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white"
              >
                <HiXMark className="text-xl" />
              </button>

            </div>

            {/* SELECTED SONG */}

            {selectedTrack && (

              <div className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-4">

                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">

                  {selectedTrack.artwork?.[
                    "150x150"
                  ] ? (

                    <img
                      src={
                        selectedTrack.artwork[
                          "150x150"
                        ]
                      }
                      alt={selectedTrack.title}
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
                    {selectedTrack.title}
                  </p>

                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {selectedTrack.user?.name ||
                      selectedTrack.artist ||
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

// =====================================================
// GENRE CARD
// =====================================================

function GenreCard({
  track,
  tracks,
  currentSong,
  isPlaying,
  onPlay,
  likedSongs,
  onLike,
  onAddToPlaylist,
}) {
  const isCurrent =
    String(currentSong?.id) ===
    String(track.id);

  const isLiked = likedSongs.has(
    String(track.id)
  );

  const artwork =
    track.artwork?.["480x480"] ||
    track.artwork?.["150x150"] ||
    track.artwork?.["1000x1000"];

  return (
    <div className="group min-w-0">

      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

        {/* ARTWORK */}

        {artwork ? (

          <img
            src={artwork}
            alt={track.title}
            className={`h-full w-full object-cover transition duration-500 ${
              isCurrent
                ? "scale-105"
                : "group-hover:scale-105"
            }`}
          />

        ) : (

          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <HiMusicalNote className="text-5xl text-violet-400" />
          </div>

        )}

        {/* OVERLAY */}

        <div
          className={`absolute inset-0 bg-black/40 transition ${
            isCurrent
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* =====================================================
            LIKE BUTTON — TOP LEFT
        ===================================================== */}

        <button
          type="button"
          onClick={() => onLike(track)}
          className={`absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isLiked
              ? "bg-violet-600 text-white opacity-100 shadow-lg shadow-violet-500/30"
              : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-violet-600"
          }`}
          aria-label={
            isLiked
              ? "Unlike song"
              : "Like song"
          }
        >
          <HiHeart
            className={`text-lg ${
              isLiked
                ? "fill-current"
                : ""
            }`}
          />
        </button>

        {/* =====================================================
            ADD TO PLAYLIST — TOP LEFT
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            onAddToPlaylist(track)
          }
          className="absolute left-14 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:bg-violet-600"
          aria-label="Add to playlist"
        >
          <HiPlus className="text-lg" />
        </button>

        {/* =====================================================
            PLAY BUTTON — BOTTOM RIGHT
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            onPlay(track, tracks)
          }
          className={`absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105 ${
            isCurrent
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
          aria-label={
            isCurrent && isPlaying
              ? "Pause"
              : "Play"
          }
        >
          {isCurrent && isPlaying ? (
            <HiPause className="text-lg" />
          ) : (
            <HiPlay className="ml-0.5 text-lg" />
          )}
        </button>

      </div>

      {/* TITLE */}

      <h3
        className="mt-3 truncate text-sm font-semibold"
        title={track.title}
      >
        {track.title}
      </h3>

      {/* ARTIST */}

      <p
        className="mt-1 truncate text-xs text-[var(--text-muted)]"
        title={
          track.user?.name ||
          track.artist
        }
      >
        {track.user?.name ||
          track.artist ||
          "Unknown artist"}
      </p>

    </div>
  );
}

export default Genre;