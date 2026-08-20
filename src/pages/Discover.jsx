import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowLeft,
  HiMagnifyingGlass,
  HiMusicalNote,
  HiPlay,
  HiPause,
  HiHeart,
  HiPlus,
  HiXMark,
  HiQueueList,
} from "react-icons/hi2";

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
  const {
    currentSong,
    isPlaying,
    playSong,
  } = usePlayer();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeMood, setActiveMood] = useState("");

  // =====================================================
  // LIKES
  // =====================================================

  const [likedSongs, setLikedSongs] = useState([]);
  const [likingSong, setLikingSong] = useState(null);

  // =====================================================
  // PLAYLISTS
  // =====================================================

  const [playlists, setPlaylists] = useState([]);
  const [playlistModalSong, setPlaylistModalSong] =
    useState(null);

  const [addingToPlaylist, setAddingToPlaylist] =
    useState(null);

  // =====================================================
  // FETCH MUSIC
  // =====================================================

  const fetchTracks = async (query = "") => {
    try {
      setLoading(true);
      setError("");

      let url;

      if (query.trim()) {
        url =
          `${API_URL}/api/music/search?q=` +
          `${encodeURIComponent(query.trim())}&limit=20`;
      } else {
        url =
          `${API_URL}/api/music/trending?limit=20`;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
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
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchTracks();
    fetchLikedSongs();
    fetchPlaylists();
  }, []);

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
          data.message ||
            "Failed to fetch liked songs."
        );
      }

      setLikedSongs(data.likes || []);
    } catch (error) {
      console.error(
        "Fetch liked songs error:",
        error
      );
    }
  };

  // =====================================================
  // CHECK LIKE
  // =====================================================

  const isLiked = (songId) => {
    return likedSongs.some(
      (like) =>
        String(like.songId) === String(songId)
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
            "Content-Type": "application/json",
          },
          body:
            method === "POST"
              ? JSON.stringify({
                  title: track.title,
                  artist:
                    track.user?.name ||
                    "Unknown artist",
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
          data.message ||
            "Failed to update like."
        );
      }

      if (alreadyLiked) {
        setLikedSongs((previous) =>
          previous.filter(
            (like) =>
              String(like.songId) !==
              String(track.id)
          )
        );
      } else {
        setLikedSongs((previous) => [
          {
            songId: track.id,
            title: track.title,
            artist:
              track.user?.name ||
              "Unknown artist",
            artwork:
              track.artwork?.["480x480"] ||
              track.artwork?.["150x150"] ||
              track.artwork?.["1000x1000"] ||
              "",
          },
          ...previous,
        ]);
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
  // FETCH PLAYLISTS
  // =====================================================

  const fetchPlaylists = async () => {
    try {
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
    }
  };

  // =====================================================
  // ADD SONG TO PLAYLIST
  // =====================================================

  const handleAddToPlaylist = async (
    playlist,
    track
  ) => {
    if (!playlist || !track) {
      return;
    }

    const key = `${playlist._id}-${track.id}`;

    try {
      setAddingToPlaylist(key);

      const artwork =
        track.artwork?.["480x480"] ||
        track.artwork?.["150x150"] ||
        track.artwork?.["1000x1000"] ||
        "";

      const response = await fetch(
        `${API_URL}/api/playlists/${playlist._id}/songs`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            songId: track.id,
            title: track.title,
            artist:
              track.user?.name ||
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

      alert(
        `"${track.title}" added to "${playlist.name}".`
      );

      setPlaylistModalSong(null);

      // Refresh playlists so song counts/artwork update
      fetchPlaylists();
    } catch (error) {
      console.error(
        "Add to playlist error:",
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
        }
      );

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
            "Failed to fetch mood music."
        );
      }

      setTracks(data.tracks || []);
    } catch (error) {
      console.error(
        "Mood discover error:",
        error
      );

      setError(
        error.message ||
          "We couldn't load this mood."
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

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">

          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-violet-400"
          >
            <HiArrowLeft className="text-xl" />
          </Link>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Explore
            </p>

            <h1 className="text-2xl font-bold">
              Discover
            </h1>
          </div>

        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] space-y-10 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* =====================================================
            SEARCH HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-[var(--surface)] to-fuchsia-600/10 p-6 sm:p-8 lg:p-10">

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

          <div className="relative z-10">

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Find your next favorite
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              What are{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                you feeling?
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              Search for songs and artists, or explore
              music based on your mood.
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
                    setSearch(event.target.value)
                  }
                  placeholder="Search songs or artists..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500"
                />

              </div>

              <button
                type="submit"
                disabled={!search.trim()}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Search
              </button>

            </form>

          </div>

        </section>

        {/* =====================================================
            MOODS
        ===================================================== */}

        <section>

          <div className="mb-5">

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Explore by feeling
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Browse moods
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

            {moods.map((mood) => (

              <button
                key={mood.id}
                type="button"
                onClick={() =>
                  handleMood(mood.id)
                }
                className={`
                  flex flex-col items-center justify-center
                  gap-2 rounded-2xl border p-4
                  transition duration-300
                  ${
                    activeMood === mood.id
                      ? "border-violet-500/50 bg-violet-500/15 text-violet-400"
                      : "border-[var(--border)] bg-[var(--surface)]/60 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5"
                  }
                `}
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

        {/* =====================================================
            RESULTS
        ===================================================== */}

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

                {activeMood
                  ? `${
                      moods.find(
                        (mood) =>
                          mood.id === activeMood
                      )?.name
                    } music`
                  : search
                    ? `Results for "${search}"`
                    : "Discover music"}

              </h2>

            </div>

            {tracks.length > 0 && (
              <span className="text-sm text-[var(--text-muted)]">
                {tracks.length} songs
              </span>
            )}

          </div>

          {/* LOADING */}

          {loading && (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

              {[1, 2, 3, 4, 5].map(
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
                  fetchTracks(search)
                }
                className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
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
                  Try another search or explore a
                  different mood.
                </p>

              </div>

            )}

          {/* TRACKS */}

          {!loading &&
            !error &&
            tracks.length > 0 && (

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

                {tracks.map((track) => (

                  <DiscoverCard
                    key={track.id}
                    track={track}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    onPlay={handlePlay}
                    isLiked={isLiked(track.id)}
                    onLike={handleLike}
                    likingSong={likingSong}
                    onAddToPlaylist={() =>
                      setPlaylistModalSong(track)
                    }
                  />

                ))}

              </div>

            )}

        </section>

      </div>

      {/* =====================================================
          PLAYLIST MODAL
      ===================================================== */}

      {playlistModalSong && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={() =>
            !addingToPlaylist &&
            setPlaylistModalSong(null)
          }
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Save song
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Add to playlist
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setPlaylistModalSong(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-white"
              >
                <HiXMark className="text-xl" />
              </button>

            </div>

            {/* SONG */}

            <div className="border-b border-[var(--border)] p-5">

              <div className="flex items-center gap-3">

                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">

                  {(
                    playlistModalSong.artwork?.[
                      "150x150"
                    ] ||
                    playlistModalSong.artwork?.[
                      "480x480"
                    ] ||
                    playlistModalSong.artwork?.[
                      "1000x1000"
                    ]
                  ) ? (

                    <img
                      src={
                        playlistModalSong.artwork?.[
                          "150x150"
                        ] ||
                        playlistModalSong.artwork?.[
                          "480x480"
                        ] ||
                        playlistModalSong.artwork?.[
                          "1000x1000"
                        ]
                      }
                      alt={playlistModalSong.title}
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center text-violet-400">
                      <HiMusicalNote className="text-xl" />
                    </div>

                  )}

                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold">
                    {playlistModalSong.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                    {playlistModalSong.user?.name ||
                      "Unknown artist"}
                  </p>

                </div>

              </div>

            </div>

            {/* PLAYLISTS */}

            <div className="max-h-[350px] overflow-y-auto p-3">

              {playlists.length === 0 ? (

                <div className="px-4 py-8 text-center">

                  <HiQueueList className="mx-auto text-4xl text-[var(--text-muted)]" />

                  <p className="mt-3 text-sm font-medium">
                    No playlists yet
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Create a playlist first.
                  </p>

                  <Link
                    to="/playlists"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    <HiPlus />
                    Create Playlist
                  </Link>

                </div>

              ) : (

                <div className="space-y-2">

                  {playlists.map((playlist) => {

                    const key =
                      `${playlist._id}-${playlistModalSong.id}`;

                    const isAdding =
                      addingToPlaylist === key;

                    return (

                      <button
                        key={playlist._id}
                        type="button"
                        disabled={isAdding}
                        onClick={() =>
                          handleAddToPlaylist(
                            playlist,
                            playlistModalSong
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-[var(--card)] p-3 text-left transition hover:border-violet-500/30 hover:bg-violet-500/10 disabled:cursor-wait disabled:opacity-60"
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                          {isAdding ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                          ) : (
                            <HiQueueList className="text-xl" />
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

                        <HiPlus className="shrink-0 text-lg text-[var(--text-muted)]" />

                      </button>

                    );

                  })}

                </div>

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
  currentSong,
  isPlaying,
  onPlay,
  isLiked,
  onLike,
  likingSong,
  onAddToPlaylist,
}) {
  const isCurrent =
    String(currentSong?.id) ===
    String(track.id);

  const artwork =
    track.artwork?.["480x480"] ||
    track.artwork?.["150x150"] ||
    track.artwork?.["1000x1000"];

  const handleLike = (event) => {
    event.stopPropagation();
    onLike(track);
  };

  const handlePlaylist = (event) => {
    event.stopPropagation();
    onAddToPlaylist(track);
  };

  return (

    <div className="group">

      {/* ARTWORK */}

      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

        {artwork ? (

          <img
            src={artwork}
            alt={track.title}
            className={`
              h-full w-full object-cover
              transition duration-500
              ${
                isCurrent
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

        {/* OVERLAY */}

        <div
          className={`
            absolute inset-0 bg-black/30 transition
            ${
              isCurrent
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }
          `}
        />

        {/* LIKE */}

        <button
          type="button"
          onClick={handleLike}
          disabled={
            likingSong === track.id
          }
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
          title={
            isLiked
              ? "Unlike"
              : "Like"
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

        {/* ADD TO PLAYLIST */}

        <button
          type="button"
          onClick={handlePlaylist}
          className="absolute left-14 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-all duration-200 group-hover:opacity-100 hover:bg-violet-600"
          aria-label="Add to playlist"
          title="Add to playlist"
        >
          <HiPlus className="text-lg" />
        </button>

        {/* PLAY */}

        <button
          type="button"
          onClick={() =>
            onPlay(track)
          }
          className={`
            absolute bottom-3 right-3
            flex h-11 w-11 items-center justify-center
            rounded-full bg-violet-600 text-white
            shadow-lg shadow-violet-500/30
            transition-all duration-300
            hover:scale-105
            ${
              isCurrent
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            }
          `}
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

        {/* PLAYING INDICATOR */}

        {isCurrent && isPlaying && (

          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

            <span className="text-[10px] font-medium text-white">
              Playing
            </span>

          </div>

        )}

      </div>

      {/* TRACK INFO */}

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
        {track.user?.name ||
          "Unknown artist"}
      </p>

    </div>

  );
}

export default Discover;