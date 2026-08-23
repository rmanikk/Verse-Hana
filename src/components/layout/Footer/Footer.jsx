import { motion } from "framer-motion";
import {
  HiArrowUp,
  HiHeart,
} from "react-icons/hi2";

import {
  FaInstagram,
  FaSpotify,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--background)]">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            bottom-[-220px]
            left-1/2
            h-[350px]
            w-[350px]
            -translate-x-1/2
            rounded-full
            bg-violet-600/10
            blur-[130px]

            sm:bottom-[-250px]
            sm:h-[500px]
            sm:w-[500px]
            sm:blur-[170px]
          "
        />
      </div>

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[1450px]
          px-5

          sm:px-8

          lg:px-12

          xl:px-16
        "
      >

        {/* =================================================
            MAIN FOOTER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            items-center
            py-12
            text-center

            sm:py-16

            lg:items-start
            lg:text-left
            lg:py-20
          "
        >

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="w-full">

            <a
              href="#"
              className="
                inline-flex
                items-center
                justify-center

                lg:justify-start
              "
            >
              <span
                className="
                  text-3xl
                  font-extrabold
                  tracking-tight
                  text-[var(--text-primary)]

                  sm:text-4xl
                "
              >
                Verse
                <span
                  className="
                    bg-gradient-to-r
                    from-violet-400
                    to-fuchsia-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  Hana
                </span>
              </span>
            </a>

            {/* Description */}

            <p
              className="
                mx-auto
                mt-5
                max-w-lg
                text-sm
                leading-7
                text-[var(--text-secondary)]

                lg:mx-0
                lg:max-w-xl

                sm:text-base
              "
            >
              Music that understands your emotions.
              Discover songs, artists, lyrics, and moods
              that feel like you.
            </p>

            {/* =================================================
                SOCIAL
            ================================================= */}

            <div
              className="
                mt-7
                flex
                items-center
                justify-center
                gap-3

                lg:justify-start
              "
            >

              {/* Instagram */}

              <a
                href="#"
                aria-label="Instagram"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  text-[var(--text-secondary)]
                  transition-all
                  duration-300

                  hover:border-violet-500/40
                  hover:bg-violet-500/10
                  hover:text-violet-400

                  sm:h-11
                  sm:w-11
                "
              >
                <FaInstagram />
              </a>

              {/* Spotify */}

              <a
                href="#"
                aria-label="Spotify"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  text-[var(--text-secondary)]
                  transition-all
                  duration-300

                  hover:border-violet-500/40
                  hover:bg-violet-500/10
                  hover:text-violet-400

                  sm:h-11
                  sm:w-11
                "
              >
                <FaSpotify />
              </a>

              {/* YouTube */}

              <a
                href="#"
                aria-label="YouTube"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  text-[var(--text-secondary)]
                  transition-all
                  duration-300

                  hover:border-violet-500/40
                  hover:bg-violet-500/10
                  hover:text-violet-400

                  sm:h-11
                  sm:w-11
                "
              >
                <FaYoutube />
              </a>

              {/* GitHub */}

              <a
                href="#"
                aria-label="GitHub"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  text-[var(--text-secondary)]
                  transition-all
                  duration-300

                  hover:border-violet-500/40
                  hover:bg-violet-500/10
                  hover:text-violet-400

                  sm:h-11
                  sm:w-11
                "
              >
                <FaGithub />
              </a>

            </div>

          </div>

        </div>

        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            gap-5
            border-t
            border-[var(--border)]
            py-6
            text-sm
            text-[var(--text-muted)]

            sm:py-7

            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:gap-6
          "
        >

          {/* Copyright */}

          <p
            className="
              text-center
              leading-6

              lg:text-left
            "
          >
            © {new Date().getFullYear()} VerseHana.
            All rights reserved.
          </p>

          {/* Made with */}

          <div
            className="
              flex
              items-center
              justify-center
              text-center
              leading-6
            "
          >
            Made with

            <HiHeart
              className="
                mx-1
                shrink-0
                text-violet-500
              "
            />

            for music lovers.
          </div>

          {/* Back To Top */}

          <motion.button
            type="button"
            whileHover={{
              y: -3,
            }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="
              flex
              items-center
              justify-center
              gap-2
              text-[var(--text-secondary)]
              transition-colors
              duration-300

              hover:text-violet-400
            "
          >
            Back to top

            <HiArrowUp />
          </motion.button>

        </div>

      </div>
    </footer>
  );
}

export default Footer;