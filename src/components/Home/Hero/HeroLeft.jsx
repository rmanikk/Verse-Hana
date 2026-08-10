import SearchCard from "./SearchCard";
import MoodPills from "./MoodPills";
import TrendingStats from "../Stats/TrendingStats";

function HeroLeft() {
  return (
    <div
      className="
        w-full
        max-w-xl
        text-center

        sm:max-w-2xl

        lg:max-w-xl
        lg:text-left

        xl:max-w-2xl
      "
    >
      {/* ================= BADGE ================= */}

      <span
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-violet-500/30
          bg-violet-500/10
          px-4 py-2
          text-xs
          font-medium
          text-violet-600

          sm:px-5
          sm:text-sm

          dark:text-violet-300
        "
      >
        🌸 Emotion-Based Music Discovery
      </span>

      {/* ================= HEADING ================= */}

      <h1
        className="
          mt-6
          text-4xl
          font-extrabold
          leading-[1.08]
          tracking-tight
          text-[var(--text-primary)]

          sm:mt-7
          sm:text-5xl

          md:text-6xl

          lg:mt-8
          lg:text-6xl

          xl:text-7xl
        "
      >
        Music that
        <br />
        understands

        <span
          className="
            block
            bg-gradient-to-r
            from-violet-500
            via-fuchsia-500
            to-pink-500
            bg-clip-text
            text-transparent

            dark:from-violet-400
            dark:via-fuchsia-400
            dark:to-pink-400
          "
        >
          your emotions.
        </span>
      </h1>

      {/* ================= DESCRIPTION ================= */}

      <p
        className="
          mx-auto
          mt-6
          max-w-lg
          text-base
          leading-7
          text-[var(--text-secondary)]

          sm:mt-7
          sm:text-lg
          sm:leading-8

          lg:mx-0
          lg:mt-8
        "
      >
        Find songs based on how you feel, not just what you search.
        VerseHana creates the perfect soundtrack for every emotion.
      </p>

      {/* ================= SEARCH ================= */}

      <SearchCard />

      {/* ================= MOODS ================= */}

      <MoodPills />

      {/* ================= CTA BUTTONS ================= */}

      <div
        className="
          mt-8
          flex
          flex-col
          items-center
          gap-3

          sm:flex-row
          sm:justify-center
          sm:gap-4

          lg:mt-10
          lg:justify-start
          lg:gap-5
        "
      >
        {/* Start Listening */}

        <button
          className="
            w-full
            rounded-full
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-600
            px-7
            py-3.5
            text-sm
            font-semibold
            text-white
            transition
            duration-300
            hover:scale-105
            hover:shadow-lg
            hover:shadow-violet-500/25

            sm:w-auto
            sm:px-8
            sm:py-4
            sm:text-base
          "
        >
          Start Listening
        </button>

        {/* Explore Moods */}

        <button
          className="
            w-full
            rounded-full
            border
            border-[var(--border)]
            bg-[var(--surface)]
            px-7
            py-3.5
            text-sm
            font-semibold
            text-[var(--text-primary)]
            transition
            duration-300
            hover:border-violet-500
            hover:bg-violet-500/10
            hover:text-violet-500

            sm:w-auto
            sm:px-8
            sm:py-4
            sm:text-base
          "
        >
          Explore Moods
        </button>
      </div>

      {/* ================= STATS ================= */}

      <TrendingStats />
    </div>
  );
}

export default HeroLeft;