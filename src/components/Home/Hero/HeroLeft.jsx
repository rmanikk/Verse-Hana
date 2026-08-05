import SearchCard from "./SearchCard";
import MoodPills from "./MoodPills";
import TrendingStats from "../Stats/TrendingStats";

function HeroLeft() {
  return (
    <div className="max-w-xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-300">
        🌸 Emotion-Based Music Discovery
      </span>

      <h1 className="mt-8 text-6xl font-extrabold leading-[1.05] lg:text-7xl">
        Music that
        <br />
        understands
        <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          your emotions.
        </span>
      </h1>

      <p className="mt-8 text-lg leading-8 text-gray-400">
        Find songs based on how you feel, not just what you search.
        VerseHana creates the perfect soundtrack for every emotion.
      </p>

      <SearchCard />

      <MoodPills />

      <div className="mt-10 flex gap-5">
        <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 font-semibold text-white transition hover:scale-105">
          Start Listening
        </button>

        <button className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white">
          Explore Moods
        </button>
      </div>

      <TrendingStats />
    </div>
  );
}

export default HeroLeft;