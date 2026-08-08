import { motion } from "framer-motion";
import { HiArrowRight, HiSparkles } from "react-icons/hi2";

function CTA() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">

      {/* Ambient Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[180px]" />

        <div className="absolute left-1/4 top-1/3 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-[100px]" />

        <div className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-[100px]" />

      </div>

      <div className="relative mx-auto max-w-[1200px] px-8 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] px-6 py-20 text-center shadow-2xl backdrop-blur-2xl sm:px-10 lg:px-20"
        >

          {/* Decorative Glow */}

          <div className="absolute left-1/2 top-[-180px] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />

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
              className="mx-auto flex w-fit items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-400"
            >
              <HiSparkles />
              Your next favorite song is waiting
            </motion.div>

            {/* Heading */}

            <h2 className="mx-auto mt-8 max-w-4xl text-5xl font-bold leading-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl">

              Your mood has a
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                soundtrack.
              </span>

            </h2>

            {/* Description */}

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-400">
              Whether you're happy, heartbroken, focused, nostalgic, or
              somewhere in between, VerseHana helps you find the music
              that feels right.
            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

              <button className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30">

                Start Listening

                <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />

              </button>

              <button className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-[var(--text-primary)] backdrop-blur-xl transition duration-300 hover:border-violet-500/40 hover:bg-violet-500/10">

                Explore Moods

              </button>

            </div>

            {/* Small Trust Text */}

            <p className="mt-8 text-xs text-gray-600">
              Discover music differently • Follow your emotions • Find your sound
            </p>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default CTA;