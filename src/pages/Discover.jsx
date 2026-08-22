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
  HiChevronLeft,
  HiChevronRight,
  HiBars3,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

const API_URL = "http://localhost:5000";

const moods = [
  { id: "happy", name: "Happy", emoji: "😊" },
  { id: "calm", name: "Calm", emoji: "😌" },
  { id: "rain", name: "Rain", emoji: "🌧️" },
  { id: "night", name: "Night", emoji: "🌙" },
  { id: "love", name: "Love", emoji: "❤️" },
  { id: "focus", name: "Focus", emoji: "💪" },
  { id: "party", name: "Party", emoji: "🎉" },
  { id: "sad", name: "Sad", emoji: "😢" },
];

function Discover() {
  const { user, logout } = useAuth();

  const { currentSong, isPlaying, playSong } = usePlayer();

  const [tracks, setTracks] = useState([]);
  const [allTracks, setAllTracks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeMood, setActiveMood] = useState("");

  const [trendingTracks, setTrendingTracks] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  const SONGS_PER_PAGE = 8;
  const ARTISTS_PER_PAGE = 4;

  const [trackPage, setTrackPage] = useState(1);
  const [artistPage, setArtistPage] = useState(1);

  const [likedSongs, setLikedSongs] = useState([]);
  const [likingSong, setLikingSong] = useState(null);

  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);

  // MOBILE SIDEBAR
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =====================================================
  // SAFE JSON RESPONSE
  // =====================================================

  const getJson = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    const text = await response.text();

    if (!contentType.includes("application/json")) {
      console.error(
        "Expected JSON but received:",
        text.substring(0, 500)
      );

      throw new Error(
        `Server returned ${response.status} ${response.statusText}.`
      );
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Invalid JSON response:", text);

      throw new Error("The server returned invalid JSON.");
    }
  };

  // =====================================================
  // FETCH ALL MUSIC
  // =====================================================

  const fetchAllMusic = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/music/trending?limit=100`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch music."
        );
      }

      const music =
        data.tracks ||
        data.music ||
        data.songs ||
        [];

      setAllTracks(music);

      return music;
    } catch (error) {
      console.error("Fetch all music error:", error);
      throw error;
    }
  };

  // =====================================================
  // FETCH MUSIC
  // =====================================================

  const fetchTracks = async (query = "") => {
    try {
      setLoading(true);
      setError("");

      let url;

      if (query.trim()) {
        url = `${API_URL}/api/music/search?q=${encodeURIComponent(
          query.trim()
        )}&limit=20`;
      } else {
        url = `${API_URL}/api/music/trending?limit=20`;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The music server returned an invalid response."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch music."
        );
      }

      setTracks(
        data.tracks ||
          data.music ||
          data.songs ||
          []
      );
    } catch (error) {
      console.error("Discover music error:", error);

      setError(
        error.message ||
          "We couldn't load music right now."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TRENDING
  // =====================================================

  const fetchTrending = async () => {
    try {
      setLoadingTrending(true);

      const response = await fetch(
        `${API_URL}/api/music/trending?limit=6`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Trending endpoint unavailable."
        );
      }

      const data = await getJson(response);

      const trending =
        data.tracks ||
        data.music ||
        data.songs ||
        [];

      setTrendingTracks(trending);
    } catch (error) {
      console.warn(
        "Trending endpoint unavailable. Using music catalog.",
        error
      );

      try {
        const music = await fetchAllMusic();

        setTrendingTracks(music.slice(0, 6));
      } catch (fallbackError) {
        console.error(
          "Trending fallback error:",
          fallbackError
        );

        setTrendingTracks([]);
      }
    } finally {
      setLoadingTrending(false);
    }
  };

  // =====================================================
  // FETCH ARTISTS
  // =====================================================

  const fetchArtists = async () => {
    try {
      setLoadingArtists(true);

      const music =
        allTracks.length > 0
          ? allTracks
          : await fetchAllMusic();

      const artistMap = new Map();

      music.forEach((track) => {
        const artist =
          track.user?.name ||
          track.user?.handle ||
          track.user?.username ||
          (typeof track.artist === "string"
            ? track.artist
            : track.artist?.name) ||
          "Unknown Artist";

        const artwork =
          track.user?.profile_picture?.["480x480"] ||
          track.user?.profile_picture?.["150x150"] ||
          track.artwork?.["480x480"] ||
          track.artwork?.["150x150"] ||
          track.artwork?.["1000x1000"] ||
          "";

        if (!artistMap.has(artist)) {
          artistMap.set(artist, {
            name: artist,
            artwork,
            songCount: 1,
          });
        } else {
          const existing = artistMap.get(artist);

          existing.songCount += 1;

          if (!existing.artwork && artwork) {
            existing.artwork = artwork;
          }
        }
      });

      setArtists(
        Array.from(artistMap.values()).sort(
          (a, b) => b.songCount - a.songCount
        )
      );
    } catch (error) {
      console.error("Artists error:", error);
      setArtists([]);
    } finally {
      setLoadingArtists(false);
    }
  };

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

      if (!response.ok) {
        return;
      }

      const data = await getJson(response);

      const likes =
        data.likes ||
        data.songs ||
        [];

      setLikedSongs(
        likes
          .map(
            (song) =>
              song.songId ||
              song.id ||
              song._id
          )
          .filter(Boolean)
      );
    } catch (error) {
      console.error("Fetch likes error:", error);
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

      if (!response.ok) {
        return;
      }

      const data = await getJson(response);

      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error(
        "Fetch playlists error:",
        error
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchTracks();
    fetchTrending();
    fetchArtists();
    fetchLikedSongs();
    fetchPlaylists();
  }, []);

  // =====================================================
  // CLOSE MOBILE MENU ON ESC
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // Prevent background scroll while mobile menu is open.
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // =====================================================
  // RESET PAGINATION
  // =====================================================

  useEffect(() => {
    setTrackPage(1);
  }, [tracks]);

  useEffect(() => {
    setArtistPage(1);
  }, [artists]);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (event) => {
    event.preventDefault();

    setActiveMood("");

    fetchTracks(search);
  };

  // =====================================================
  // MOOD
  // =====================================================

  const handleMood = async (moodId) => {
    try {
      setActiveMood(moodId);
      setSearch("");
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/music/mood/${moodId}?limit=20`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch mood music."
        );
      }

      setTracks(
        data.tracks ||
          data.music ||
          data.songs ||
          []
      );

      setMobileMenuOpen(false);
    } catch (error) {
      console.error(
        "Mood discover error:",
        error
      );

      setError(
        error.message ||
          "We couldn't load this mood."
      );

      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ARTIST SEARCH
  // =====================================================

  const handleArtist = (artistName) => {
    setSearch(artistName);
    setActiveMood("");

    fetchTracks(artistName);
  };

  // =====================================================
  // LIKE CHECK
  // =====================================================

  const isLiked = (songId) => {
    return likedSongs.some(
      (id) =>
        String(id) === String(songId)
    );
  };

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleLike = async (track) => {
    if (
      !track ||
      likingSong === track.id
    ) {
      return;
    }

    const alreadyLiked = isLiked(track.id);

    try {
      setLikingSong(track.id);

      const method = alreadyLiked
        ? "DELETE"
        : "POST";

      const response = await fetch(
        `${API_URL}/api/likes/${track.id}`,
        {
          method,
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body:
            method === "POST"
              ? JSON.stringify({
                  title: track.title,
                  artist:
                    track.user?.name ||
                    track.artist ||
                    "Unknown artist",
                  artwork:
                    track.artwork?.[
                      "480x480"
                    ] ||
                    track.artwork?.[
                      "150x150"
                    ] ||
                    track.artwork?.[
                      "1000x1000"
                    ] ||
                    "",
                })
              : undefined,
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update like."
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
              String(id) !==
              String(track.id)
          )
        );
      }
    } catch (error) {
      console.error("Like error:", error);

      alert(
        error.message ||
          "Failed to update like."
      );
    } finally {
      setLikingSong(null);
    }
  };

  // =====================================================
  // PLAYLIST MODAL
  // =====================================================

  const openPlaylistModal = (track) => {
    setSelectedTrack(track);
    setShowPlaylistModal(true);
  };

  // =====================================================
  // ADD TO PLAYLIST
  // =====================================================

  const handleAddToPlaylist = async (
    playlistId
  ) => {
    if (
      !selectedTrack ||
      addingToPlaylist
    ) {
      return;
    }

    try {
      setAddingToPlaylist(playlistId);

      const response = await fetch(
        `${API_URL}/api/playlists/${playlistId}/songs`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            songId: selectedTrack.id,
            title: selectedTrack.title,
            artist:
              selectedTrack.user?.name ||
              selectedTrack.artist ||
              "Unknown artist",
            artwork:
              selectedTrack.artwork?.[
                "480x480"
              ] ||
              selectedTrack.artwork?.[
                "150x150"
              ] ||
              selectedTrack.artwork?.[
                "1000x1000"
              ] ||
              "",
          }),
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add song to playlist."
        );
      }

      const title = selectedTrack.title;

      setShowPlaylistModal(false);
      setSelectedTrack(null);

      alert(
        `"${title}" added to playlist.`
      );
    } catch (error) {
      console.error(
        "Add playlist error:",
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
  // PLAY
  // =====================================================

  const handlePlay = (
    track,
    queue = tracks
  ) => {
    playSong(track, queue);
  };

  // =====================================================
  // RESULT TITLE
  // =====================================================

  const currentResultTitle =
    useMemo(() => {
      if (activeMood) {
        return `${
          moods.find(
            (mood) =>
              mood.id === activeMood
          )?.name
        } music`;
      }

      if (search) {
        return `Results for "${search}"`;
      }

      return "Discover music";
    }, [activeMood, search]);

  const totalTrackPages = Math.max(
    1,
    Math.ceil(
      tracks.length / SONGS_PER_PAGE
    )
  );

  const visibleTracks = useMemo(() => {
    const start =
      (trackPage - 1) *
      SONGS_PER_PAGE;

    return tracks.slice(
      start,
      start + SONGS_PER_PAGE
    );
  }, [tracks, trackPage]);

  const totalArtistPages = Math.max(
    1,
    Math.ceil(
      artists.length / ARTISTS_PER_PAGE
    )
  );

  const visibleArtists = useMemo(() => {
    const start =
      (artistPage - 1) *
      ARTISTS_PER_PAGE;

    return artists.slice(
      start,
      start + ARTISTS_PER_PAGE
    );
  }, [artists, artistPage]);

  // =====================================================
  // SIDEBAR CONTENT
  // =====================================================

  const sidebarContent = (
    <>
      {/* LOGO */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] px-5 sm:px-6">
        <div className="flex items-center gap-3">
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

        {/* MOBILE CLOSE */}
        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <HiXMark className="text-xl" />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <Link
          to="/dashboard"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
        >
          <HiHome className="text-lg" />
          Home
        </Link>

        <div className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400">
          <HiMagnifyingGlass className="text-lg" />
          Discover
        </div>

        <Link
          to="/genres"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
        >
          <HiMusicalNote className="text-lg" />
          Genres
        </Link>

        <Link
          to="/liked-songs"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
        >
          <HiHeart className="text-lg" />
          Liked Songs
        </Link>

        <Link
          to="/playlists"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
        >
          <HiQueueList className="text-lg" />
          Playlists
        </Link>

        <Link
          to="/recently-played"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
        >
          <HiClock className="text-lg" />
          Recently Played
        </Link>
      </nav>

      {/* USER */}
      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <Link
          to="/profile"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="mb-3 flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-500/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() ||
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
    </>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">

        {/* =====================================================
            DESKTOP SIDEBAR
        ===================================================== */}

        <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 lg:flex lg:flex-col xl:w-64">
          {sidebarContent}
        </aside>

        {/* =====================================================
            MOBILE SIDEBAR OVERLAY
        ===================================================== */}

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />
        )}

        {/* =====================================================
            MOBILE SIDEBAR
        ===================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-[70] flex w-[min(82vw,320px)] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex min-h-20 items-center justify-between gap-4 border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 xl:px-10">

            <div className="flex min-w-0 items-center gap-3">

              {/* HAMBURGER */}
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400 lg:hidden"
                aria-label="Open menu"
              >
                <HiBars3 className="text-xl" />
              </button>

              <div className="min-w-0">
                <p className="hidden truncate text-sm text-[var(--text-secondary)] sm:block">
                  Explore your music
                </p>

                <h1 className="text-lg font-bold sm:text-xl">
                  Discover
                </h1>
              </div>

            </div>

            <Link
              to="/profile"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </Link>

          </header>

          {/* PAGE CONTAINER */}
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10">

            {/* 
              Desktop:
              LEFT = flexible
              RIGHT = 320px
            */}
            <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:gap-10">

              {/* =================================================
                  LEFT
              ================================================= */}

              <div className="min-w-0 space-y-8">

                {/* SEARCH HERO */}
                <section className="relative overflow-hidden rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-5 sm:rounded-[28px] sm:p-7 lg:p-8">

                  <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-[90px]" />

                  <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[90px]" />

                  <div className="relative z-10">

                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                      Find your next favorite
                    </p>

                    <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl xl:text-[42px]">
                      What are you{" "}
                      <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        feeling?
                      </span>
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:mt-4 sm:text-base sm:leading-7">
                      Search for songs and artists,
                      or explore music based on your
                      mood.
                    </p>

                    {/* SEARCH */}
                    <form
                      onSubmit={handleSearch}
                      className="mt-6 flex w-full max-w-2xl flex-col gap-3 sm:mt-7 sm:flex-row"
                    >
                      <div className="relative min-w-0 flex-1">

                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]" />

                        <input
                          type="text"
                          value={search}
                          onChange={(event) =>
                            setSearch(
                              event.target.value
                            )
                          }
                          placeholder="Search songs or artists..."
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500"
                        />

                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                      >
                        {loading
                          ? "Searching..."
                          : "Search"}
                      </button>
                    </form>

                  </div>
                </section>

                {/* =================================================
                    MOODS
                ================================================= */}

                <section>

                  <div className="mb-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                      Explore by feeling
                    </p>

                    <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                      Browse moods
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">

                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() =>
                          handleMood(mood.id)
                        }
                        className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition duration-300 sm:min-h-[100px] sm:p-4 ${
                          activeMood === mood.id
                            ? "border-violet-500/50 bg-violet-500/15 text-violet-400"
                            : "border-[var(--border)] bg-[var(--surface)]/60 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                        }`}
                      >
                        <span className="text-2xl">
                          {mood.emoji}
                        </span>

                        <span className="text-xs font-medium sm:text-sm">
                          {mood.name}
                        </span>
                      </button>
                    ))}

                  </div>
                </section>

                {/* =================================================
                    RESULTS
                ================================================= */}

                <section>

                  <div className="mb-5 flex items-end justify-between gap-4">

                    <div className="min-w-0">

                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                        {activeMood
                          ? "Mood selection"
                          : search
                            ? "Search results"
                            : "Explore"}
                      </p>

                      <h2 className="mt-2 truncate text-xl font-bold sm:text-2xl">
                        {currentResultTitle}
                      </h2>

                    </div>

                    {tracks.length > 0 && (
                      <span className="shrink-0 text-xs text-[var(--text-muted)] sm:text-sm">
                        {tracks.length} songs
                      </span>
                    )}

                  </div>

                  {/* LOADING */}
                  {loading && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">

                      {[1, 2, 3, 4, 5, 6, 7, 8].map(
                        (item) => (
                          <div
                            key={item}
                            className="min-w-0 animate-pulse"
                          >
                            <div className="aspect-square rounded-xl bg-[var(--card)] sm:rounded-2xl" />

                            <div className="mt-3 h-4 w-3/4 rounded bg-[var(--card)]" />

                            <div className="mt-2 h-3 w-1/2 rounded bg-[var(--card)]" />
                          </div>
                        )
                      )}

                    </div>
                  )}

                  {/* ERROR */}
                  {!loading && error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center sm:p-8">

                      <HiMusicalNote className="mx-auto text-4xl text-red-400" />

                      <p className="mt-3 text-sm text-red-400">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          fetchTracks(search)
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
                      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 px-5 text-center">

                        <HiMusicalNote className="text-5xl text-[var(--text-muted)]" />

                        <h3 className="mt-4 text-xl font-semibold">
                          No music found
                        </h3>

                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          Try another search or
                          explore a different mood.
                        </p>

                      </div>
                    )}

                  {/* TRACKS */}
                  {!loading &&
                    !error &&
                    tracks.length > 0 && (
                      <>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-4 2xl:grid-cols-4">

                          {visibleTracks.map(
                            (track) => (
                              <DiscoverCard
                                key={track.id}
                                track={track}
                                tracks={tracks}
                                currentSong={
                                  currentSong
                                }
                                isPlaying={
                                  isPlaying
                                }
                                onPlay={
                                  handlePlay
                                }
                                isLiked={isLiked(
                                  track.id
                                )}
                                onLike={
                                  handleLike
                                }
                                likingSong={
                                  likingSong
                                }
                                onPlaylist={
                                  openPlaylistModal
                                }
                              />
                            )
                          )}

                        </div>

                        {totalTrackPages > 1 && (
                          <PaginationControls
                            currentPage={trackPage}
                            totalPages={
                              totalTrackPages
                            }
                            totalItems={
                              tracks.length
                            }
                            itemsPerPage={
                              SONGS_PER_PAGE
                            }
                            onPrevious={() =>
                              setTrackPage(
                                (page) =>
                                  Math.max(
                                    1,
                                    page - 1
                                  )
                              )
                            }
                            onNext={() =>
                              setTrackPage(
                                (page) =>
                                  Math.min(
                                    totalTrackPages,
                                    page + 1
                                  )
                              )
                            }
                          />
                        )}
                      </>
                    )}

                </section>
              </div>

              {/* =================================================
                  RIGHT SIDEBAR
              ================================================= */}

              <aside className="min-w-0 space-y-8">

                {/* TRENDING */}
                <section>

                  <div className="mb-5 flex items-end justify-between">

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                        Popular right now
                      </p>

                      <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                        Trending
                      </h2>
                    </div>

                    <span className="text-xs text-[var(--text-muted)]">
                      Now
                    </span>

                  </div>

                  {loadingTrending ? (
                    <div className="space-y-3">

                      {[1, 2, 3, 4, 5].map(
                        (item) => (
                          <div
                            key={item}
                            className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3"
                          >
                            <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-[var(--card)]" />

                            <div className="min-w-0 flex-1">
                              <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--card)]" />

                              <div className="mt-2 h-2 w-1/2 animate-pulse rounded bg-[var(--card)]" />
                            </div>
                          </div>
                        )
                      )}

                    </div>
                  ) : trendingTracks.length === 0 ? (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-6 text-center">

                      <HiMusicalNote className="mx-auto text-3xl text-[var(--text-muted)]" />

                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        No trending songs yet.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {trendingTracks
                        .slice(0, 6)
                        .map(
                          (track, index) => (
                            <TrendingCard
                              key={track.id}
                              track={track}
                              index={index}
                              currentSong={
                                currentSong
                              }
                              isPlaying={
                                isPlaying
                              }
                              onPlay={() =>
                                handlePlay(
                                  track,
                                  trendingTracks
                                )
                              }
                            />
                          )
                        )}

                    </div>
                  )}
                </section>

                {/* ARTISTS */}
                <section>

                  <div className="mb-5">

                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                      From your music library
                    </p>

                    <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                      Artists
                    </h2>

                  </div>

                  {loadingArtists ? (
                    <div className="grid grid-cols-2 gap-3">

                      {[1, 2, 3, 4].map(
                        (item) => (
                          <div
                            key={item}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4"
                          >
                            <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-[var(--card)] sm:h-16 sm:w-16" />

                            <div className="mx-auto mt-3 h-3 w-2/3 animate-pulse rounded bg-[var(--card)]" />
                          </div>
                        )
                      )}

                    </div>
                  ) : artists.length === 0 ? (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-6 text-center">

                      <HiMusicalNote className="mx-auto text-3xl text-[var(--text-muted)]" />

                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        Artists will appear as music is added.
                      </p>

                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">

                        {visibleArtists.map(
                          (artist) => (
                            <button
                              key={artist.name}
                              type="button"
                              onClick={() =>
                                handleArtist(
                                  artist.name
                                )
                              }
                              className="group min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-center transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5 sm:p-4"
                            >

                              <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 sm:h-16 sm:w-16">

                                {artist.artwork ? (
                                  <img
                                    src={
                                      artist.artwork
                                    }
                                    alt={
                                      artist.name
                                    }
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <HiMusicalNote className="text-xl text-violet-400 sm:text-2xl" />
                                )}

                              </div>

                              <h3 className="mt-3 truncate text-xs font-semibold sm:text-sm">
                                {artist.name}
                              </h3>

                              <p className="mt-1 text-[10px] text-[var(--text-muted)] sm:text-xs">
                                {artist.songCount}{" "}
                                {artist.songCount ===
                                1
                                  ? "song"
                                  : "songs"}
                              </p>

                            </button>
                          )
                        )}

                      </div>

                      {totalArtistPages > 1 && (
                        <PaginationControls
                          currentPage={
                            artistPage
                          }
                          totalPages={
                            totalArtistPages
                          }
                          totalItems={
                            artists.length
                          }
                          itemsPerPage={
                            ARTISTS_PER_PAGE
                          }
                          onPrevious={() =>
                            setArtistPage(
                              (page) =>
                                Math.max(
                                  1,
                                  page - 1
                                )
                            )
                          }
                          onNext={() =>
                            setArtistPage(
                              (page) =>
                                Math.min(
                                  totalArtistPages,
                                  page + 1
                                )
                            )
                          }
                        />
                      )}

                    </>
                  )}

                </section>

              </aside>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          PLAYLIST MODAL
      ===================================================== */}

      {showPlaylistModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:px-5"
          onClick={() =>
            !addingToPlaylist &&
            setShowPlaylistModal(false)
          }
        >

          <div
            className="my-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 sm:text-xs">
                  Save song
                </p>

                <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                  Add to Playlist
                </h2>

                <p className="mt-2 truncate text-sm text-[var(--text-secondary)]">
                  {selectedTrack?.title}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPlaylistModal(false)
                }
                disabled={
                  !!addingToPlaylist
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-white"
              >
                <HiXMark className="text-xl" />
              </button>

            </div>

            <div className="mt-6 space-y-2">

              {playlists.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">

                  <HiQueueList className="mx-auto text-3xl text-[var(--text-muted)]" />

                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    You don't have any playlists yet.
                  </p>

                  <Link
                    to="/playlists"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <HiPlus />
                    Create Playlist
                  </Link>

                </div>
              ) : (
                playlists.map(
                  (playlist) => (
                    <button
                      key={playlist._id}
                      type="button"
                      onClick={() =>
                        handleAddToPlaylist(
                          playlist._id
                        )
                      }
                      disabled={
                        addingToPlaylist ===
                        playlist._id
                      }
                      className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-left transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-wait disabled:opacity-60 sm:gap-4"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 sm:h-12 sm:w-12">

                        {playlist.songs?.[0]
                          ?.artwork ? (
                          <img
                            src={
                              playlist
                                .songs[0]
                                .artwork
                            }
                            alt={
                              playlist.name
                            }
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
                          {playlist.songs
                            ?.length ||
                            0}{" "}
                          songs
                        </p>

                      </div>

                      {addingToPlaylist ===
                      playlist._id ? (
                        <span className="shrink-0 text-xs text-violet-400">
                          Adding...
                        </span>
                      ) : (
                        <HiPlus className="shrink-0 text-lg text-[var(--text-secondary)]" />
                      )}

                    </button>
                  )
                )
              )}

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// =====================================================
// DISCOVER CARD
// =====================================================

function DiscoverCard({
  track,
  tracks,
  currentSong,
  isPlaying,
  onPlay,
  isLiked,
  onLike,
  likingSong,
  onPlaylist,
}) {
  const isCurrent =
    String(currentSong?.id) ===
    String(track.id);

  const artwork =
    track.artwork?.["480x480"] ||
    track.artwork?.["150x150"] ||
    track.artwork?.["1000x1000"];

  return (
    <div className="group min-w-0">

      {/* ARTWORK */}

      <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] sm:rounded-2xl">

        {artwork ? (
          <img
            src={artwork}
            alt={track.title}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-500 ${
              isCurrent
                ? "scale-105"
                : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <HiMusicalNote className="text-4xl text-violet-400 sm:text-5xl" />
          </div>
        )}

        {/* OVERLAY */}

        <div
          className={`absolute inset-0 bg-black/30 transition ${
            isCurrent
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* LIKE */}

        <button
          type="button"
          onClick={() =>
            onLike(track)
          }
          disabled={
            likingSong === track.id
          }
          className={`absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all sm:left-3 sm:top-3 sm:h-9 sm:w-9 ${
            isLiked
              ? "bg-violet-600 text-white opacity-100"
              : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-violet-600"
          }`}
          aria-label={
            isLiked
              ? "Unlike song"
              : "Like song"
          }
        >
          <HiHeart
            className={`text-base sm:text-lg ${
              isLiked
                ? "scale-110 fill-current"
                : ""
            }`}
          />
        </button>

        {/* PLAYLIST */}

        <button
          type="button"
          onClick={() =>
            onPlaylist(track)
          }
          className="absolute left-12 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-violet-600 sm:left-14 sm:top-3 sm:h-9 sm:w-9"
          aria-label="Add to playlist"
          title="Add to playlist"
        >
          <HiPlus className="text-base sm:text-lg" />
        </button>

        {/* PLAY */}

        <button
          type="button"
          onClick={() =>
            onPlay(track, tracks)
          }
          className={`absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105 sm:bottom-3 sm:right-3 sm:h-10 sm:w-10 ${
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
            <HiPause className="text-base sm:text-lg" />
          ) : (
            <HiPlay className="ml-0.5 text-base sm:text-lg" />
          )}
        </button>
      </div>

      {/* TITLE */}

      <h3
        className="mt-2.5 truncate text-xs font-semibold sm:mt-3 sm:text-sm"
        title={track.title}
      >
        {track.title}
      </h3>

      {/* ARTIST */}

      <p
        className="mt-1 truncate text-[11px] text-[var(--text-muted)] sm:text-xs"
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

// =====================================================
// TRENDING CARD
// =====================================================

function TrendingCard({
  track,
  index,
  currentSong,
  isPlaying,
  onPlay,
}) {
  const isCurrent =
    String(currentSong?.id) ===
    String(track.id);

  const artwork =
    track.artwork?.["150x150"] ||
    track.artwork?.["480x480"] ||
    track.artwork?.["1000x1000"];

  return (
    <button
      type="button"
      onClick={onPlay}
      className="group flex w-full min-w-0 items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-2.5 text-left transition hover:border-violet-500/30 hover:bg-violet-500/5 sm:gap-3 sm:p-3"
    >

      <span className="w-4 shrink-0 text-center text-[11px] font-bold text-[var(--text-muted)] sm:w-5 sm:text-xs">
        {index + 1}
      </span>

      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[var(--card)] sm:h-12 sm:w-12">

        {artwork ? (
          <img
            src={artwork}
            alt={track.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-400">
            <HiMusicalNote />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">

          {isCurrent && isPlaying ? (
            <HiPause className="text-lg text-white" />
          ) : (
            <HiPlay className="text-lg text-white" />
          )}

        </div>
      </div>

      <div className="min-w-0 flex-1">

        <p
          className={`truncate text-xs font-semibold sm:text-sm ${
            isCurrent
              ? "text-violet-400"
              : ""
          }`}
        >
          {track.title}
        </p>

        <p className="mt-1 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
          {track.user?.name ||
            track.artist ||
            "Unknown artist"}
        </p>

      </div>
    </button>
  );
}

// =====================================================
// PAGINATION
// =====================================================

function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPrevious,
  onNext,
}) {
  const firstItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const lastItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  return (
    <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 sm:p-4">

      <p className="text-[10px] text-[var(--text-muted)] sm:text-sm">
        Showing {firstItem}-{lastItem} of{" "}
        {totalItems}
      </p>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
          aria-label="Previous page"
        >
          <HiChevronLeft className="text-lg" />
        </button>

        <span className="min-w-[50px] text-center text-[10px] font-medium text-[var(--text-secondary)] sm:min-w-[70px] sm:text-sm">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={
            currentPage === totalPages
          }
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
          aria-label="Next page"
        >
          <HiChevronRight className="text-lg" />
        </button>

      </div>
    </div>
  );
}

export default Discover;