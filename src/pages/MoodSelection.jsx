import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";

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

function MoodSelection() {
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState(null);

  const handleContinue = () => {
    if (!selectedMood) return;

    // Temporary storage.
    // Later this will be saved to MongoDB.
    localStorage.setItem("versehana_mood", selectedMood);

    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6">

        {/* Ambient Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute left-[-180px] top-[-150px] h-[450px] w-[450px] rounded-full bg-violet-600/15 blur-[150px]" />

          <div className="absolute bottom-[-180px] right-[-150px] h-[450px] w-[450px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

          <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[150px]" />

        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl">

          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">

            <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-400">
              🎧 Let's set the vibe
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              How are you feeling
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                today?
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              Tell VerseHana your mood and we'll create a musical experience
              that feels right for you.
            </p>

          </div>

          {/* Mood Grid */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">

            {moods.map((mood) => {
              const isSelected = selectedMood === mood.id;

              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood.id)}
                  className={`
                    group relative rounded-3xl border p-5 text-left
                    transition-all duration-300
                    ${
                      isSelected
                        ? "border-violet-500 bg-violet-500/15 shadow-xl shadow-violet-500/10"
                        : "border-[var(--border)] bg-[var(--surface)]/70 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-violet-500/5"
                    }
                  `}
                >

                  {/* Selected Indicator */}
                  {isSelected && (
                    <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                      ✓
                    </span>
                  )}

                  {/* Emoji */}
                  <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
                    {mood.emoji}
                  </div>

                  {/* Mood Name */}
                  <h2 className="mt-4 text-sm font-semibold">
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

          {/* Continue Button */}
          <div className="mt-10 flex justify-center">

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
    </main>
  );
}

export default MoodSelection;