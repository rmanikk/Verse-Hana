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
    <section className="relative overflow-hidden py-16 sm:py-28 lg:py-24">
      {/* Background Glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            left-[-180px]
            top-1/3
            h-[300px]
            w-[300px]
            rounded-full
            bg-violet-600/10
            blur-[120px]

            sm:h-[400px]
            sm:w-[400px]
            sm:blur-[150px]
          "
        />

        <div
          className="
            absolute
            right-[-180px]
            bottom-0
            h-[300px]
            w-[300px]
            rounded-full
            bg-fuchsia-600/10
            blur-[120px]

            sm:h-[400px]
            sm:w-[400px]
            sm:blur-[150px]
          "
        />
      </div>

      {/* Container */}

      <div
        className="
          relative
          mx-auto
          max-w-[1450px]
          px-5

          sm:px-8
          lg:px-12
        "
      >
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
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
            ✨ Why VerseHana?
          </span>

          <h2
            className="
              mt-7
              text-3xl
              font-bold
              leading-tight
              text-[var(--text-primary)]

              sm:text-4xl
              md:text-5xl
              lg:mt-8
              lg:text-6xl
            "
          >
            More than just
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
              another music platform.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-[var(--text-secondary)]

              sm:mt-7
              sm:text-lg
              sm:leading-8
            "
          >
            VerseHana brings emotion, discovery, lyrics, and beautiful
            listening experiences together in one place.
          </p>
        </motion.div>

        {/* Feature Grid */}

        <div
          className="
            mt-14
            grid
            gap-5

            sm:mt-16
            sm:gap-6
            md:grid-cols-2
            lg:mt-20
            lg:grid-cols-4
          "
        >
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
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-[var(--border)]
                  bg-[var(--card)]
                  p-6
                  backdrop-blur-2xl
                  transition
                  duration-300
                  hover:border-violet-500/30

                  sm:p-7
                "
              >
                {/* Hover Glow */}

                <div
                  className="
                    absolute
                    -right-16
                    -top-16
                    h-40
                    w-40
                    rounded-full
                    bg-violet-600/0
                    blur-[70px]
                    transition
                    duration-500
                    group-hover:bg-violet-600/20
                  "
                />

                <div className="relative z-10">
                  {/* Icon */}

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-violet-500/20
                      bg-violet-500/10
                      text-xl
                      text-violet-500
                      transition
                      duration-300
                      group-hover:scale-110
                      group-hover:bg-violet-500/20

                      sm:h-14
                      sm:w-14
                      sm:text-2xl
                    "
                  >
                    <Icon />
                  </div>

                  {/* Tag */}

                  <p
                    className="
                      mt-6
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.15em]
                      text-violet-500

                      sm:mt-8
                      sm:text-xs
                    "
                  >
                    {feature.tag}
                  </p>

                  {/* Title */}

                  <h3
                    className="
                      mt-3
                      text-lg
                      font-bold
                      text-[var(--text-primary)]

                      sm:text-xl
                    "
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-[var(--text-secondary)]

                      sm:mt-4
                      sm:leading-7
                    "
                  >
                    {feature.description}
                  </p>

                  {/* Bottom Line */}

                  <div
                    className="
                      mt-7
                      h-px
                      w-10
                      bg-violet-500/40
                      transition-all
                      duration-300
                      group-hover:w-full

                      sm:mt-8
                    "
                  />
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