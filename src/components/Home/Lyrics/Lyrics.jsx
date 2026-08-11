import { motion } from "framer-motion";
import LyricsPreview from "./LyricsPreview";

function Lyrics() {
  return (
    <section
      className="
        relative
        overflow-hidden
        py-16

        sm:py-24

        lg:py-24
        xl:py-36
      "
    >
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            left-1/2
            top-10
            h-[320px]
            w-[320px]
            -translate-x-1/2
            rounded-full
            bg-violet-600/10
            blur-[130px]

            sm:top-20
            sm:h-[450px]
            sm:w-[450px]
            sm:blur-[160px]

            lg:h-[500px]
            lg:w-[500px]
            lg:blur-[180px]
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
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="
            mx-auto
            max-w-3xl
            text-center
          "
        >
          {/* Label */}

          <span
            className="
              inline-flex
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
            🎤 Feel Every Word
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
            Music you can

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
              see and feel.
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

              sm:mt-6
              sm:text-base
              sm:leading-8

              lg:text-lg
            "
          >
            Follow every word with beautifully synchronized lyrics
            designed to keep you connected to the music.
          </p>
        </motion.div>

        {/* Lyrics Player */}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.15,
          }}
          className="
            mt-10

            sm:mt-14

            lg:mt-16
          "
        >
          <LyricsPreview />
        </motion.div>
      </div>
    </section>
  );
}

export default Lyrics;