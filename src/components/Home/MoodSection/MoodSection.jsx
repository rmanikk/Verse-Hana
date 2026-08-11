import { motion } from "framer-motion";

import MoodCard from "./MoodCard";
import { moods } from "../../../data/moods";

function MoodSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        py-16

        sm:py-24

        lg:py-24
      "
    >
      {/* Background Glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            left-[-120px]
            top-20
            h-[280px]
            w-[280px]
            rounded-full
            bg-violet-600/10
            blur-[120px]

            sm:h-[350px]
            sm:w-[350px]
          "
        />

        <div
          className="
            absolute
            right-[-120px]
            bottom-10
            h-[280px]
            w-[280px]
            rounded-full
            bg-fuchsia-600/10
            blur-[120px]

            sm:h-[350px]
            sm:w-[350px]
          "
        />
      </div>

      {/* Content */}

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[1450px]
          px-5

          sm:px-8

          lg:px-12

          xl:px-16
        "
      >
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Label */}

          <span
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-violet-500/30
              bg-violet-500/10
              px-4
              py-2
              text-xs
              font-medium
              text-violet-500

              sm:px-5
              sm:text-sm
            "
          >
            🎧 Browse by Emotion
          </span>

          {/* Heading */}

          <h2
            className="
              mt-6
              text-3xl
              font-bold
              leading-tight
              text-[var(--text-primary)]

              sm:mt-8
              sm:text-4xl

              md:text-5xl

              lg:text-6xl
            "
          >
            Every emotion

            <span
              className="
                block
                bg-gradient-to-r
                from-violet-500
                via-fuchsia-500
                to-pink-500
                bg-clip-text
                text-transparent
              "
            >
              deserves its soundtrack.
            </span>
          </h2>

          {/* Description */}

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-7
              text-[var(--text-secondary)]

              sm:mt-8
              sm:text-base
              sm:leading-8

              lg:text-lg
            "
          >
            Explore curated playlists designed around how you feel.
            Whether you're celebrating, relaxing, studying, or simply
            enjoying the moment, VerseHana helps you find the perfect music.
          </p>
        </motion.div>

        {/* Mood Cards */}

        <div
          className="
            mt-12
            grid
            grid-cols-1
            gap-5

            sm:mt-16
            sm:grid-cols-2
            sm:gap-6

            lg:mt-20

            xl:grid-cols-4
            xl:gap-8
          "
        >
          {moods.map((mood, index) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              className="h-full"
            >
              <MoodCard mood={mood} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MoodSection;