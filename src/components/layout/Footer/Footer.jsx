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
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--background)]">

      {/* Background Glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-[-250px] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[150px] sm:h-[500px] sm:w-[500px] sm:blur-[170px]" />
      </div>

      <div className="relative mx-auto max-w-[1450px] px-5 sm:px-8 lg:px-12">

        {/* Main Footer */}

        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-14">

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

            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
              Music that understands your emotions. Discover songs,
              artists, lyrics, and moods that feel like you.
            </p>

            {/* Social */}

            <div className="mt-7 flex items-center gap-3">

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="Spotify"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400"
              >
                <FaSpotify />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400"
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
                    className="text-sm text-[var(--text-secondary)] transition hover:text-violet-400"
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
                    className="text-sm text-[var(--text-secondary)] transition hover:text-violet-400"
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

            <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">
              Get new music discoveries, mood playlists, and VerseHana
              updates.
            </p>

            <div className="mt-5 flex items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 backdrop-blur-xl">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--text-muted)]">
                <HiEnvelope />
              </div>

              <input
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />

              <button className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500">
                Join
              </button>

            </div>
          </div>

        </div>

        {/* Bottom */}

        <div className="flex flex-col gap-5 border-t border-[var(--border)] py-7 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">

          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} VerseHana. All rights reserved.
          </p>

          <div className="flex items-center justify-center">
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
            className="flex items-center justify-center gap-2 text-[var(--text-secondary)] transition hover:text-violet-400"
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