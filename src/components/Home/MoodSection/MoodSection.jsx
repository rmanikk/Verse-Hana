import { motion } from "framer-motion";

import MoodCard from "./MoodCard";
import { moods } from "../../../data/moods";

function MoodSection() {
  return (
    <section className="relative py-28">

      {/* Background Glow */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute left-0 top-20 h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute right-0 bottom-10 h-[350px] w-[350px] rounded-full bg-fuchsia-600/10 blur-[140px]" />

      </div>

      <div className="relative mx-auto max-w-[1450px] px-8 lg:px-12">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >

          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-400">
            🎧 Browse by Emotion
          </span>

          <h2 className="mt-8 text-5xl font-bold leading-tight text-[var(--text-primary)] lg:text-6xl">
            Every emotion
            <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              deserves its soundtrack.
            </span>
          </h2>

          <p className="mt-8 text-lg leading-8 text-gray-400">
            Explore curated playlists designed around how you feel.
            Whether you're celebrating, relaxing, studying, or simply
            enjoying the moment, VerseHana helps you find the perfect music.
          </p>

        </motion.div>

        {/* Mood Cards */}

        <div className="mt-20 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">

          {moods.map((mood, index) => (

            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
            >

              <MoodCard mood={mood} />

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default MoodSection;