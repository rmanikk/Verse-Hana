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
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

const API_URL = "http://localhost:5000";

const moods = {
  happy: {
    name: "Happy",
    emoji: "😊",
    description: "Bright & uplifting",
  },
  calm: {
    name: "Calm",
    emoji: "😌",
    description: "Peaceful & relaxed",
  },
  rain: {
    name: "Rain",
    emoji: "🌧️",
    description: "Cozy & reflective",
  },
  night: {
    name: "Night",
    emoji: "🌙",
    description: "Late-night vibes",
  },
  love: {
    name: "Love",
    emoji: "❤️",
    description: "Warm & emotional",
  },
  focus: {
    name: "Focus",
    emoji: "💪",
    description: "Locked in",
  },
  party: {
    name: "Party",
    emoji: "🎉",
    description: "Let's have fun",
  },
  sad: {
    name: "Sad",
    emoji: "😢",
    description: "Feel it all",
  },
};

function UserDashboard() {
  const { user, logout } = useAuth();

  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [tracks, setTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [trackError, setTrackError] = useState("");

  const [likedSongs, setLikedSongs] = useState([]);
  const [likingSong, setLikingSong] = useState(null);

  // Recently played
  const [recentSongs, setRecentSongs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const currentMood = useMemo(() => {
    const savedMood = localStorage.getItem("versehana_mood");

    return moods[savedMood] || moods.calm;
  }, []);

  // =====================================================
  // FETCH MUSIC FOR CURRENT MOOD
  // =====================================================

  useEffect(() => {
    const fetchMoodTracks = async () => {
      try {
        setLoadingTracks(true);
        setTrackError("");

        const savedMood =
          localStorage.getItem("versehana_mood") || "calm";

        const response = await fetch(
          `${API_URL}/api/music/mood/${savedMood}?limit=10`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch music."
          );
        }

        setTracks(data.tracks || []);
      } catch (error) {
        console.error("Mood music error:", error);

        setTrackError(
          "We couldn't load your music right now."
        );
      } finally {
        setLoadingTracks(false);
      }
    };

    fetchMoodTracks();
  }, []);

  // =====================================================
  // FETCH RECENTLY PLAYED
  // =====================================================

  const fetchRecentSongs = async () => {
    try {
      setLoadingHistory(true);
      setHistoryError("");

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
          data.message || "Failed to fetch history."
        );
      }

      setRecentSongs(
        data.history ||
        data.histories ||
        data.recentSongs ||
        []
      );
    } catch (error) {
      console.error("History error:", error);

      setHistoryError(
        "We couldn't load your recently played songs."
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRecentSongs();
  }, []);

  // =====================================================
  // CHECK IF SONG IS LIKED
  // =====================================================

  const isLiked = (songId) => {
    return likedSongs.some(
      (id) => String(id) === String(songId)
    );
  };

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleLike = async (track) => {
    if (!track || likingSong === track.id) {
      return;
    }

    const alreadyLiked = isLiked(track.id);

    try {
      setLikingSong(track.id);

      const method = alreadyLiked ? "DELETE" : "POST";

      const response = await fetch(
        `${API_URL}/api/likes/${track.id}`,
        {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body:
            method === "POST"
              ? JSON.stringify({
                  title: track.title,
                  artist:
                    track.user?.name || "Unknown artist",
                  artwork:
                    track.artwork?.["480x480"] ||
                    track.artwork?.["150x150"] ||
                    track.artwork?.["1000x1000"] ||
                    "",
                })
              : undefined,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update like."
        );
      }

      if (!alreadyLiked) {
        setLikedSongs((previous) => [
          ...previous,
          track.id,
        ]);
      } else {
        setLikedSongs((previous) =>
          previous.filter(
            (id) =>
              String(id) !== String(track.id)
          )
        );
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLikingSong(null);
    }
  };

  // =====================================================
  // CONVERT HISTORY SONG
  // =====================================================

  const convertHistorySong = (song) => {
    return {
      id: song.songId || song.id,
      title: song.title,
      artwork: song.artwork
        ? {
            "480x480": song.artwork,
          }
        : null,
      user: {
        name:
          song.artist ||
          song.user?.name ||
          "Unknown artist",
      },
    };
  };

  // =====================================================
  // PLAY HISTORY SONG
  // =====================================================

  const handlePlayHistorySong = (song) => {
    const convertedSong =
      convertHistorySong(song);

    const queue = recentSongs.map(
      convertHistorySong
    );

    playSong(convertedSong, queue);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 lg:flex lg:flex-col">

          {/* Logo */}

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

          {/* Navigation */}

          <nav className="flex-1 space-y-2 p-4">

            <Link
              to="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400"
            >
              <HiHome className="text-lg" />
              Home
            </Link>

            <DashboardLink
              icon={<HiMagnifyingGlass />}
              label="Discover"
            />

            <DashboardLink
              icon={<HiMusicalNote />}
              label="Moods"
            />

            <Link
              to="/liked-songs"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiHeart className="text-lg" />
              Liked Songs
            </Link>

            <DashboardLink
              icon={<HiQueueList />}
              label="Playlists"
            />

           <Link
  to="/recently-played"
  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
>
  <HiClock className="text-lg" />
  Recently Played
</Link>

          </nav>

          {/* User */}

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

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* Top Bar */}

          <header className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">

            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Welcome back,
              </p>

              <h1 className="text-lg font-bold sm:text-xl">
                {user?.name || "Music lover"} 👋
              </h1>
            </div>

            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            >
              {user?.name?.charAt(0)?.toUpperCase() ||
                "U"}
            </Link>

          </header>

          {/* Dashboard */}

          <div className="mx-auto max-w-[1500px] space-y-10 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* =====================================================
                MOOD HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/15 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

              <div className="relative z-10">

                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400">
                    Your vibe
                  </span>

                  <span className="text-2xl">
                    {currentMood.emoji}
                  </span>

                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Music for your{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {currentMood.name.toLowerCase()}
                  </span>{" "}
                  mood.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  {currentMood.description}. We've
                  prepared a space where every song is
                  meant to match how you feel right now.
                </p>

                <Link
                  to="/mood"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                >
                  Change my mood
                  <HiArrowRightOnRectangle className="rotate-180" />
                </Link>

              </div>

            </section>

            {/* =====================================================
                RECOMMENDED
            ===================================================== */}

            <section>

              <div className="mb-5 flex items-end justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                    Curated for you
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Made for your mood
                  </h2>
                </div>

                <span className="hidden text-sm text-[var(--text-muted)] sm:block">
                  {tracks.length} songs
                </span>

              </div>

              {/* Loading */}

              {loadingTracks && (
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

              {/* Error */}

              {!loadingTracks && trackError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                  <p className="text-sm text-red-400">
                    {trackError}
                  </p>
                </div>
              )}

              {/* Songs */}

              {!loadingTracks &&
                !trackError &&
                tracks.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

                    {tracks.map((track) => (
                      <SongCard
                        key={track.id}
                        track={track}
                        tracks={tracks}
                        currentSong={currentSong}
                        isPlaying={isPlaying}
                        playSong={playSong}
                        isLiked={isLiked(track.id)}
                        onLike={handleLike}
                        likingSong={likingSong}
                      />
                    ))}

                  </div>
                )}

              {/* No songs */}

              {!loadingTracks &&
                !trackError &&
                tracks.length === 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 text-center">
                    <HiMusicalNote className="mx-auto text-3xl text-[var(--text-muted)]" />

                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      We couldn't find songs for this mood yet.
                    </p>
                  </div>
                )}

            </section>

            {/* =====================================================
                RECENTLY PLAYED
            ===================================================== */}

            <section>

              <div className="mb-5 flex items-end justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                    Your history
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Recently played
                  </h2>
                </div>

                {recentSongs.length > 0 && (
                  <span className="text-sm text-[var(--text-muted)]">
                    {recentSongs.length} songs
                  </span>
                )}

              </div>

              {/* Loading History */}

              {loadingHistory && (
                <div className="space-y-3">

                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3"
                    >
                      <div className="h-14 w-14 animate-pulse rounded-xl bg-[var(--card)]" />

                      <div className="flex-1">
                        <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--card)]" />

                        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[var(--card)]" />
                      </div>
                    </div>
                  ))}

                </div>
              )}

              {/* History Error */}

              {!loadingHistory && historyError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                  <HiClock className="mx-auto text-3xl text-red-400" />

                  <p className="mt-3 text-sm text-red-400">
                    {historyError}
                  </p>

                  <button
                    type="button"
                    onClick={fetchRecentSongs}
                    className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Empty History */}

              {!loadingHistory &&
                !historyError &&
                recentSongs.length === 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 text-center">

                    <HiClock className="mx-auto text-3xl text-[var(--text-muted)]" />

                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      Your recently played songs will
                      appear here.
                    </p>

                  </div>
                )}

              {/* History Songs */}

              {!loadingHistory &&
                !historyError &&
                recentSongs.length > 0 && (
                  <div className="space-y-3">

                    {recentSongs.slice(0, 5).map(
                      (song, index) => {

                        const songId =
                          song.songId || song.id;

                        const isCurrent =
                          String(currentSong?.id) ===
                          String(songId);

                        const artwork =
                          song.artwork || "";

                        return (
                          <div
                            key={
                              song._id ||
                              `${songId}-${index}`
                            }
                            className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 transition hover:border-violet-500/30 hover:bg-violet-500/5"
                          >

                            {/* Number */}

                            <div className="hidden w-6 text-center text-sm text-[var(--text-muted)] sm:block">
                              {index + 1}
                            </div>

                            {/* Artwork */}

                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">

                              {artwork ? (
                                <img
                                  src={artwork}
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
                                  handlePlayHistorySong(
                                    song
                                  )
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                              >
                                {isCurrent &&
                                isPlaying ? (
                                  <HiPause className="text-xl text-white" />
                                ) : (
                                  <HiPlay className="ml-0.5 text-xl text-white" />
                                )}
                              </button>

                            </div>

                            {/* Song Info */}

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
                                {song.artist ||
                                  song.user?.name ||
                                  "Unknown artist"}
                              </p>

                            </div>

                            {/* Play */}

                            <button
                              type="button"
                              onClick={() =>
                                handlePlayHistorySong(
                                  song
                                )
                              }
                              className="hidden h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400 sm:flex"
                            >
                              {isCurrent &&
                              isPlaying ? (
                                <HiPause className="text-lg" />
                              ) : (
                                <HiPlay className="text-lg" />
                              )}
                            </button>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

            </section>

          </div>

        </section>

      </div>
    </main>
  );
}

/* =====================================================
   DASHBOARD LINK
===================================================== */

function DashboardLink({
  icon,
  label,
  active = false,
}) {
  return (
    <button
      type="button"
      className={`
        flex w-full items-center gap-3 rounded-xl
        px-3 py-3 text-sm font-medium transition
        ${
          active
            ? "bg-violet-500/10 text-violet-400"
            : "text-[var(--text-secondary)] hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
        }
      `}
    >
      <span className="text-lg">
        {icon}
      </span>

      {label}
    </button>
  );
}

/* =====================================================
   SONG CARD
===================================================== */

function SongCard({
  track,
  tracks,
  currentSong,
  isPlaying,
  playSong,
  isLiked,
  onLike,
  likingSong,
}) {
  const isCurrentSong =
    currentSong?.id === track.id;

  const artwork =
    track.artwork?.["480x480"] ||
    track.artwork?.["150x150"] ||
    track.artwork?.["1000x1000"];

  const handlePlay = () => {
    playSong(track, tracks);
  };

  const handleLike = (event) => {
    event.stopPropagation();
    onLike(track);
  };

  return (
    <div className="group">

      {/* Artwork */}

      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

        {artwork ? (
          <img
            src={artwork}
            alt={track.title}
            className={`
              h-full w-full object-cover
              transition duration-500
              ${
                isCurrentSong
                  ? "scale-105"
                  : "group-hover:scale-105"
              }
            `}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <HiMusicalNote className="text-5xl text-violet-400" />
          </div>
        )}

        {/* Overlay */}

        <div
          className={`
            absolute inset-0 bg-black/30 transition
            ${
              isCurrentSong
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }
          `}
        />

        {/* Like Button */}

        <button
          type="button"
          onClick={handleLike}
          disabled={likingSong === track.id}
          className={`
            absolute left-3 top-3
            flex h-10 w-10 items-center justify-center
            rounded-full backdrop-blur-md
            transition-all duration-200
            ${
              isLiked
                ? "bg-violet-600 text-white opacity-100"
                : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-violet-600"
            }
            ${
              likingSong === track.id
                ? "cursor-wait opacity-70"
                : ""
            }
          `}
          aria-label={
            isLiked
              ? "Unlike song"
              : "Like song"
          }
        >
          <HiHeart
            className={`
              text-lg transition-transform
              ${
                isLiked
                  ? "scale-110 fill-current"
                  : ""
              }
            `}
          />
        </button>

        {/* Play Button */}

        <button
          type="button"
          onClick={handlePlay}
          className={`
            absolute bottom-3 right-3
            flex h-11 w-11 items-center justify-center
            rounded-full bg-violet-600 text-white
            shadow-lg shadow-violet-500/30
            transition-all duration-300
            hover:scale-105
            ${
              isCurrentSong
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            }
          `}
          aria-label={
            isCurrentSong && isPlaying
              ? "Pause"
              : "Play"
          }
        >
          {isCurrentSong && isPlaying ? (
            <HiPause className="text-lg" />
          ) : (
            <HiPlay className="ml-0.5 text-lg" />
          )}
        </button>

        {/* Playing Indicator */}

        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

            <span className="text-[10px] font-medium text-white">
              Playing
            </span>
          </div>
        )}

      </div>

      {/* Track Information */}

      <h3
        className="mt-3 truncate text-sm font-semibold"
        title={track.title}
      >
        {track.title}
      </h3>

      <p
        className="mt-1 truncate text-xs text-[var(--text-muted)]"
        title={track.user?.name}
      >
        {track.user?.name || "Unknown artist"}
      </p>

    </div>
  );
}

export default UserDashboard;