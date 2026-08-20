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

  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

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

  // Pagination
  const SONGS_PER_PAGE = 6;
  const ARTISTS_PER_PAGE = 4;

  const [trackPage, setTrackPage] = useState(1);
  const [artistPage, setArtistPage] = useState(1);

  const [likedSongs, setLikedSongs] = useState([]);
  const [likingSong, setLikingSong] = useState(null);

  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] =
    useState(false);
  const [selectedTrack, setSelectedTrack] =
    useState(null);
  const [addingToPlaylist, setAddingToPlaylist] =
    useState(null);

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

      throw new Error(
        "The server returned invalid JSON."
      );
    }
  };

  // =====================================================
  // FETCH ALL MUSIC
  // =====================================================

  const fetchAllMusic = async () => {
    try {
      // The public music API does not expose /api/music.
      // Use the working Audius trending endpoint instead.
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
          data.message ||
            "Failed to fetch music."
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
      console.error(
        "Fetch all music error:",
        error
      );

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
          data.message ||
            "Failed to fetch music."
        );
      }

      setTracks(
        data.tracks ||
          data.music ||
          data.songs ||
          []
      );
    } catch (error) {
      console.error(
        "Discover music error:",
        error
      );

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

        setTrendingTracks(
          music.slice(0, 6)
        );
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
        // Audius tracks normally keep the artist inside `user`.
        // Keep a few fallbacks so the section still works if the
        // API response shape changes slightly.
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
          const existing =
            artistMap.get(artist);

          existing.songCount += 1;

          if (
            !existing.artwork &&
            artwork
          ) {
            existing.artwork = artwork;
          }
        }
      });

      // Keep all discovered artists; pagination controls
      // decide how many are displayed at once.
      setArtists(
        Array.from(artistMap.values()).sort(
          (a, b) => b.songCount - a.songCount
        )
      );
    } catch (error) {
      console.error(
        "Artists error:",
        error
      );

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
      console.error(
        "Fetch likes error:",
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

      if (!response.ok) {
        return;
      }

      const data = await getJson(response);

      setPlaylists(
        data.playlists || []
      );
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

  // Reset pagination whenever the result set changes.
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

    const alreadyLiked =
      isLiked(track.id);

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
      console.error(
        "Like error:",
        error
      );

      alert(
        error.message ||
          "Failed to update like."
      );
    } finally {
      setLikingSong(null);
    }
  };

  // =====================================================
  // OPEN PLAYLIST MODAL
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

      const title =
        selectedTrack.title;

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
    Math.ceil(tracks.length / SONGS_PER_PAGE)
  );

  const visibleTracks = useMemo(() => {
    const start =
      (trackPage - 1) * SONGS_PER_PAGE;

    return tracks.slice(
      start,
      start + SONGS_PER_PAGE
    );
  }, [tracks, trackPage]);

  const totalArtistPages = Math.max(
    1,
    Math.ceil(artists.length / ARTISTS_PER_PAGE)
  );

  const visibleArtists = useMemo(() => {
    const start =
      (artistPage - 1) * ARTISTS_PER_PAGE;

    return artists.slice(
      start,
      start + ARTISTS_PER_PAGE
    );
  }, [artists, artistPage]);

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

            <div className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-violet-400">
              <HiMagnifyingGlass className="text-lg" />
              Discover
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveMood("");
                fetchTracks("");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            >
              <HiMusicalNote className="text-lg" />
              Moods
            </button>

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
        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <section className="min-w-0 flex-1">

          <header className="flex h-20 items-center justify-between border-b border-[var(--border)] px-5 sm:px-8 lg:px-10">

            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Explore your music
              </p>

              <h1 className="text-lg font-bold sm:text-xl">
                Discover
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

          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">

              {/* LEFT */}

              <div className="min-w-0 space-y-8">

                {/* SEARCH */}

                <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

                  <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

                  <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

                  <div className="relative z-10">

                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                      Find your next favorite
                    </p>

                    <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                      What are you{" "}
                      <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        feeling?
                      </span>
                    </h2>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                      Search for songs and artists,
                      or explore music based on your
                      mood.
                    </p>

                    <form
                      onSubmit={handleSearch}
                      className="mt-7 flex max-w-2xl gap-3"
                    >

                      <div className="relative flex-1">

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
                        className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                      >
                        {loading
                          ? "Searching..."
                          : "Search"}
                      </button>

                    </form>

                  </div>
                </section>

                {/* MOODS */}

                <section>

                  <div className="mb-5">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                      Explore by feeling
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Browse moods
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() =>
                          handleMood(mood.id)
                        }
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition duration-300 ${
                          activeMood === mood.id
                            ? "border-violet-500/50 bg-violet-500/15 text-violet-400"
                            : "border-[var(--border)] bg-[var(--surface)]/60 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                        }`}
                      >
                        <span className="text-2xl">
                          {mood.emoji}
                        </span>

                        <span className="text-sm font-medium">
                          {mood.name}
                        </span>
                      </button>
                    ))}

                  </div>
                </section>

                {/* RESULTS */}

                <section>

                  <div className="mb-5 flex items-end justify-between">

                    <div>

                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                        {activeMood
                          ? "Mood selection"
                          : search
                            ? "Search results"
                            : "Explore"}
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        {currentResultTitle}
                      </h2>

                    </div>

                    {tracks.length > 0 && (
                      <span className="text-sm text-[var(--text-muted)]">
                        {tracks.length} songs
                      </span>
                    )}

                  </div>

                  {loading && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

                      {[1, 2, 3, 4, 5, 6].map(
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

                  {!loading && error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

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

                  {!loading &&
                    !error &&
                    tracks.length === 0 && (
                      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 text-center">

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

                  {!loading &&
                    !error &&
                    tracks.length > 0 && (
                      <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

                          {visibleTracks.map((track) => (
                            <DiscoverCard
                              key={track.id}
                              track={track}
                              tracks={tracks}
                              currentSong={currentSong}
                              isPlaying={isPlaying}
                              onPlay={handlePlay}
                              isLiked={isLiked(track.id)}
                              onLike={handleLike}
                              likingSong={likingSong}
                              onPlaylist={
                                openPlaylistModal
                              }
                            />
                          ))}

                        </div>

                        {totalTrackPages > 1 && (
                          <PaginationControls
                            currentPage={trackPage}
                            totalPages={totalTrackPages}
                            totalItems={tracks.length}
                            itemsPerPage={SONGS_PER_PAGE}
                            onPrevious={() =>
                              setTrackPage((page) =>
                                Math.max(1, page - 1)
                              )
                            }
                            onNext={() =>
                              setTrackPage((page) =>
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

              {/* RIGHT */}

              <aside className="space-y-8">

                {/* TRENDING */}

                <section>

                  <div className="mb-5 flex items-end justify-between">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                        Popular right now
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
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
                            <div className="h-12 w-12 animate-pulse rounded-xl bg-[var(--card)]" />

                            <div className="flex-1">
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

                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                      From your music library
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
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
                            <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-[var(--card)]" />

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
                              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 text-center transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                            >

                              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30">

                                {artist.artwork ? (
                                  <img
                                    src={artist.artwork}
                                    alt={artist.name}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <HiMusicalNote className="text-2xl text-violet-400" />
                                )}

                              </div>

                              <h3 className="mt-3 truncate text-sm font-semibold">
                                {artist.name}
                              </h3>

                              <p className="mt-1 text-xs text-[var(--text-muted)]">
                                {artist.songCount}{" "}
                                {artist.songCount === 1
                                  ? "song"
                                  : "songs"}
                              </p>

                            </button>
                          )
                        )}

                      </div>

                      {totalArtistPages > 1 && (
                        <PaginationControls
                          currentPage={artistPage}
                          totalPages={totalArtistPages}
                          totalItems={artists.length}
                          itemsPerPage={ARTISTS_PER_PAGE}
                          onPrevious={() =>
                            setArtistPage((page) =>
                              Math.max(1, page - 1)
                            )
                          }
                          onNext={() =>
                            setArtistPage((page) =>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={() =>
            !addingToPlaylist &&
            setShowPlaylistModal(false)
          }
        >

          <div
            className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Save song
                </p>

                <h2 className="mt-2 text-2xl font-bold">
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
                disabled={!!addingToPlaylist}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-white"
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
                playlists.map((playlist) => (
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
                    className="flex w-full items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-left transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-wait disabled:opacity-60"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">

                      {playlist.songs?.[0]
                        ?.artwork ? (
                        <img
                          src={
                            playlist.songs[0]
                              .artwork
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
                        {playlist.songs?.length ||
                          0}{" "}
                        songs
                      </p>

                    </div>

                    {addingToPlaylist ===
                    playlist._id ? (
                      <span className="text-xs text-violet-400">
                        Adding...
                      </span>
                    ) : (
                      <HiPlus className="text-lg text-[var(--text-secondary)]" />
                    )}

                  </button>
                ))
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

      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

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

        <div
          className={`absolute inset-0 bg-black/30 transition ${
            isCurrent
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />

        <button
          type="button"
          onClick={() =>
            onLike(track)
          }
          disabled={
            likingSong === track.id
          }
          className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all ${
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
            className={`text-lg ${
              isLiked
                ? "scale-110 fill-current"
                : ""
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() =>
            onPlaylist(track)
          }
          className="absolute left-14 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-violet-600"
          aria-label="Add to playlist"
          title="Add to playlist"
        >
          <HiPlus className="text-lg" />
        </button>

        <button
          type="button"
          onClick={() =>
            onPlay(track, tracks)
          }
          className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105 ${
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

      <h3
        className="mt-3 truncate text-sm font-semibold"
        title={track.title}
      >
        {track.title}
      </h3>

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
      className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-left transition hover:border-violet-500/30 hover:bg-violet-500/5"
    >

      <span className="w-5 text-center text-xs font-bold text-[var(--text-muted)]">
        {index + 1}
      </span>

      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">

        {artwork ? (
          <img
            src={artwork}
            alt={track.title}
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
          className={`truncate text-sm font-semibold ${
            isCurrent
              ? "text-violet-400"
              : ""
          }`}
        >
          {track.title}
        </p>

        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
          {track.user?.name ||
            track.artist ||
            "Unknown artist"}
        </p>

      </div>

    </button>
  );
}

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
      : (currentPage - 1) * itemsPerPage + 1;

  const lastItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  return (
    <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 sm:p-4">
      <p className="text-xs text-[var(--text-muted)] sm:text-sm">
        Showing {firstItem}-{lastItem} of {totalItems}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <HiChevronLeft className="text-lg" />
        </button>

        <span className="min-w-[70px] text-center text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <HiChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );
}

export default Discover;