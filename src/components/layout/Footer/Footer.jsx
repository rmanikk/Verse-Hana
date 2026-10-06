import {
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-12 text-center">
        
       {/* Brand */}
<div className="flex items-center justify-center">
  <span
    className="
      text-2xl
      font-bold
      tracking-tight
      text-[var(--text-primary)]
    "
  >
    VerseHana
  </span>
</div>

        {/* Description */}
        <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
          Discover music based on how you feel, not just what you search.
        </p>

        {/* Social Links */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <a
            href="#"
            aria-label="VerseHana GitHub"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-500 hover:bg-teal-500/10 hover:text-teal-500"
          >
            <FaGithub size={17} />
          </a>

          <a
            href="#"
            aria-label="VerseHana Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-500 hover:bg-teal-500/10 hover:text-teal-500"
          >
            <FaInstagram size={17} />
          </a>

          <a
            href="#"
            aria-label="VerseHana Twitter"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-500 hover:bg-teal-500/10 hover:text-teal-500"
          >
            <FaTwitter size={17} />
          </a>

          <a
            href="#"
            aria-label="VerseHana YouTube"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-500 hover:bg-teal-500/10 hover:text-teal-500"
          >
            <FaYoutube size={17} />
          </a>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full max-w-2xl bg-[var(--border)]" />

        {/* Copyright */}
        <p className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} VerseHana. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;