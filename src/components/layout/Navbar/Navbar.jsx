import { useState, useEffect } from "react";
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiBars3,
  HiXMark,
} from "react-icons/hi2";

import logoDark from "../../../assets/logo/versehana-white.png";
import logoLight from "../../../assets/logo/versehana-black.png";

function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigation Links
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Discover", href: "#discover" },
    { name: "Moods", href: "#moods" },
    { name: "Artists", href: "#artists" },
    { name: "Lyrics", href: "#lyrics" },
  ];

  /* ---------------- SCROLL ---------------- */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ---------------- INITIAL DARK THEME ---------------- */

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  /* ---------------- THEME TOGGLE ---------------- */

  const toggleTheme = () => {
    const newTheme = !isDark;

    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  /* ---------------- CLOSE MOBILE MENU ---------------- */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className={`
        fixed left-0 top-0 z-50 w-full
        transition-all duration-300
        ${
          scrolled
            ? "border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl"
            : "bg-transparent"
        }
      `}
    >
      {/* ================= CONTAINER ================= */}

      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">

        <nav className="flex h-20 items-center justify-between">

          {/* ================= LOGO ================= */}

          <a
            href="#home"
            onClick={closeMenu}
            className="flex shrink-0 items-center"
          >
            <img
              src={isDark ? logoLight : logoDark}
              alt="VerseHana"
              className="
                h-10 w-10
                object-contain
                transition duration-300
                hover:scale-110
                sm:h-11 sm:w-11
                lg:h-12 lg:w-12
              "
            />
          </a>

          {/* ================= DESKTOP NAVIGATION ================= */}

          <ul className="hidden items-center gap-8 lg:flex xl:gap-10 2xl:gap-12">

            {navLinks.map((item) => (
              <li key={item.name}>

                <a
                  href={item.href}
                  className="
                    group relative
                    text-sm font-medium tracking-wide
                    text-[var(--text-primary)]
                    transition
                    hover:text-violet-500
                    xl:text-[15px]
                  "
                >
                  {item.name}

                  <span
                    className="
                      absolute -bottom-2 left-0
                      h-0.5 w-0
                      rounded-full
                      bg-violet-500
                      transition-all duration-300
                      group-hover:w-full
                    "
                  />
                </a>

              </li>
            ))}

          </ul>

          {/* ================= DESKTOP ACTIONS ================= */}

          <div className="hidden items-center gap-4 lg:flex xl:gap-5">

            {/* Theme Toggle */}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                border border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--text-primary)]
                transition duration-300
                hover:border-violet-500
                hover:bg-violet-500/10
              "
            >
              {isDark ? (
                <HiOutlineSun size={19} />
              ) : (
                <HiOutlineMoon size={19} />
              )}
            </button>

            {/* Login */}

            <button
              className="
                text-sm font-medium
                text-[var(--text-primary)]
                transition
                hover:text-violet-500
              "
            >
              Login
            </button>

            {/* Sign Up */}

            <button
              className="
                rounded-full
                bg-gradient-to-r
                from-violet-600
                via-purple-600
                to-fuchsia-600
                px-5 py-2.5
                text-sm font-semibold
                text-white
                transition duration-300
                hover:scale-105
                hover:shadow-lg
                hover:shadow-violet-500/30
                xl:px-6
              "
            >
              Sign Up
            </button>

          </div>

          {/* ================= MOBILE ACTIONS ================= */}

          <div className="flex items-center gap-2 lg:hidden">

            {/* Theme Toggle */}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                border border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--text-primary)]
                transition duration-300
                hover:border-violet-500
                hover:bg-violet-500/10
              "
            >
              {isDark ? (
                <HiOutlineSun size={19} />
              ) : (
                <HiOutlineMoon size={19} />
              )}
            </button>

            {/* Hamburger */}

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                border border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--text-primary)]
                transition duration-300
                hover:border-violet-500
                hover:bg-violet-500/10
              "
            >
              {menuOpen ? (
                <HiXMark size={22} />
              ) : (
                <HiBars3 size={22} />
              )}
            </button>

          </div>

        </nav>

        {/* ================= MOBILE MENU ================= */}

        <div
          className={`
            overflow-hidden
            transition-all duration-300
            lg:hidden
            ${
              menuOpen
                ? "max-h-[500px] pb-5 opacity-100"
                : "max-h-0 pb-0 opacity-0"
            }
          `}
        >
          <div
            className="
              rounded-2xl
              border border-[var(--border)]
              bg-[var(--surface)]/95
              p-4
              shadow-2xl
              backdrop-blur-xl
            "
          >

            {/* Navigation Links */}

            <ul className="space-y-1">

              {navLinks.map((item) => (
                <li key={item.name}>

                  <a
                    href={item.href}
                    onClick={closeMenu}
                    className="
                      block
                      rounded-xl
                      px-4 py-3
                      text-sm font-medium
                      text-[var(--text-primary)]
                      transition
                      hover:bg-violet-500/10
                      hover:text-violet-500
                    "
                  >
                    {item.name}
                  </a>

                </li>
              ))}

            </ul>

            {/* Divider */}

            <div className="my-3 h-px bg-[var(--border)]" />

            {/* Mobile Buttons */}

            <div className="flex gap-3">

              <button
                onClick={closeMenu}
                className="
                  flex-1
                  rounded-xl
                  border border-[var(--border)]
                  px-4 py-3
                  text-sm font-medium
                  text-[var(--text-primary)]
                  transition
                  hover:border-violet-500
                  hover:text-violet-500
                "
              >
                Login
              </button>

              <button
                onClick={closeMenu}
                className="
                  flex-1
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-fuchsia-600
                  px-4 py-3
                  text-sm font-semibold
                  text-white
                  transition duration-300
                  hover:scale-[1.02]
                  hover:shadow-lg
                  hover:shadow-violet-500/20
                "
              >
                Sign Up
              </button>

            </div>

          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;