import { motion } from "framer-motion";
import {
  HiPlay,
  HiHeart,
  HiStar,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

function MusicCard({ playlist }) {
  const navigate = useNavigate();

  const handleLoginRedirect = (event) => {
    event.stopPropagation();
    navigate("/login");
  };

  return (
    <motion.div
      whileHover={{
        y: -10,
        transition: {
          duration: 0.25,
        },
      }}
      onClick={handleLoginRedirect}
      className="
        group
        h-full
        cursor-pointer
        overflow-hidden
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        shadow-xl
        transition-shadow
        duration-300

        hover:shadow-2xl
        hover:shadow-violet-500/10
      "
    >
      {/* Album Cover / Visual Area */}

      <div className="relative overflow-hidden">

        <motion.img
          whileHover={{ scale: 1.08 }}
          transition={{
            duration: 0.4,
          }}
          src={playlist.cover}
          alt={playlist.title}
          className="
            h-56
            w-full
            object-cover

            sm:h-64

            lg:h-72
          "
        />

        {/* Dark Overlay */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-black/20
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        {/* Play Button */}

        <motion.button
          type="button"
          onClick={handleLoginRedirect}
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          whileHover={{
            scale: 1.1,
          }}
          className="
            absolute
            left-1/2
            top-1/2
            flex
            h-14
            w-14
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-violet-600
            text-white
            shadow-2xl
            opacity-0
            transition-all
            duration-300

            group-hover:scale-100
            group-hover:opacity-100

            sm:h-16
            sm:w-16
          "
        >
          <HiPlay className="ml-1 text-2xl sm:text-3xl" />
        </motion.button>

        {/* Favorite */}

        <button
          type="button"
          onClick={handleLoginRedirect}
          aria-label="Add to favorites"
          className="
            absolute
            right-3
            top-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-white/20
            bg-black/40
            text-white
            backdrop-blur-md
            transition-all
            duration-300

            hover:border-violet-500
            hover:bg-violet-600

            sm:right-4
            sm:top-4
            sm:h-10
            sm:w-10
          "
        >
          <HiHeart className="text-sm sm:text-base" />
        </button>

        {/* Mood Badge */}

        <div
          className="
            absolute
            bottom-3
            left-3
            rounded-full
            bg-violet-600/90
            px-3
            py-1.5
            text-xs
            font-medium
            text-white
            backdrop-blur-xl

            sm:bottom-4
            sm:left-4
            sm:px-4
            sm:py-2
            sm:text-sm
          "
        >
          {playlist.mood}
        </div>
      </div>

      {/* Card Content */}

      <div
        className="
          flex
          min-h-[180px]
          flex-col
          p-5

          sm:min-h-[190px]
          sm:p-6
        "
      >
        {/* Title */}

        <h3
          className="
            line-clamp-1
            text-xl
            font-bold
            text-[var(--text-primary)]

            sm:text-2xl
          "
        >
          {playlist.title}
        </h3>

        {/* Artist */}

        <p
          className="
            mt-2
            line-clamp-1
            text-sm
            text-[var(--text-secondary)]
          "
        >
          {playlist.artist}
        </p>

        {/* Info */}

        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-3
          "
        >
          <div>
            <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
              {playlist.songs} Songs
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">
              {playlist.duration}
            </p>
          </div>

          {/* Rating */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1
              rounded-full
              bg-yellow-500/10
              px-2.5
              py-1
              text-yellow-500

              sm:px-3
            "
          >
            <HiStar className="text-sm" />

            <span className="text-xs font-semibold sm:text-sm">
              {playlist.rating}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MusicCard;