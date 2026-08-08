import { motion } from "framer-motion";
import LyricsPreview from "./LyricsPreview";

function Lyrics() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[180px]" />

      </div>

      <div className="relative mx-auto max-w-[1450px] px-8 lg:px-12">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >

          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-400">
            🎤 Feel Every Word
          </span>

          <h2 className="mt-8 text-5xl font-bold leading-tight text-[var(--text-primary)] lg:text-6xl">
            Music you can
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              see and feel.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Follow every word with beautifully synchronized lyrics
            designed to keep you connected to the music.
          </p>

        </motion.div>

        {/* Lyrics Player */}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.15,
          }}
          className="mt-16"
        >
          <LyricsPreview />
        </motion.div>

      </div>

    </section>
  );
}

export default Lyrics;