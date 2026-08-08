import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";

import { artists } from "../../../data/artists";
import Artist from "./Artist";

function TrendingArtists() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">

      {/* Background Glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-[-180px] top-20 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[160px]" />

        <div className="absolute right-[-180px] bottom-10 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[160px]" />

      </div>

      <div className="relative mx-auto max-w-[1450px] px-8 lg:px-12">

        {/* Section Header */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >

          <div>

            <span className="inline-flex rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-5 py-2 text-sm font-medium text-fuchsia-400">
              🎤 Trending Artists
            </span>

            <h2 className="mt-8 text-5xl font-bold leading-tight text-[var(--text-primary)] lg:text-6xl">
              Voices that
              <span className="block bg-gradient-to-r from-fuchsia-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                move you.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Discover artists whose music connects with millions of
              listeners and every kind of emotion.
            </p>

          </div>

          <button className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition hover:border-violet-500 hover:bg-violet-500/10">
            Explore Artists
            <HiArrowRight />
          </button>

        </motion.div>

        {/* Artist Grid */}

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
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