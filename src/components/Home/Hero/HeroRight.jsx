import { motion } from "framer-motion";
import Vinyl from "./Vinyl";

import album1 from "../../../assets/albums/album1.jpg";
import album2 from "../../../assets/albums/album2.jpg";
import album3 from "../../../assets/albums/album3.jpg";
import album4 from "../../../assets/albums/album4.jpg";

function HeroRight() {
  return (
    <div
      className="
        relative
        flex
        h-[430px]
        w-full
        max-w-[430px]
        items-center
        justify-center

        sm:h-[500px]
        sm:max-w-[500px]

        md:h-[540px]
        md:max-w-[560px]

        lg:h-[600px]
        lg:w-[600px]
        lg:max-w-none

        xl:h-[650px]
        xl:w-[650px]
      "
    >
      {/* ================= BACKGROUND GLOW ================= */}

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
        className="
          pointer-events-none
          absolute
          h-[280px]
          w-[280px]
          rounded-full
          bg-violet-600/20
          blur-[100px]

          sm:h-[350px]
          sm:w-[350px]
          sm:blur-[120px]

          lg:h-[450px]
          lg:w-[450px]
          lg:blur-[140px]
        "
      />

      {/* ================= ALBUM + VINYL ================= */}

      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="
          relative
          flex
          items-center
          justify-center
        "
      >
        {/* ================= VINYL ================= */}

        <motion.div
          variants={{
            rest: {
              x: 35,
            },
            hover: {
              x: 5,
            },
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-0
            z-10

            sm:translate-x-4

            lg:translate-x-0
          "
        >
          <Vinyl />
        </motion.div>

        {/* ================= MAIN ALBUM ================= */}

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
          className="
            relative
            z-20
            ml-20
            w-[230px]
            overflow-hidden
            rounded-[24px]
            border
            border-[var(--border)]
            bg-[var(--card)]/80
            shadow-[0_25px_60px_rgba(0,0,0,0.35)]
            backdrop-blur-2xl

            sm:ml-24
            sm:w-[270px]
            sm:rounded-[28px]

            md:ml-28
            md:w-[300px]

            lg:ml-32
            lg:w-[320px]

            xl:ml-36
            xl:w-[330px]
          "
        >
          <img
            src={album1}
            alt="Midnight Feelings album artwork"
            className="
              h-[230px]
              w-full
              object-cover

              sm:h-[270px]

              md:h-[300px]

              lg:h-[325px]

              xl:h-[340px]
            "
          />

          <div
            className="
              p-4

              sm:p-5

              lg:p-6
            "
          >
            <p
              className="
                text-xs
                font-medium
                text-violet-500

                dark:text-violet-400

                sm:text-sm
              "
            >
              Now Playing
            </p>

            <h3
              className="
                mt-1
                text-lg
                font-bold
                text-[var(--text-primary)]

                sm:text-xl

                lg:text-2xl
              "
            >
              Midnight Feelings
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-[var(--text-secondary)]

                sm:mt-2
                sm:text-sm
              "
            >
              Late Night • Chill • Lofi
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ================= FLOATING ALBUM TOP ================= */}

      <motion.img
        src={album2}
        alt=""
        aria-hidden="true"
        animate={{
          y: [0, -18, 0],
          rotate: [10, 18, 10],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          right-2
          top-8
          h-20
          w-20
          rounded-xl
          border
          border-[var(--border)]
          object-cover
          shadow-2xl

          sm:right-4
          sm:top-10
          sm:h-24
          sm:w-24
          sm:rounded-2xl

          md:h-28
          md:w-28

          lg:right-4
          lg:h-28
          lg:w-28
        "
      />

      {/* ================= FLOATING ALBUM LEFT ================= */}

      <motion.img
        src={album3}
        alt=""
        aria-hidden="true"
        animate={{
          y: [0, 16, 0],
          rotate: [-12, -18, -12],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-20
          left-1
          h-24
          w-24
          rounded-xl
          border
          border-[var(--border)]
          object-cover
          shadow-2xl

          sm:bottom-24
          sm:left-4
          sm:h-28
          sm:w-28
          sm:rounded-2xl

          md:h-32
          md:w-32

          lg:left-6
          lg:h-32
          lg:w-32
        "
      />

      {/* ================= FLOATING ALBUM BOTTOM ================= */}

      <motion.img
        src={album4}
        alt=""
        aria-hidden="true"
        animate={{
          y: [0, -12, 0],
          rotate: [8, 14, 8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-4
          right-4
          h-20
          w-20
          rounded-xl
          border
          border-[var(--border)]
          object-cover
          shadow-2xl

          sm:bottom-6
          sm:right-8
          sm:h-22
          sm:w-22

          md:h-24
          md:w-24

          lg:right-12
          lg:h-24
          lg:w-24
        "
      />

      {/* ================= MINI PLAYER ================= */}

      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="
          absolute
          bottom-0
          right-1
          z-30
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]/90
          px-3
          py-3
          shadow-2xl
          backdrop-blur-xl

          sm:right-2
          sm:rounded-2xl
          sm:px-4
          sm:py-3

          md:right-4
          md:px-5
          md:py-4
        "
      >
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Equalizer */}

          <div className="flex gap-1">
            <span className="h-3 w-1 animate-pulse rounded-full bg-violet-400 sm:h-4" />
            <span className="h-5 w-1 animate-pulse rounded-full bg-violet-500 sm:h-7" />
            <span className="h-4 w-1 animate-pulse rounded-full bg-fuchsia-400 sm:h-5" />
            <span className="h-5 w-1 animate-pulse rounded-full bg-violet-500 sm:h-6" />
          </div>

          {/* Track */}

          <div>
            <p
              className="
                text-[10px]
                text-[var(--text-muted)]

                sm:text-xs
              "
            >
              Now Playing
            </p>

            <h4
              className="
                text-xs
                font-semibold
                text-[var(--text-primary)]

                sm:text-sm
              "
            >
              Midnight Feelings
            </h4>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default HeroRight;