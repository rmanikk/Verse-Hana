import { useState, useEffect } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

import logoDark from "../../../assets/logo/versehana-black.png";
import logoLight from "../../../assets/logo/versehana-white.png";

function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = ["Home", "Discover", "Moods", "Artists", "About"];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
  const newTheme = !isDark;
  setIsDark(newTheme);

  if (newTheme) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      {/* THIS CREATES LEFT & RIGHT MARGINS */}
  <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">

        <nav className="flex h-20 items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center">
            <img
              src={isDark ? logoDark : logoLight}
              alt="VerseHana"
              className="h-12 w-12 object-contain transition duration-300 hover:scale-110"
            />
          </a>

          {/* Navigation */}
          <ul className="hidden lg:flex items-center gap-12">
            {navLinks.map((item) => (
              <li key={item}>
                <a
                  href="#"
                 className="group relative text-[15px] font-medium tracking-wide transition"
style={{ color: "var(--text-primary)" }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-violet-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>

          {/* Right */}
          <div className="flex items-center gap-5">

            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-violet-500 hover:bg-violet-500/10"
            >
              {isDark ? (
                <HiOutlineSun size={18} />
              ) : (
                <HiOutlineMoon size={18} />
              )}
            </button>

            <button 
              style={{ color: "var(--text-primary)" }}
              className="hidden lg:block text-sm font-medium text-gray-300 transition hover:text-white">
              Login
            </button>

            <button className="rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30">
              Sign Up
            </button>

          </div>

        </nav>
      </div>
    </header>
  );
}

export default Navbar;