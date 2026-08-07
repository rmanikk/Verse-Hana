import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";

import { playlists } from "../../../data/playlists";
import MusicCard from "./MusicCard";

function FeaturedMusic() {
  return (
    <section className="relative py-28">

      {/* Background Glow */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute left-20 top-20 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute right-20 bottom-10 h-[300px] w-[300px] rounded-full bg-fuchsia-600/10 blur-[140px]" />

      </div>

      <div className="relative mx-auto max-w-[1450px] px-8 lg:px-12">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end"
        >

          <div>

            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-400">
              🎵 Featured Playlists
            </span>

            <h2 className="mt-8 text-5xl font-bold text-[var(--text-primary)]">
              Curated for
              <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                every moment.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Hand-picked playlists inspired by your emotions,
              favorite genres, and listening habits.
            </p>

          </div>

          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition hover:border-violet-500 hover:bg-violet-500/10">
            View All
            <HiArrowRight />
          </button>

        </motion.div>

        {/* Playlist Grid */}

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

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