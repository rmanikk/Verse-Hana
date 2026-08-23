import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import { playlists } from "../../../data/playlists";
import MusicCard from "./MusicCard";

function FeaturedMusic() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/login");
  };

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
            left-[-80px]
            top-20
            h-[280px]
            w-[280px]
            rounded-full
            bg-violet-600/10
            blur-[120px]

            sm:left-20
            sm:h-[300px]
            sm:w-[300px]
          "
        />

        <div
          className="
            absolute
            right-[-80px]
            bottom-10
            h-[280px]
            w-[280px]
            rounded-full
            bg-fuchsia-600/10
            blur-[120px]

            sm:right-20
            sm:h-[300px]
            sm:w-[300px]
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
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="
            flex
            flex-col
            items-start
            justify-between
            gap-7

            lg:flex-row
            lg:items-end
            lg:gap-10
          "
        >
          <div className="max-w-3xl">

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
              🎵 Featured Playlists
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
              Curated for

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
                every moment.
              </span>
            </h2>

            {/* Description */}

            <p
              className="
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
              Hand-picked playlists inspired by your emotions,
              favorite genres, and listening habits.
            </p>

          </div>

          {/* View All */}

          <button
            type="button"
            onClick={handleViewAll}
            className="
              group
              flex
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
            View All

            <HiArrowRight
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        </motion.div>

        {/* Playlist Grid */}

        <div
          className="
            mt-12
            grid
            grid-cols-1
            gap-5

            sm:mt-16
            sm:grid-cols-2
            sm:gap-6

            lg:gap-7

            xl:grid-cols-4
            xl:gap-8
          "
        >
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              className="h-full"
            >
              <MusicCard playlist={playlist} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedMusic;