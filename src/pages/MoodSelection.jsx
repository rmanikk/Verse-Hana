import { useState } from "react";
import {
  HiArrowRight,
  HiXMark,
} from "react-icons/hi2";

const moods = [
  {
    id: "happy",
    emoji: "😊",
    name: "Happy",
    description: "Bright & uplifting",
  },
  {
    id: "calm",
    emoji: "😌",
    name: "Calm",
    description: "Peaceful & relaxed",
  },
  {
    id: "rain",
    emoji: "🌧️",
    name: "Rain",
    description: "Cozy & reflective",
  },
  {
    id: "night",
    emoji: "🌙",
    name: "Night",
    description: "Late-night vibes",
  },
  {
    id: "love",
    emoji: "❤️",
    name: "Love",
    description: "Warm & emotional",
  },
  {
    id: "focus",
    emoji: "💪",
    name: "Focus",
    description: "Locked in",
  },
  {
    id: "party",
    emoji: "🎉",
    name: "Party",
    description: "Let's have fun",
  },
  {
    id: "sad",
    emoji: "😢",
    name: "Sad",
    description: "Feel it all",
  },
];

function MoodSelection({
  onClose,
  onMoodChange,
  currentMood,
}) {
  // Local state so clicking a mood does not immediately
  // reload or change the dashboard.
  const [selectedMood, setSelectedMood] = useState(
    currentMood || "calm"
  );

  const handleContinue = () => {
    if (!selectedMood) return;

    // Save selected mood
    localStorage.setItem(
      "versehana_mood",
      selectedMood
    );

    // Update dashboard
    if (onMoodChange) {
      onMoodChange(selectedMood);
    }

    // Close modal
    if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-[var(--border)] bg-[var(--background)] shadow-2xl shadow-black/50">

        {/* Ambient Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
          <div className="absolute left-[-120px] top-[-120px] h-[350px] w-[350px] rounded-full bg-violet-600/15 blur-[130px]" />

          <div className="absolute bottom-[-150px] right-[-120px] h-[350px] w-[350px] rounded-full bg-fuchsia-600/10 blur-[130px]" />

          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[130px]" />
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-secondary)] backdrop-blur-md transition hover:bg-violet-500/10 hover:text-white"
          aria-label="Close mood selection"
        >
          <HiXMark className="text-xl" />
        </button>

        {/* Content */}
        <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">

            <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-400">
              🎧 Let's set the vibe
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              How are you feeling
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                today?
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              Choose a mood and we'll update your
              music recommendations to match.
            </p>

          </div>

          {/* Mood Grid */}
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">

            {moods.map((mood) => {
              const isSelected =
                selectedMood === mood.id;

              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() =>
                    setSelectedMood(mood.id)
                  }
                  className={`
                    group relative rounded-2xl border p-4 text-left
                    transition-all duration-300
                    ${
                      isSelected
                        ? "border-violet-500 bg-violet-500/15 shadow-lg shadow-violet-500/10"
                        : "border-[var(--border)] bg-[var(--surface)]/70 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-violet-500/5"
                    }
                  `}
                >

                  {/* Selected Indicator */}
                  {isSelected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                      ✓
                    </span>
                  )}

                  {/* Emoji */}
                  <div className="text-3xl transition-transform duration-300 group-hover:scale-110">
                    {mood.emoji}
                  </div>

                  {/* Mood Name */}
                  <h2 className="mt-3 text-sm font-semibold">
                    {mood.name}
                  </h2>

                  {/* Description */}
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {mood.description}
                  </p>

                </button>
              );
            })}

          </div>

          {/* Continue */}
          <div className="mt-8 flex justify-center">

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedMood}
              className="
                group flex items-center justify-center gap-2
                rounded-2xl
                bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600
                px-7 py-3.5
                text-sm font-semibold text-white
                shadow-lg shadow-violet-500/20
                transition duration-300
                hover:scale-[1.03]
                hover:shadow-xl hover:shadow-violet-500/30
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:scale-100
              "
            >
              Continue with my vibe

              <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default MoodSelection;