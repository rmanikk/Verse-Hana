import { API_URL } from "../config/api";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // =====================================================
  // ADD SONG TO RECENTLY PLAYED
  // =====================================================

  const addToHistory = async (song) => {
    try {
      if (!song) return;

      await fetch(`${API_URL}/api/history`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: song.id,
          title: song.title,
          artist: song.user?.name || "Unknown artist",
          artwork:
            song.artwork?.["480x480"] ||
            song.artwork?.["150x150"] ||
            song.artwork?.["1000x1000"] ||
            "",
        }),
      });
    } catch (error) {
      // History should NEVER break music playback
      console.error("History error:", error);
    }
  };

  // =====================================================
  // AUDIO EVENTS
  // =====================================================

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);

      // Automatically play next song
      setCurrentIndex((previousIndex) => {
        const nextIndex = previousIndex + 1;

        if (nextIndex < queue.length) {
          const nextTrack = queue[nextIndex];

          setTimeout(() => {
            loadSong(nextTrack);
          }, 0);

          return nextIndex;
        }

        return previousIndex;
      });
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [queue]);

  // =====================================================
  // LOAD SONG
  // =====================================================

  const loadSong = async (song) => {
    try {
      if (!song) return;

      const audio = audioRef.current;

      const streamUrl =
        `https://api.audius.co/v1/tracks/${song.id}/stream`;

      audio.pause();

      audio.src = streamUrl;
      audio.volume = volume;

      setCurrentSong(song);
      setProgress(0);
      setDuration(0);

      await audio.play();

      setIsPlaying(true);

      // Record song after playback successfully starts
      addToHistory(song);

    } catch (error) {
      console.error("Song loading error:", error);
      setIsPlaying(false);
    }
  };

  // =====================================================
  // PLAY SONG
  // =====================================================

  const playSong = async (song, songs = []) => {
    try {
      if (!song) return;

      const audio = audioRef.current;

      // Clicking currently selected song
      if (currentSong?.id === song.id) {
        if (audio.paused) {
          await audio.play();
          setIsPlaying(true);
        } else {
          audio.pause();
          setIsPlaying(false);
        }

        return;
      }

      // Set queue
      if (songs.length > 0) {
        setQueue(songs);

        const index = songs.findIndex(
          (item) => item.id === song.id
        );

        setCurrentIndex(index >= 0 ? index : 0);
      } else {
        setQueue([song]);
        setCurrentIndex(0);
      }

      await loadSong(song);

    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  // =====================================================
  // PAUSE
  // =====================================================

  const pauseSong = () => {
    const audio = audioRef.current;

    audio.pause();

    setIsPlaying(false);
  };

  // =====================================================
  // TOGGLE PLAY / PAUSE
  // =====================================================

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!currentSong) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  // =====================================================
  // NEXT SONG
  // =====================================================

  const nextSong = async () => {
    if (queue.length === 0) return;

    const nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      return;
    }

    const nextTrack = queue[nextIndex];

    setCurrentIndex(nextIndex);

    await loadSong(nextTrack);
  };

  // =====================================================
  // PREVIOUS SONG
  // =====================================================

  const previousSong = async () => {
    if (queue.length === 0) return;

    const audio = audioRef.current;

    // Restart current song if more than 3 seconds in
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    const previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      return;
    }

    const previousTrack = queue[previousIndex];

    setCurrentIndex(previousIndex);

    await loadSong(previousTrack);
  };

  // =====================================================
  // SEEK
  // =====================================================

  const seek = (time) => {
    const audio = audioRef.current;

    if (!duration) return;

    audio.currentTime = Number(time);

    setProgress(Number(time));
  };

  // =====================================================
  // VOLUME
  // =====================================================

  const changeVolume = (value) => {
    const newVolume = Math.max(
      0,
      Math.min(1, Number(value))
    );

    audioRef.current.volume = newVolume;

    setVolume(newVolume);
  };

  // =====================================================
  // CLOSE PLAYER
  // =====================================================

  const closePlayer = () => {
    const audio = audioRef.current;

    audio.pause();
    audio.currentTime = 0;
    audio.src = "";

    setCurrentSong(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setQueue([]);
    setCurrentIndex(-1);
  };

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      audio.pause();
      audio.src = "";
    };
  }, []);

  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        currentIndex,

        isPlaying,
        progress,
        duration,
        volume,

        playSong,
        pauseSong,
        togglePlay,

        nextSong,
        previousSong,

        seek,

        changeVolume,

        // MusicPlayer.jsx expects this name
        setVolume: changeVolume,

        closePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error(
      "usePlayer must be used inside PlayerProvider"
    );
  }

  return context;
}