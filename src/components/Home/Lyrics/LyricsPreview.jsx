import { motion } from "framer-motion";
import {
  HiHeart,
  HiPause,
  HiPlay,
  HiSpeakerWave,
} from "react-icons/hi2";

import album1 from "../../../assets/albums/album1.jpg";

function LyricsPreview() {
  const lyrics = [
    {
      text: "The city sleeps beneath the midnight sky",
      active: false,
    },
    {
      text: "And all the stars are watching from above",
      active: false,
    },
    {
      text: "I close my eyes and let the music carry me",
      active: true,
    },
    {
      text: "Somewhere between the silence and the sound",
      active: false,
    },
    {
      text: "I find a place where I can breathe again",
      active: false,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-2xl lg:p-8">

      {/* Ambient Glow */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-600/20 blur-[130px]" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[130px]" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

        {/* LEFT SIDE */}

        <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-black/20 p-6">

          {/* Album */}

          <div>

            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden rounded-3xl"
            >

              <img
                src={album1}
                alt="Midnight Feelings"
                className="aspect-square w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            </motion.div>

            {/* Song Information */}

            <div className="mt-6">

              <p className="text-sm font-medium text-violet-400">
                Now Playing
              </p>

              <h3 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
                Midnight Feelings
              </h3>

              <p className="mt-2 text-gray-400">
                VerseHana • Late Night
              </p>

            </div>

          </div>

          {/* Player */}

          <div className="mt-8">

            {/* Progress */}

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "48%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              />

            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>2:14</span>
              <span>4:36</span>
            </div>

            {/* Controls */}

            <div className="mt-5 flex items-center justify-between">

              <button className="text-gray-400 transition hover:text-white">
                <HiHeart className="text-xl" />
              </button>

              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition hover:scale-105">
                <HiPause className="text-xl" />
              </button>

              <button className="text-gray-400 transition hover:text-white">
                <HiSpeakerWave className="text-xl" />
              </button>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE — LYRICS */}

        <div className="relative flex min-h-[500px] flex-col justify-center rounded-3xl border border-white/10 bg-black/20 px-6 py-10 sm:px-10">

          {/* Header */}

          <div className="absolute left-6 right-6 top-6 flex items-center justify-between sm:left-10 sm:right-10">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                Lyrics
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Midnight Feelings
              </p>

            </div>

            <div className="flex items-center gap-1">

              {[4, 7, 5, 9, 6, 10, 5, 8].map((height, index) => (
                <motion.span
                  key={index}
                  animate={{
                    height: [`${height}px`, `${height + 7}px`, `${height}px`],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: index * 0.08,
                  }}
                  className="w-1 rounded-full bg-violet-400"
                />
              ))}

            </div>

          </div>

          {/* Lyrics */}

          <div className="mt-8 space-y-6">

            {lyrics.map((line, index) => (

              <motion.p
                key={line.text}
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: line.active ? 1 : 0.28, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className={`text-xl font-medium leading-relaxed transition sm:text-2xl lg:text-3xl ${
                  line.active
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {line.text}
              </motion.p>

            ))}

          </div>

          {/* Bottom Hint */}

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-gray-600 sm:left-10 sm:right-10">

            <span>VerseHana Lyrics</span>

            <span>● Live sync</span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LyricsPreview;