import { motion } from "framer-motion";
import {
  HiHeart,
  HiSparkles,
  HiMusicalNote,
  HiMicrophone,
} from "react-icons/hi2";

const features = [
  {
    icon: HiHeart,
    title: "Emotion-Based Discovery",
    description:
      "Find music that matches how you feel instead of endlessly searching through genres and playlists.",
    tag: "Discover by feeling",
  },
  {
    icon: HiSparkles,
    title: "Smart Recommendations",
    description:
      "VerseHana learns from your listening patterns to surface songs and playlists that fit your moment.",
    tag: "Made for you",
  },
  {
    icon: HiMicrophone,
    title: "Synced Lyrics",
    description:
      "Follow your favorite songs with beautifully presented lyrics that move naturally with the music.",
    tag: "Feel every word",
  },
  {
    icon: HiMusicalNote,
    title: "Immersive Experience",
    description:
      "A cinematic interface, ambient visuals, and thoughtful interactions designed to make listening feel special.",
    tag: "Listen differently",
  },
];

function Features() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">

      {/* Background Glow */}

      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute left-[-150px] top-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div className="absolute right-[-150px] bottom-0 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

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
            ✨ Why VerseHana?
          </span>

          <h2 className="mt-8 text-5xl font-bold leading-tight text-[var(--text-primary)] lg:text-6xl">
            More than just
            <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              another music platform.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-400">
            VerseHana brings emotion, discovery, lyrics, and beautiful
            listening experiences together in one place.
          </p>

        </motion.div>

        {/* Feature Grid */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-2xl transition duration-300 hover:border-violet-500/30"
              >

                {/* Hover Glow */}

                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-600/0 blur-[70px] transition duration-500 group-hover:bg-violet-600/20" />

                <div className="relative z-10">

                  {/* Icon */}

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-2xl text-violet-400 transition duration-300 group-hover:scale-110 group-hover:bg-violet-500/20">
                    <Icon />
                  </div>

                  {/* Tag */}

                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
                    {feature.tag}
                  </p>

                  {/* Title */}

                  <h3 className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                    {feature.title}
                  </h3>

                  {/* Description */}

                  <p className="mt-4 text-sm leading-7 text-gray-400">
                    {feature.description}
                  </p>

                  {/* Bottom Line */}

                  <div className="mt-8 h-px w-10 bg-violet-500/40 transition-all duration-300 group-hover:w-full" />

                </div>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}

export default Features;