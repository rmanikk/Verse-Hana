import { useEffect, useState } from "react";
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
  HiShieldCheck,
  HiBars3,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import MoodSelection from "./MoodSelection";

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

  // =====================================================
  // MOBILE SIDEBAR
  // =====================================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =====================================================
  // LIKED SONGS
  // =====================================================

  const [likedSongs, setLikedSongs] = useState([]);
  const [likingSong, setLikingSong] = useState(null);

  // =====================================================
  // RECENTLY PLAYED
  // =====================================================

  const [recentSongs, setRecentSongs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  // =====================================================
  // PLAYLISTS
  // =====================================================

  const [playlists, setPlaylists] = useState([]);
  const [playlistModalSong, setPlaylistModalSong] = useState(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);

  // =====================================================
  // CURRENT MOOD
  // =====================================================

  const [selectedMood, setSelectedMood] = useState(() => {
    return localStorage.getItem("versehana_mood") || "calm";
  });

  const currentMood =
    moods[selectedMood] || moods.calm;

  // =====================================================
  // MOOD SELECTION MODAL
  // =====================================================

  const [showMoodSelection, setShowMoodSelection] =
    useState(false);

  // =====================================================
  // FETCH MUSIC FOR CURRENT MOOD
  // =====================================================

  useEffect(() => {
    const fetchMoodTracks = async () => {
      try {
        setLoadingTracks(true);
        setTrackError("");

        const response = await fetch(
          `${API_URL}/api/music/mood/${selectedMood}?limit=10`,
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
  }, [selectedMood]);

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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch liked songs."
        );
      }

      const ids = (data.likes || []).map(
        (song) => song.songId
      );

      setLikedSongs(ids);
    } catch (error) {
      console.error(
        "Fetch liked songs error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchLikedSongs();
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
  // NORMALIZE SONG
  // =====================================================

  const normalizeSong = (song) => {
    return {
      id: song.id || song.songId,
      title: song.title,
      artwork:
        typeof song.artwork === "string"
          ? {
              "480x480": song.artwork,
            }
          : song.artwork || null,
      user: {
        name:
          song.user?.name ||
          song.artist ||
          "Unknown artist",
      },
    };
  };

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleLike = async (track) => {
    if (!track) {
      return;
    }

    const song = normalizeSong(track);
    const songId = song.id;

    if (!songId || likingSong === songId) {
      return;
    }

    const alreadyLiked = isLiked(songId);

    try {
      setLikingSong(songId);

      const method = alreadyLiked
        ? "DELETE"
        : "POST";

      const response = await fetch(
        `${API_URL}/api/likes/${songId}`,
        {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body:
            method === "POST"
              ? JSON.stringify({
                  title: song.title,
                  artist:
                    song.user?.name ||
                    "Unknown artist",
                  artwork:
                    song.artwork?.["480x480"] ||
                    song.artwork?.["150x150"] ||
                    song.artwork?.["1000x1000"] ||
                    "",
                })
              : undefined,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update like."
        );
      }

      if (alreadyLiked) {
        setLikedSongs((previous) =>
          previous.filter(
            (id) =>
              String(id) !== String(songId)
          )
        );
      } else {
        setLikedSongs((previous) => [
          ...previous,
          songId,
        ]);
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLikingSong(null);
    }
  };

  // =====================================================
  // FETCH PLAYLISTS
  // =====================================================

  const fetchPlaylists = async () => {
    try {
      setLoadingPlaylists(true);

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
          data.message ||
            "Failed to fetch playlists."
        );
      }

      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error(
        "Fetch playlists error:",
        error
      );

      alert(
        error.message ||
          "Failed to load playlists."
      );
    } finally {
      setLoadingPlaylists(false);
    }
  };

  // =====================================================
  // ADD SONG TO PLAYLIST
  // =====================================================

  const handleAddToPlaylist = async (
    playlist,
    song
  ) => {
    const normalizedSong =
      normalizeSong(song);

    try {
      setAddingToPlaylist(playlist._id);

      const response = await fetch(
        `${API_URL}/api/playlists/${playlist._id}/songs`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            songId: normalizedSong.id,
            title: normalizedSong.title,
            artist:
              normalizedSong.user?.name ||
              "Unknown artist",
            artwork:
              normalizedSong.artwork?.["480x480"] ||
              normalizedSong.artwork?.["150x150"] ||
              normalizedSong.artwork?.["1000x1000"] ||
              "",
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

      setPlaylists((previous) =>
        previous.map((item) =>
          item._id === playlist._id
            ? data.playlist
            : item
        )
      );

      alert(
        `"${normalizedSong.title}" added to ${playlist.name}`
      );

      setPlaylistModalSong(null);
    } catch (error) {
      console.error(
        "Add song to playlist error:",
        error
      );

      alert(
        error.message ||
          "Failed to add song to playlist."
      );
    } finally {
      setAddingToPlaylist(null);
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

  // =====================================================
  // MOOD CHANGE
  // =====================================================

  const handleMoodChange = (newMood) => {
    if (!newMood) return;

    localStorage.setItem(
      "versehana_mood",
      newMood
    );

    setSelectedMood(newMood);

    setShowMoodSelection(false);
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigationItems = [
    {
      to: "/dashboard",
      label: "Home",
      icon: HiHome,
    },
    {
      to: "/discover",
      label: "Discover",
      icon: HiMagnifyingGlass,
    },
    {
      to: "/genres",
      label: "Genres",
      icon: HiMusicalNote,
    },
    {
      to: "/liked-songs",
      label: "Liked Songs",
      icon: HiHeart,
    },
    {
      to: "/playlists",
      label: "Playlists",
      icon: HiQueueList,
    },
    {
      to: "/recently-played",
      label: "Recently Played",
      icon: HiClock,
    },
  ];

  // =====================================================
  // SIDEBAR CONTENT
  // =====================================================

  const SidebarContent = ({
    mobile = false,
  }) => (
    <div className="flex h-full flex-col">

      {/* LOGO */}

      <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] px-5 sm:px-6">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/10">
            <HiMusicalNote className="text-xl" />
          </div>

          <span className="truncate text-xl font-extrabold tracking-tight">
            Verse
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Hana
            </span>
          </span>

        </div>

        {mobile && (
          <button
            type="button"
            onClick={closeMobileMenu}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-white"
            aria-label="Close menu"
          >
            <HiXMark className="text-xl" />
          </button>
        )}

      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">

        {navigationItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.to === "/dashboard";

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={
                mobile
                  ? closeMobileMenu
                  : undefined
              }
              className={`
                group flex w-full items-center gap-3 rounded-xl
                px-3 py-3 text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? "bg-violet-500/10 text-violet-400 shadow-sm shadow-violet-500/5"
                    : "text-[var(--text-secondary)] hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                }
              `}
            >
              <Icon
                className={`
                  shrink-0 text-lg transition-transform duration-200
                  ${
                    active
                      ? ""
                      : "group-hover:scale-105"
                  }
                `}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}

      </nav>

      {/* USER */}

      <div className="shrink-0 border-t border-[var(--border)] p-4">

        <Link
          to="/profile"
          onClick={
            mobile
              ? closeMobileMenu
              : undefined
          }
          className="mb-3 flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
        >

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-500/10">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs text-[var(--text-muted)]">
              {user?.email}
            </p>

          </div>

        </Link>

        {/* ADMIN */}

        {user?.role === "admin" && (
          <Link
            to="/admin"
            onClick={
              mobile
                ? closeMobileMenu
                : undefined
            }
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-violet-400 transition hover:bg-violet-500/10"
          >
            <HiShieldCheck className="text-lg" />
            Admin Panel
          </Link>
        )}

        {/* LOGOUT */}

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-400"
        >
          <HiArrowRightOnRectangle className="text-lg" />
          Logout
        </button>

      </div>

    </div>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">

      <div className="flex min-h-screen">

        {/* =====================================================
            DESKTOP SIDEBAR
        ===================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/70 lg:flex lg:flex-col">
          <SidebarContent />
        </aside>

        {/* =====================================================
            MOBILE DRAWER
        ===================================================== */}

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[70] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >

            {/* OVERLAY */}

            <button
              type="button"
              aria-label="Close navigation"
              onClick={closeMobileMenu}
              className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
            />

            {/* DRAWER */}

            <aside
              className="
                relative z-10 h-full w-[min(82vw,320px)]
                border-r border-[var(--border)]
                bg-[var(--surface)]
                shadow-2xl shadow-black/50
              "
            >
              <SidebarContent mobile />
            </aside>

          </div>
        )}

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* TOP BAR */}

          <header className="sticky top-0 z-40 flex min-h-20 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-10">

            <div className="flex min-w-0 items-center gap-3">

              {/* MOBILE HAMBURGER */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-400 lg:hidden"
                aria-label="Open menu"
              >
                <HiBars3 className="text-xl" />
              </button>

              <div className="min-w-0">

                <p className="hidden text-sm text-[var(--text-secondary)] sm:block">
                  Welcome back,
                </p>

                <h1 className="truncate text-base font-bold sm:text-xl">
                  {user?.name || "Music lover"} 👋
                </h1>

              </div>

            </div>

            {/* PROFILE */}

            <Link
              to="/profile"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/10 transition hover:scale-105"
              aria-label="Profile"
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </Link>

          </header>

          {/* DASHBOARD */}

          <div className="mx-auto w-full max-w-[1500px] space-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

            {/* =====================================================
                MOOD HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-5 shadow-xl shadow-violet-950/5 sm:rounded-[32px] sm:p-8 lg:p-10">

              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/15 blur-[90px] sm:h-64 sm:w-64" />

              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-[90px] sm:h-64 sm:w-64" />

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.08),transparent_35%)]" />

              <div className="relative z-10">

                {/* MOOD */}

                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                    Your vibe
                  </span>

                  <span className="text-sm font-semibold text-[var(--text-muted)]">
                    :
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    <span>{currentMood.emoji}</span>
                    {currentMood.name}
                  </span>

                </div>

                <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                  Music for your{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {currentMood.name.toLowerCase()}
                  </span>{" "}
                  mood.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
                  {currentMood.description}. We've
                  prepared a space where every song is
                  meant to match how you feel right now.
                </p>

                {/* CHANGE MOOD */}

                <button
                  type="button"
                  onClick={() =>
                    setShowMoodSelection(true)
                  }
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] hover:shadow-violet-500/30 sm:mt-7 sm:w-auto"
                >
                  Change my mood
                  <HiArrowRightOnRectangle className="rotate-180" />
                </button>

              </div>

            </section>

            {/* =====================================================
                RECOMMENDED
            ===================================================== */}

            <section>

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div className="min-w-0">

                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                    Curated for you
                  </p>

                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                    Made for your mood
                  </h2>

                </div>

                <Link
                  to="/discover"
                  className="group inline-flex w-fit items-center gap-2 text-xs font-medium text-violet-400 transition hover:text-violet-300 sm:text-sm"
                >
                  <span>
                    View more songs for{" "}
                    {currentMood.name.toLowerCase()}
                  </span>

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

              </div>

              {/* LOADING */}

              {loadingTracks && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 min-[480px]:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

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

              {/* ERROR */}

              {!loadingTracks && trackError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center sm:p-6">
                  <p className="text-sm text-red-400">
                    {trackError}
                  </p>
                </div>
              )}

              {/* TRACKS */}

              {!loadingTracks &&
                !trackError &&
                tracks.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-6 min-[480px]:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

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
                        onOpenPlaylist={(song) => {
                          setPlaylistModalSong(song);
                          fetchPlaylists();
                        }}
                      />
                    ))}

                  </div>
                )}

              {/* EMPTY */}

              {!loadingTracks &&
                !trackError &&
                tracks.length === 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-7 text-center sm:p-8">

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

              <div className="mb-5 flex items-end justify-between gap-4">

                <div className="min-w-0">

                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                    Your history
                  </p>

                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                    Recently played
                  </h2>

                </div>

                {recentSongs.length > 0 && (
                  <Link
                    to="/recently-played"
                    className="shrink-0 text-xs text-violet-400 transition hover:text-violet-300 sm:text-sm"
                  >
                    View all
                  </Link>
                )}

              </div>

              {/* LOADING */}

              {loadingHistory && (
                <div className="space-y-3">

                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 sm:gap-4"
                    >

                      <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-[var(--card)] sm:h-14 sm:w-14" />

                      <div className="min-w-0 flex-1">

                        <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--card)]" />

                        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[var(--card)]" />

                      </div>

                    </div>
                  ))}

                </div>
              )}

              {/* ERROR */}

              {!loadingHistory && historyError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center sm:p-6">

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

              {/* EMPTY */}

              {!loadingHistory &&
                !historyError &&
                recentSongs.length === 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-7 text-center sm:p-8">

                    <HiClock className="mx-auto text-3xl text-[var(--text-muted)]" />

                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      Your recently played songs will
                      appear here.
                    </p>

                  </div>
                )}

              {/* HISTORY */}

              {!loadingHistory &&
                !historyError &&
                recentSongs.length > 0 && (
                  <div className="space-y-2.5 sm:space-y-3">

                    {recentSongs.slice(0, 5).map(
                      (song, index) => {

                        const songId =
                          song.songId || song.id;

                        const isCurrent =
                          String(currentSong?.id) ===
                          String(songId);

                        const artwork =
                          song.artwork || "";

                        const songIsLiked =
                          isLiked(songId);

                        const isLiking =
                          likingSong === songId;

                        return (
                          <div
                            key={
                              song._id ||
                              `${songId}-${index}`
                            }
                            className={`
                              group flex min-w-0 items-center gap-2.5
                              rounded-2xl border
                              bg-[var(--surface)]/60 p-2.5
                              transition
                              sm:gap-4 sm:p-3
                              ${
                                isCurrent
                                  ? "border-violet-500/30 bg-violet-500/5"
                                  : "border-[var(--border)] hover:border-violet-500/30 hover:bg-violet-500/5"
                              }
                            `}
                          >

                            {/* INDEX */}

                            <div className="hidden w-6 shrink-0 text-center text-sm text-[var(--text-muted)] sm:block">

                              {isCurrent && isPlaying ? (
                                <span className="text-violet-400">
                                  ♪
                                </span>
                              ) : (
                                index + 1
                              )}

                            </div>

                            {/* ARTWORK */}

                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--card)] sm:h-14 sm:w-14">

                              {artwork ? (
                                <img
                                  src={artwork}
                                  alt={song.title}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-violet-400">
                                  <HiMusicalNote className="text-xl" />
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handlePlayHistorySong(song)
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
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

                            {/* SONG INFO */}

                            <div className="min-w-0 flex-1">

                              <h3
                                className={`
                                  truncate text-xs font-semibold
                                  sm:text-sm
                                  ${
                                    isCurrent
                                      ? "text-violet-400"
                                      : ""
                                  }
                                `}
                              >
                                {song.title}
                              </h3>

                              <p className="mt-1 truncate text-[11px] text-[var(--text-muted)] sm:text-xs">
                                {song.artist ||
                                  song.user?.name ||
                                  "Unknown artist"}
                              </p>

                            </div>

                            {/* LIKE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleLike(song)
                              }
                              disabled={isLiking}
                              className={`
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-full
                                transition-all duration-200
                                sm:h-10 sm:w-10
                                ${
                                  songIsLiked
                                    ? "bg-violet-500/10 text-violet-400"
                                    : "text-[var(--text-muted)] hover:bg-violet-500/10 hover:text-violet-400"
                                }
                                ${
                                  isLiking
                                    ? "cursor-wait opacity-50"
                                    : ""
                                }
                              `}
                              aria-label={
                                songIsLiked
                                  ? "Unlike song"
                                  : "Like song"
                              }
                              title={
                                songIsLiked
                                  ? "Unlike"
                                  : "Like"
                              }
                            >
                              <HiHeart
                                className={`
                                  text-lg transition-transform sm:text-xl
                                  ${
                                    songIsLiked
                                      ? "scale-110 fill-current"
                                      : ""
                                  }
                                `}
                              />
                            </button>

                            {/* PLAYLIST */}

                            <button
                              type="button"
                              onClick={() => {
                                const normalizedSong =
                                  normalizeSong(song);

                                setPlaylistModalSong(
                                  normalizedSong
                                );

                                fetchPlaylists();
                              }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-violet-500/10 hover:text-violet-400 sm:h-10 sm:w-10"
                              aria-label="Add to playlist"
                              title="Add to playlist"
                            >
                              <HiPlus className="text-lg sm:text-xl" />
                            </button>

                            {/* PLAY */}

                            <button
                              type="button"
                              onClick={() =>
                                handlePlayHistorySong(song)
                              }
                              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400 sm:flex"
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

      {/* =====================================================
          ADD TO PLAYLIST MODAL
      ===================================================== */}

      {playlistModalSong && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-5 sm:py-5"
          onClick={() => {
            if (!addingToPlaylist) {
              setPlaylistModalSong(null);
            }
          }}
        >

          <div
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/50 sm:max-h-[85vh] sm:rounded-3xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] p-5 sm:p-6">

              <div className="min-w-0">

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                  Add song
                </p>

                <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                  Add to playlist
                </h2>

                <p className="mt-2 truncate text-sm text-[var(--text-secondary)]">
                  {playlistModalSong.title}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  !addingToPlaylist &&
                  setPlaylistModalSong(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-white"
                aria-label="Close"
              >
                <HiXMark className="text-xl" />
              </button>

            </div>

            {/* PLAYLIST LIST */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

              {loadingPlaylists ? (
                <div className="py-10 text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />

                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    Loading playlists...
                  </p>

                </div>
              ) : playlists.length === 0 ? (

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-center sm:p-6">

                  <HiQueueList className="mx-auto text-3xl text-violet-400" />

                  <p className="mt-3 text-sm font-medium">
                    No playlists yet
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    Create a playlist first from the Playlists page.
                  </p>

                  <Link
                    to="/playlists"
                    onClick={() =>
                      setPlaylistModalSong(null)
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    <HiPlus />
                    Create Playlist
                  </Link>

                </div>
              ) : (

                <div className="space-y-2">

                  {playlists.map((playlist) => {

                    const alreadyInPlaylist =
                      playlist.songs?.some(
                        (song) =>
                          String(song.songId) ===
                          String(
                            playlistModalSong.id
                          )
                      );

                    return (
                      <button
                        key={playlist._id}
                        type="button"
                        disabled={
                          addingToPlaylist ===
                            playlist._id ||
                          alreadyInPlaylist
                        }
                        onClick={() =>
                          handleAddToPlaylist(
                            playlist,
                            playlistModalSong
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-left transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-4"
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 sm:h-12 sm:w-12">

                          {playlist.songs?.[0]?.artwork ? (
                            <img
                              src={
                                playlist.songs[0].artwork
                              }
                              alt={playlist.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <HiMusicalNote className="text-xl text-violet-400" />
                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold">
                            {playlist.name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {playlist.songs?.length || 0}{" "}
                            {playlist.songs?.length === 1
                              ? "song"
                              : "songs"}
                          </p>

                        </div>

                        {alreadyInPlaylist ? (
                          <span className="shrink-0 text-xs font-medium text-violet-400">
                            Added
                          </span>
                        ) : addingToPlaylist ===
                          playlist._id ? (
                          <span className="shrink-0 text-xs text-[var(--text-muted)]">
                            Adding...
                          </span>
                        ) : (
                          <HiPlus className="shrink-0 text-lg text-[var(--text-secondary)]" />
                        )}

                      </button>
                    );
                  })}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MOOD SELECTION MODAL
      ===================================================== */}

      {showMoodSelection && (
        <MoodSelection
          currentMood={selectedMood}
          onClose={() =>
            setShowMoodSelection(false)
          }
          onMoodChange={handleMoodChange}
        />
      )}

    </main>
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
  onOpenPlaylist,
}) {
  const isCurrentSong =
    String(currentSong?.id) ===
    String(track.id);

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

  const handlePlaylist = (event) => {
    event.stopPropagation();
    onOpenPlaylist(track);
  };

  return (
    <div className="group min-w-0">

      {/* =====================================================
          ARTWORK
      ===================================================== */}

      <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition duration-300 group-hover:border-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-950/10 sm:rounded-2xl">

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
            <HiMusicalNote className="text-4xl text-violet-400 sm:text-5xl" />
          </div>
        )}

        {/* =====================================================
            OVERLAY
        ===================================================== */}

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

        {/* =====================================================
            TOP ACTIONS
            MOBILE:
            ALWAYS VISIBLE
            DESKTOP:
            HIDDEN UNTIL HOVER
        ===================================================== */}

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 sm:left-3 sm:top-3 sm:gap-2">

          {/* =================================================
              LIKE
          ================================================= */}

          <button
            type="button"
            onClick={handleLike}
            disabled={
              likingSong === track.id
            }
            className={`
              flex h-9 w-9 items-center justify-center
              rounded-full backdrop-blur-md
              transition-all duration-200
              sm:h-10 sm:w-10

              ${
                isLiked
                  ? "bg-violet-600 text-white opacity-100"
                  : "bg-black/60 text-white opacity-100 hover:bg-violet-600"
              }

              sm:opacity-0
              sm:group-hover:opacity-100
              sm:focus:opacity-100

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
            title={
              isLiked
                ? "Unlike"
                : "Like"
            }
          >
            <HiHeart
              className={`
                text-base transition-transform sm:text-lg
                ${
                  isLiked
                    ? "scale-110 fill-current"
                    : ""
                }
              `}
            />
          </button>

          {/* =================================================
              ADD TO PLAYLIST
          ================================================= */}

          <button
            type="button"
            onClick={handlePlaylist}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              bg-black/60
              text-white
              opacity-100
              backdrop-blur-md
              transition-all duration-200
              hover:bg-violet-600
              sm:h-10
              sm:w-10
              sm:opacity-0
              sm:group-hover:opacity-100
              sm:focus:opacity-100
            "
            aria-label="Add to playlist"
            title="Add to playlist"
          >
            <HiPlus className="text-base sm:text-lg" />
          </button>

        </div>

        {/* =====================================================
            PLAY BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={handlePlay}
          className={`
            absolute bottom-2.5 right-2.5
            flex h-10 w-10 items-center justify-center
            rounded-full bg-violet-600 text-white
            shadow-lg shadow-violet-500/30
            transition-all duration-300
            hover:scale-105
            sm:bottom-3 sm:right-3
            sm:h-11 sm:w-11
            ${
              isCurrentSong
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-100 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus:translate-y-0 sm:focus:opacity-100"
            }
          `}
          aria-label={
            isCurrentSong && isPlaying
              ? "Pause"
              : "Play"
          }
        >
          {isCurrentSong && isPlaying ? (
            <HiPause className="text-base sm:text-lg" />
          ) : (
            <HiPlay className="ml-0.5 text-base sm:text-lg" />
          )}
        </button>

        {/* =====================================================
            PLAYING INDICATOR
        ===================================================== */}

        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1.5">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

            <span className="hidden text-[10px] font-medium text-white min-[420px]:inline">
              Playing
            </span>

          </div>
        )}

      </div>

      {/* =====================================================
          TRACK INFORMATION
      ===================================================== */}

      <h3
        className="mt-2.5 truncate text-xs font-semibold sm:mt-3 sm:text-sm"
        title={track.title}
      >
        {track.title}
      </h3>

      <p
        className="mt-1 truncate text-[11px] text-[var(--text-muted)] sm:text-xs"
        title={track.user?.name}
      >
        {track.user?.name ||
          "Unknown artist"}
      </p>

    </div>
  );
}

export default UserDashboard;