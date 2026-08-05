import { motion } from "framer-motion";
import Vinyl from "./Vinyl";

import album1 from "../../../assets/albums/album1.jpg";
import album2 from "../../../assets/albums/album2.jpg";
import album3 from "../../../assets/albums/album3.jpg";
import album4 from "../../../assets/albums/album4.jpg";

function HeroRight() {
  return (
    <div className="relative hidden h-[650px] w-[650px] lg:flex items-center justify-center">

      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-[450px] w-[450px] rounded-full bg-violet-600/20 blur-[140px]"
      />

      {/* Album + Vinyl */}
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="relative flex items-center justify-center"
      >

        {/* Vinyl */}

        <motion.div
          variants={{
            rest: {
              x: 70,
            },
            hover: {
              x: 20,
            },
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="absolute left-0 z-10"
        >
          <Vinyl />
        </motion.div>

        {/* Album Card */}

        <motion.div
          variants={{
            rest: {
              rotate: -4,
              y: 0,
              scale: 1,
            },
            hover: {
              rotate: -1,
              y: -10,
              scale: 1.03,
            },
          }}
          transition={{
            duration: 0.45,
          }}
          className="relative ml-36 z-20 w-[330px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_35px_80px_rgba(0,0,0,0.65)]"
        >
          <img
            src={album1}
            alt="Album"
            className="h-[340px] w-full object-cover"
          />

          <div className="p-6">

            <p className="text-sm text-violet-400">
              Now Playing
            </p>

            <h3 className="mt-2 text-2xl font-bold text-white">
              Midnight Feelings
            </h3>

            <p className="mt-2 text-gray-400">
              Late Night • Chill • Lofi
            </p>

          </div>

        </motion.div>

      </motion.div>

      {/* Floating Album Top */}

      <motion.img
        src={album2}
        alt=""
        animate={{
          y: [0, -18, 0],
          rotate: [10, 18, 10],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-4 top-10 h-28 w-28 rounded-2xl border border-white/10 shadow-2xl"
      />

      {/* Floating Album Left */}

      <motion.img
        src={album3}
        alt=""
        animate={{
          y: [0, 16, 0],
          rotate: [-12, -18, -12],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-24 left-6 h-32 w-32 rounded-2xl border border-white/10 shadow-2xl"
      />

      {/* Floating Album Bottom */}

      <motion.img
        src={album4}
        alt=""
        animate={{
          y: [0, -12, 0],
          rotate: [8, 14, 8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-8 right-12 h-24 w-24 rounded-2xl border border-white/10 shadow-2xl"
      />

      {/* Mini Player */}

      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="absolute bottom-2 right-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl shadow-2xl"
      >

        <div className="flex items-center gap-4">

          <div className="flex gap-1">

            <span className="h-4 w-1 animate-pulse rounded-full bg-violet-400"></span>
            <span className="h-7 w-1 animate-pulse rounded-full bg-violet-500"></span>
            <span className="h-5 w-1 animate-pulse rounded-full bg-fuchsia-400"></span>
            <span className="h-6 w-1 animate-pulse rounded-full bg-violet-500"></span>

          </div>

          <div>

            <p className="text-xs text-gray-400">
              Now Playing
            </p>

            <h4 className="font-semibold text-white">
              Midnight Feelings
            </h4>

          </div>

        </div>

      </motion.div>

    </div>
  );
}

export default HeroRight;