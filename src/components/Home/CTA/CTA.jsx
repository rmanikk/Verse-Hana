import { motion } from "framer-motion";
import {
  HiArrowRight,
  HiSparkles,
} from "react-icons/hi2";

function CTA() {
  return (
    <section
      className="
        relative
        overflow-hidden
        py-12

        sm:py-16

        lg:py-20
      "
    >
      {/* Ambient Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[320px]
            w-[320px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-violet-600/10
            blur-[140px]

            sm:h-[500px]
            sm:w-[500px]
            sm:blur-[180px]
          "
        />

        <div
          className="
            absolute
            left-1/4
            top-1/3
            h-32
            w-32
            rounded-full
            bg-fuchsia-500/10
            blur-[80px]

            sm:h-40
            sm:w-40
            sm:blur-[100px]
          "
        />

        <div
          className="
            absolute
            bottom-1/3
            right-1/4
            h-32
            w-32
            rounded-full
            bg-indigo-500/10
            blur-[80px]

            sm:h-40
            sm:w-40
            sm:blur-[100px]
          "
        />

      </div>

      <div
        className="
          relative
          mx-auto
          max-w-[1200px]
          px-5

          sm:px-8

          lg:px-12
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-[var(--border)]
            bg-[var(--card)]
            px-5
            py-12
            text-center
            shadow-2xl
            backdrop-blur-2xl

            sm:rounded-[36px]
            sm:px-10
            sm:py-16

            lg:rounded-[40px]
            lg:px-20
            lg:py-20
          "
        >
          {/* Decorative Glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[-180px]
              h-[300px]
              w-[300px]
              -translate-x-1/2
              rounded-full
              bg-violet-600/15
              blur-[100px]

              sm:h-[400px]
              sm:w-[400px]
              sm:blur-[120px]
            "
          />

          <div className="relative z-10">

            {/* Badge */}

            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                mx-auto
                flex
                w-fit
                max-w-full
                items-center
                gap-2
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
              <HiSparkles className="shrink-0" />

              <span>
                Your next favorite song is waiting
              </span>
            </motion.div>

            {/* Heading */}

            <h2
              className="
                mx-auto
                mt-6
                max-w-4xl
                text-3xl
                font-bold
                leading-tight
                text-[var(--text-primary)]

                sm:mt-7
                sm:text-5xl

                md:text-6xl

                lg:text-7xl
              "
            >
              Your mood has a

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-violet-400
                  via-fuchsia-400
                  to-pink-400
                  bg-clip-text
                  text-transparent
                "
              >
                soundtrack.
              </span>
            </h2>

            {/* Description */}

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-base
                leading-7
                text-[var(--text-secondary)]

                sm:mt-6
                sm:text-lg
                sm:leading-8
              "
            >
              Whether you're happy, heartbroken, focused, nostalgic, or
              somewhere in between, VerseHana helps you find the music that
              feels right.
            </p>

            {/* Buttons */}

            <div
              className="
                mt-7
                flex
                flex-col
                items-center
                justify-center
                gap-3

                sm:mt-8
                sm:flex-row
                sm:gap-4
              "
            >
              <button
                type="button"
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-gradient-to-r
                  from-violet-600
                  via-purple-600
                  to-fuchsia-600
                  px-7
                  py-3.5
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-violet-500/20
                  transition
                  duration-300

                  hover:scale-105
                  hover:shadow-xl
                  hover:shadow-violet-500/30

                  sm:w-auto
                  sm:px-8
                  sm:py-4
                "
              >
                Start Listening

                <HiArrowRight
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>

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
                  font-semibold
                  text-[var(--text-primary)]
                  backdrop-blur-xl
                  transition
                  duration-300

                  hover:border-violet-500/40
                  hover:bg-violet-500/10

                  sm:w-auto
                  sm:px-8
                  sm:py-4
                "
              >
                Explore Moods
              </button>
            </div>

            {/* Trust Text */}

            <p
              className="
                mt-6
                text-[11px]
                leading-5
                text-[var(--text-muted)]

                sm:mt-7
                sm:text-xs
              "
            >
              Discover music differently • Follow your emotions • Find your
              sound
            </p>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTA;