import { motion } from "framer-motion";
import {
  HiArrowUp,
  HiEnvelope,
  HiHeart,
} from "react-icons/hi2";
import {
  FaInstagram,
  FaSpotify,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

function Footer() {
  const discoverLinks = [
    "Discover",
    "Moods",
    "Artists",
    "Trending",
  ];

  const platformLinks = [
    "Features",
    "Lyrics",
    "Community",
    "About",
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10">

      {/* Background Glow */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute bottom-[-250px] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[170px]" />

      </div>

      <div className="relative mx-auto max-w-[1450px] px-8 lg:px-12">

        {/* Main Footer */}

        <div className="grid gap-14 py-20 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">

          {/* Brand */}

          <div>

            <a
              href="#"
              className="inline-flex items-center"
            >
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Verse
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Hana
                </span>
              </span>
            </a>

            <p className="mt-6 max-w-sm text-sm leading-7 text-gray-500">
              Music that understands your emotions. Discover songs,
              artists, lyrics, and moods that feel like you.
            </p>

            {/* Social */}

            <div className="mt-7 flex items-center gap-3">

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="Spotify"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
              >
                <FaSpotify />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
              >
                <FaGithub />
              </a>

            </div>

          </div>

          {/* Discover */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Discover
            </h3>

            <ul className="mt-6 space-y-4">

              {discoverLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition hover:text-violet-400"
                  >
                    {link}
                  </a>
                </li>
              ))}

            </ul>

          </div>

          {/* Platform */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              VerseHana
            </h3>

            <ul className="mt-6 space-y-4">

              {platformLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition hover:text-violet-400"
                  >
                    {link}
                  </a>
                </li>
              ))}

            </ul>

          </div>

          {/* Newsletter */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Stay in the mood
            </h3>

            <p className="mt-5 text-sm leading-6 text-gray-500">
              Get new music discoveries, mood playlists, and VerseHana
              updates.
            </p>

            <div className="mt-5 flex items-center rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-500">
                <HiEnvelope />
              </div>

              <input
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-gray-600"
              />

              <button className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500">
                Join
              </button>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="flex flex-col gap-5 border-t border-white/10 py-7 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} VerseHana. All rights reserved.
          </p>

          <div className="flex items-center gap-1">
            Made with
            <HiHeart className="mx-1 text-violet-500" />
            for music lovers.
          </div>

          <motion.button
            whileHover={{ y: -3 }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="flex items-center gap-2 text-gray-500 transition hover:text-white"
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