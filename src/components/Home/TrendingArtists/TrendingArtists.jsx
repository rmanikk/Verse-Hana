import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";

import { artists } from "../../../data/artists";
import Artist from "./Artist";

function TrendingArtists() {
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
      {/* Background Glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            left-[-140px]
            top-20
            h-[280px]
            w-[280px]
            rounded-full
            bg-fuchsia-600/10
            blur-[120px]

            sm:left-[-180px]
            sm:h-[360px]
            sm:w-[360px]
            sm:blur-[150px]
          "
        />

        <div
          className="
            absolute
            right-[-140px]
            bottom-10
            h-[280px]
            w-[280px]
            rounded-full
            bg-violet-600/10
            blur-[120px]

            sm:right-[-180px]
            sm:h-[360px]
            sm:w-[360px]
            sm:blur-[150px]
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
        {/* Section Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: 35,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            flex
            flex-col
            gap-5

            lg:flex-row
            lg:items-end
            lg:justify-between
            lg:gap-10
          "
        >
          {/* Heading Content */}

          <div className="max-w-3xl">

            <span
              className="
                inline-flex
                rounded-full
                border
                border-fuchsia-500/30
                bg-fuchsia-500/10
                px-4
                py-2
                text-xs
                font-medium
                text-fuchsia-500

                sm:px-5
                sm:text-sm
              "
            >
              🎤 Trending Artists
            </span>

            <h2
              className="
                mt-5
                text-3xl
                font-bold
                leading-tight
                text-[var(--text-primary)]

                sm:mt-6
                sm:text-4xl

                md:text-5xl

                lg:text-6xl
              "
            >
              Voices that

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-fuchsia-500
                  via-violet-500
                  to-pink-500
                  bg-clip-text
                  text-transparent
                "
              >
                move you.
              </span>
            </h2>

            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-[var(--text-secondary)]

                sm:mt-5
                sm:text-base
                sm:leading-8

                lg:text-lg
              "
            >
              Discover artists whose music connects with millions of
              listeners and every kind of emotion.
            </p>

          </div>

          {/* Explore Button */}

          <button
            type="button"
            className="
              group
              flex
              w-fit
              shrink-0
              items-center
              gap-2
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
              px-5
              py-3
              text-sm
              font-semibold
              text-[var(--text-primary)]
              backdrop-blur-xl
              transition-all
              duration-300

              hover:border-violet-500
              hover:bg-violet-500/10
              hover:text-violet-500

              sm:px-6
            "
          >
            Explore Artists

            <HiArrowRight
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>

        </motion.div>

        {/* Artist Grid */}

        <div
          className="
            mt-9
            grid
            grid-cols-1
            gap-5

            sm:mt-12
            sm:grid-cols-2
            sm:gap-6

            lg:grid-cols-4
            lg:gap-7

            xl:gap-8
          "
        >
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
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
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="h-full"
            >
              <Artist artist={artist} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingArtists;