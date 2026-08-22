import {
  HiPause,
  HiPlay,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiBackward,
  HiForward,
  HiXMark,
} from "react-icons/hi2";

import { usePlayer } from "../../context/PlayerContext";

function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    progress,
    duration,
    seek,
    volume,
    setVolume,
    closePlayer,
    nextSong,
    previousSong,
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  const artwork =
    currentSong.artwork?.["480x480"] ||
    currentSong.artwork?.["150x150"] ||
    currentSong.artwork?.["1000x1000"];

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    seek(Number(e.target.value));
  };

  const handleVolume = (e) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--border)] bg-[var(--surface)]/95 shadow-2xl backdrop-blur-2xl">

      {/* =====================================================
          PROGRESS INDICATOR
      ===================================================== */}

      <div className="absolute left-0 right-0 top-0 h-1 bg-[var(--border)]">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
          style={{
            width:
              duration > 0
                ? `${Math.min(
                    (progress / duration) * 100,
                    100
                  )}%`
                : "0%",
          }}
        />
      </div>

      {/* =====================================================
          DESKTOP / TABLET PLAYER
      ===================================================== */}

      <div className="mx-auto hidden h-[82px] max-w-[1600px] items-center gap-4 px-4 sm:flex sm:px-6 lg:px-8">

        {/* ===================================================
            SONG INFO
        =================================================== */}

        <div className="flex min-w-0 flex-1 items-center gap-3">

          {/* Artwork */}

          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">

            {artwork ? (
              <img
                src={artwork}
                alt={currentSong.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-violet-400">
                ♪
              </div>
            )}

          </div>

          {/* Title / Artist */}

          <div className="min-w-0">

            <h3
              className="truncate text-sm font-semibold text-[var(--text-primary)]"
              title={currentSong.title}
            >
              {currentSong.title}
            </h3>

            <p
              className="mt-1 truncate text-xs text-[var(--text-muted)]"
              title={currentSong.user?.name}
            >
              {currentSong.user?.name ||
                "Unknown artist"}
            </p>

          </div>

        </div>

        {/* ===================================================
            PLAYER CONTROLS
        =================================================== */}

        <div className="flex shrink-0 items-center gap-2">

          {/* Previous */}

          <button
            type="button"
            onClick={previousSong}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            aria-label="Previous song"
          >
            <HiBackward className="text-lg" />
          </button>

          {/* Play / Pause */}

          <button
            type="button"
            onClick={togglePlay}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition hover:scale-105"
            aria-label={
              isPlaying ? "Pause" : "Play"
            }
          >
            {isPlaying ? (
              <HiPause className="text-lg" />
            ) : (
              <HiPlay className="ml-0.5 text-lg" />
            )}
          </button>

          {/* Next */}

          <button
            type="button"
            onClick={nextSong}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            aria-label="Next song"
          >
            <HiForward className="text-lg" />
          </button>

        </div>

        {/* ===================================================
            DESKTOP PROGRESS
        =================================================== */}

        <div className="hidden w-[280px] items-center gap-3 md:flex lg:w-[360px]">

          <span className="w-10 text-right text-[10px] text-[var(--text-muted)]">
            {formatTime(progress)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress || 0}
            onChange={handleSeek}
            className="h-1 w-full cursor-pointer accent-violet-500"
            aria-label="Song progress"
          />

          <span className="w-10 text-[10px] text-[var(--text-muted)]">
            {formatTime(duration)}
          </span>

        </div>

        {/* ===================================================
            VOLUME
        =================================================== */}

        <div className="hidden shrink-0 items-center gap-2 lg:flex">

          <button
            type="button"
            onClick={() =>
              setVolume(volume > 0 ? 0 : 1)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
            aria-label={
              volume > 0 ? "Mute" : "Unmute"
            }
          >
            {volume > 0 ? (
              <HiSpeakerWave className="text-lg" />
            ) : (
              <HiSpeakerXMark className="text-lg" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="w-20 cursor-pointer accent-violet-500"
            aria-label="Volume"
          />

        </div>

        {/* ===================================================
            CLOSE
        =================================================== */}

        <button
          type="button"
          onClick={closePlayer}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Close player"
        >
          <HiXMark className="text-lg" />
        </button>

      </div>

      {/* =====================================================
          MOBILE PLAYER
      ===================================================== */}

      <div className="flex flex-col px-3 pb-2 pt-3 sm:hidden">

        {/* ===================================================
            MOBILE TOP ROW
        =================================================== */}

        <div className="flex items-center gap-3">

          {/* Artwork */}

          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--card)] shadow-md">

            {artwork ? (
              <img
                src={artwork}
                alt={currentSong.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-violet-400">
                ♪
              </div>
            )}

          </div>

          {/* Song information */}

          <div className="min-w-0 flex-1">

            <h3
              className="truncate text-sm font-semibold text-[var(--text-primary)]"
              title={currentSong.title}
            >
              {currentSong.title}
            </h3>

            <p
              className="mt-0.5 truncate text-xs text-[var(--text-muted)]"
              title={currentSong.user?.name}
            >
              {currentSong.user?.name ||
                "Unknown artist"}
            </p>

          </div>

          {/* =================================================
              MOBILE CONTROLS
          ================================================= */}

          <div className="flex shrink-0 items-center gap-1">

            {/* Previous */}

            <button
              type="button"
              onClick={previousSong}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)]"
              aria-label="Previous song"
            >
              <HiBackward className="text-base" />
            </button>

            {/* Play / Pause */}

            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
              aria-label={
                isPlaying ? "Pause" : "Play"
              }
            >
              {isPlaying ? (
                <HiPause className="text-base" />
              ) : (
                <HiPlay className="ml-0.5 text-base" />
              )}
            </button>

            {/* Next */}

            <button
              type="button"
              onClick={nextSong}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)]"
              aria-label="Next song"
            >
              <HiForward className="text-base" />
            </button>

            {/* Close */}

            <button
              type="button"
              onClick={closePlayer}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)]"
              aria-label="Close player"
            >
              <HiXMark className="text-lg" />
            </button>

          </div>

        </div>

        {/* ===================================================
            MOBILE PROGRESS
        =================================================== */}

        <div className="mt-2 flex items-center gap-2">

          <span className="w-7 shrink-0 text-[9px] text-[var(--text-muted)]">
            {formatTime(progress)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress || 0}
            onChange={handleSeek}
            className="h-1 min-w-0 flex-1 cursor-pointer accent-violet-500"
            aria-label="Song progress"
          />

          <span className="w-7 shrink-0 text-right text-[9px] text-[var(--text-muted)]">
            {formatTime(duration)}
          </span>

        </div>

      </div>

    </div>
  );
}

export default MusicPlayer;