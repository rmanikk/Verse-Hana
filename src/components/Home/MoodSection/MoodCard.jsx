import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";

function MoodCard({ mood }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{
        duration: 0.3,
      }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-lg"
    >
      {/* Gradient Glow */}

      <div
        className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-20`}
      />

      {/* Content */}

      <div className="relative z-10">

        <div className="text-5xl">
          {mood.emoji}
        </div>

        <h3 className="mt-6 text-2xl font-bold text-white">
          {mood.title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          {mood.description}
        </p>

        <div className="mt-8 flex items-center justify-between">

          <span className="text-sm font-medium text-violet-400">
            {mood.songs}
          </span>

          <motion.div
            whileHover={{ x: 4 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-violet-600"
          >
            <HiArrowRight className="text-lg text-white" />
          </motion.div>

        </div>

      </div>

      {/* Border Glow */}

      <div className="absolute inset-0 rounded-3xl border border-transparent transition-all duration-300 group-hover:border-violet-500/40" />

    </motion.div>
  );
}

export default MoodCard;