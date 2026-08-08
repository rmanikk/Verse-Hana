import { motion } from "framer-motion";
import { HiPlay, HiUserGroup } from "react-icons/hi2";

function Artist({ artist }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
    >
      {/* Artist Image */}

      <div className="relative overflow-hidden rounded-2xl">

        <motion.img
          src={artist.image}
          alt={artist.name}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5 }}
          className="h-72 w-full object-cover"
        />

        {/* Image Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Play Button */}

        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          whileHover={{ scale: 1.1 }}
          className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white opacity-0 shadow-xl transition-all duration-300 group-hover:opacity-100"
        >
          <HiPlay className="ml-0.5 text-xl" />
        </motion.button>

        {/* Mood */}

        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          {artist.mood}
        </div>

      </div>

      {/* Artist Information */}

      <div className="px-2 pb-3 pt-5">

        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          {artist.name}
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          {artist.genre}
        </p>

        <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
          <HiUserGroup className="text-violet-400" />
          <span>{artist.followers} followers</span>
        </div>

        {/* Bottom Accent */}

        <div className="mt-5 h-px w-8 bg-violet-500/40 transition-all duration-300 group-hover:w-full" />

      </div>

    </motion.div>
  );
}

export default Artist;