import { motion } from "framer-motion";
import {
  HiPlay,
  HiUserGroup,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

function Artist({ artist }) {
  const navigate = useNavigate();

  const handleArtistClick = () => {
    navigate("/login");
  };

  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.25,
      }}
      onClick={handleArtistClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleArtistClick();
        }
      }}
      className="
        group
        relative
        h-full
        cursor-pointer
        overflow-hidden
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-3
        shadow-lg
        backdrop-blur-xl
        transition-shadow
        duration-300

        hover:shadow-2xl
        hover:shadow-violet-500/10
      "
    >
      {/* =====================================================
          ARTIST IMAGE
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl">

        <motion.img
          src={artist.image}
          alt={artist.name}
          whileHover={{
            scale: 1.08,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            h-56
            w-full
            cursor-pointer
            object-cover

            sm:h-64

            lg:h-72
          "
        />

        {/* Image Overlay */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/80
            via-black/10
            to-transparent
          "
        />

        {/* =================================================
            PLAY BUTTON
        ================================================= */}

        <motion.button
          type="button"
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          whileHover={{
            scale: 1.1,
          }}
          onClick={(event) => {
            event.stopPropagation();
            navigate("/login");
          }}
          aria-label={`Play ${artist.name}`}
          className="
            absolute
            bottom-3
            right-3
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-violet-600
            text-white
            opacity-0
            shadow-xl
            transition-all
            duration-300

            group-hover:opacity-100

            sm:bottom-4
            sm:right-4
            sm:h-12
            sm:w-12
          "
        >
          <HiPlay className="ml-0.5 text-lg sm:text-xl" />
        </motion.button>

        {/* =================================================
            MOOD
        ================================================= */}

        <div
          className="
            absolute
            left-3
            top-3
            rounded-full
            border
            border-white/20
            bg-black/40
            px-2.5
            py-1.5
            text-[11px]
            font-medium
            text-white
            backdrop-blur-md

            sm:left-4
            sm:top-4
            sm:px-3
            sm:text-xs
          "
        >
          {artist.mood}
        </div>
      </div>

      {/* =====================================================
          ARTIST INFORMATION
      ===================================================== */}

      <div className="px-2 pb-3 pt-4 sm:pt-5">

        {/* Name */}

        <h3
          className="
            line-clamp-1
            text-lg
            font-bold
            text-[var(--text-primary)]

            sm:text-xl
          "
        >
          {artist.name}
        </h3>

        {/* Genre */}

        <p
          className="
            mt-1
            line-clamp-1
            text-sm
            text-[var(--text-secondary)]
          "
        >
          {artist.genre}
        </p>

        {/* Followers */}

        <div
          className="
            mt-4
            flex
            items-center
            gap-2
            text-xs
            text-[var(--text-muted)]

            sm:mt-5
            sm:text-sm
          "
        >
          <HiUserGroup className="shrink-0 text-violet-500" />

          <span>
            {artist.followers} followers
          </span>
        </div>

        {/* Bottom Accent */}

        <div
          className="
            mt-4
            h-px
            w-8
            bg-violet-500/40
            transition-all
            duration-300

            group-hover:w-full
            group-hover:bg-violet-500
          "
        />
      </div>
    </motion.div>
  );
}

export default Artist;