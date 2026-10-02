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
          border-teal-500/30
          bg-teal-500/10
          px-4
          py-2
          text-xs
          font-medium
          text-teal-600

          sm:px-5
          sm:text-sm

          dark:text-teal-300
        "
      >
        🌸 Emotion-Based Music Discovery
      </span>

      {/* ================= HEADING ================= */}

      <h1
        className="
          mt-5
          text-4xl
          font-extrabold
          leading-[1.08]
          tracking-tight
          text-[var(--text-primary)]

          sm:mt-6
          sm:text-5xl

          md:text-6xl

          lg:mt-7
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
            from-teal-500
            via-cyan-500
            to-pink-500
            bg-clip-text
            text-transparent

            dark:from-teal-400
            dark:via-cyan-400
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
          mt-5
          max-w-lg
          text-base
          leading-7
          text-[var(--text-secondary)]

          sm:mt-6
          sm:text-lg
          sm:leading-8

          lg:mx-0
          lg:mt-7
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
          mt-7
          flex
          flex-col
          items-center
          gap-3

          sm:flex-row
          sm:justify-center
          sm:gap-4

          lg:mt-8
          lg:justify-start
          lg:gap-5
        "
      >
        {/* Start Listening */}

        <button
          type="button"
          className="
            w-full
            rounded-full
            bg-gradient-to-r
            from-teal-600
            to-cyan-600
            px-7
            py-3.5
            text-sm
            font-semibold
            text-white
            transition
            duration-300
            hover:scale-105
            hover:shadow-lg
            hover:shadow-teal-500/25

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
          type="button"
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
            hover:border-teal-500
            hover:bg-teal-500/10
            hover:text-teal-500

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