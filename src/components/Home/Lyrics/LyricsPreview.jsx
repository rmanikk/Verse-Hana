import { motion } from "framer-motion";
import {
  HiHeart,
  HiPause,
  HiSpeakerWave,
} from "react-icons/hi2";

import album1 from "../../../assets/albums/album1.jpg";

function LyricsPreview() {
  const lyrics = [
    {
      text: "The city sleeps beneath the midnight sky",
      active: false,
    },
    {
      text: "And all the stars are watching from above",
      active: false,
    },
    {
      text: "I close my eyes and let the music carry me",
      active: true,
    },
    {
      text: "Somewhere between the silence and the sound",
      active: false,
    },
    {
      text: "I find a place where I can breathe again",
      active: false,
    },
  ];

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--surface)]
        p-4
        shadow-2xl
        backdrop-blur-2xl

        sm:p-5

        lg:rounded-[36px]
        lg:p-8
      "
    >
      {/* Ambient Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-32
          h-72
          w-72
          rounded-full
          bg-violet-600/15
          blur-[120px]

          sm:h-80
          sm:w-80
          sm:blur-[130px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-32
          h-72
          w-72
          rounded-full
          bg-fuchsia-600/10
          blur-[120px]

          sm:h-80
          sm:w-80
          sm:blur-[130px]
        "
      />

      <div
        className="
          relative
          z-10
          grid
          gap-5

          lg:grid-cols-[0.8fr_1.2fr]
          lg:gap-8
        "
      >
        {/* LEFT SIDE */}

        <div
          className="
            flex
            flex-col
            justify-between
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--card)]
            p-4

            sm:rounded-3xl
            sm:p-6
          "
        >
          {/* Album */}

          <div>
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              <img
                src={album1}
                alt="Midnight Feelings"
                className="
                  aspect-square
                  w-full
                  object-cover
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/60
                  via-transparent
                  to-transparent
                "
              />
            </motion.div>

            {/* Song Information */}

            <div className="mt-5 sm:mt-6">
              <p className="text-sm font-medium text-violet-500">
                Now Playing
              </p>

              <h3
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-[var(--text-primary)]

                  sm:text-3xl
                "
              >
                Midnight Feelings
              </h3>

              <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
                VerseHana • Late Night
              </p>
            </div>
          </div>

          {/* Player */}

          <div className="mt-7 sm:mt-8">
            {/* Progress */}

            <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "48%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-violet-500
                  to-fuchsia-500
                "
              />
            </div>

            <div
              className="
                mt-2
                flex
                justify-between
                text-xs
                text-[var(--text-muted)]
              "
            >
              <span>2:14</span>
              <span>4:36</span>
            </div>

            {/* Controls */}

            <div className="mt-5 flex items-center justify-between">
              <button
                aria-label="Like song"
                className="
                  text-[var(--text-secondary)]
                  transition
                  hover:text-violet-500
                "
              >
                <HiHeart className="text-xl" />
              </button>

              <button
                aria-label="Pause"
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--text-primary)]
                  text-[var(--background)]
                  transition
                  hover:scale-105
                "
              >
                <HiPause className="text-xl" />
              </button>

              <button
                aria-label="Volume"
                className="
                  text-[var(--text-secondary)]
                  transition
                  hover:text-violet-500
                "
              >
                <HiSpeakerWave className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — LYRICS */}

        <div
          className="
            relative
            flex
            min-h-[480px]
            flex-col
            justify-center
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--card)]
            px-5
            py-16

            sm:min-h-[500px]
            sm:rounded-3xl
            sm:px-10
            sm:py-20
          "
        >
          {/* Header */}

          <div
            className="
              absolute
              left-5
              right-5
              top-5
              flex
              items-center
              justify-between

              sm:left-10
              sm:right-10
              sm:top-6
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-violet-500
                "
              >
                Lyrics
              </p>

              <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">
                Midnight Feelings
              </p>
            </div>

            {/* Audio Visualization */}

            <div className="flex items-center gap-1">
              {[4, 7, 5, 9, 6, 10, 5, 8].map((height, index) => (
                <motion.span
                  key={index}
                  animate={{
                    height: [
                      `${height}px`,
                      `${height + 7}px`,
                      `${height}px`,
                    ],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: index * 0.08,
                  }}
                  className="w-1 rounded-full bg-violet-500"
                />
              ))}
            </div>
          </div>

          {/* Lyrics */}

          <div className="space-y-5 sm:space-y-6">
            {lyrics.map((line, index) => (
              <motion.p
                key={line.text}
                initial={{ opacity: 0, x: 15 }}
                whileInView={{
                  opacity: line.active ? 1 : 0.28,
                  x: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className={`
                  text-lg
                  font-medium
                  leading-relaxed
                  transition

                  sm:text-2xl

                  lg:text-3xl

                  ${
                    line.active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]"
                  }
                `}
              >
                {line.text}
              </motion.p>
            ))}
          </div>

          {/* Bottom Hint */}

          <div
            className="
              absolute
              bottom-5
              left-5
              right-5
              flex
              items-center
              justify-between
              text-[10px]
              text-[var(--text-muted)]

              sm:bottom-6
              sm:left-10
              sm:right-10
              sm:text-xs
            "
          >
            <span>VerseHana Lyrics</span>

            <span>● Live sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LyricsPreview;