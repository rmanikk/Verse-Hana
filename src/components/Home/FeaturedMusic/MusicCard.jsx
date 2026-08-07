import { motion } from "framer-motion";
import { HiPlay, HiHeart, HiStar } from "react-icons/hi2";

function MusicCard({ playlist }) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        transition: { duration: 0.25 },
      }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl"
    >
      {/* Album Cover */}
      <div className="relative overflow-hidden">

        <motion.img
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
          src={playlist.cover}
          alt={playlist.title}
          className="h-72 w-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 transition duration-300 group-hover:opacity-100" />

        {/* Play Button */}
        <motion.button
          initial={{ scale: 0 }}
          whileHover={{ scale: 1.1 }}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-violet-600 text-white opacity-0 shadow-2xl transition-all duration-300 group-hover:opacity-100"
        >
          <HiPlay className="ml-1 text-3xl" />
        </motion.button>

        {/* Favorite */}
        <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-violet-600">
          <HiHeart />
        </button>

        {/* Mood Badge */}
        <div className="absolute bottom-4 left-4 rounded-full bg-violet-600/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl">
          {playlist.mood}
        </div>

      </div>

      {/* Card Content */}
      <div className="p-6">

        <h3 className="text-2xl font-bold text-[var(--text-primary)]">
          {playlist.title}
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          {playlist.artist}
        </p>

        {/* Info */}
        <div className="mt-6 flex items-center justify-between">

          <div>
            <p className="text-sm text-gray-400">
              {playlist.songs} Songs
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {playlist.duration}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-400">
            <HiStar />
            <span className="font-semibold">
              {playlist.rating}
            </span>
          </div>

        </div>

      </div>

    </motion.div>
  );
}

export default MusicCard;