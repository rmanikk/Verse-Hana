import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";

function MoodCard({ mood }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{
        duration: 0.3,
      }}
      className="
        group
        relative
        h-full
        overflow-hidden
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-5
        shadow-lg
        backdrop-blur-2xl
        transition-shadow
        duration-300

        sm:p-6

        hover:shadow-2xl
        hover:shadow-violet-500/10
      "
    >
      {/* Gradient Glow */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          ${mood.color}
          opacity-0
          blur-3xl
          transition-all
          duration-500
          group-hover:opacity-20
        `}
      />

      {/* Content */}

      <div className="relative z-10 flex h-full flex-col">

        {/* Emoji */}

        <div
          className="
            text-4xl

            sm:text-5xl
          "
        >
          {mood.emoji}
        </div>

        {/* Title */}

        <h3
          className="
            mt-5
            text-xl
            font-bold
            text-[var(--text-primary)]

            sm:mt-6
            sm:text-2xl
          "
        >
          {mood.title}
        </h3>

        {/* Description */}

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-[var(--text-secondary)]
          "
        >
          {mood.description}
        </p>

        {/* Bottom */}

        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            pt-7
          "
        >
          {/* Song count */}

          <span
            className="
              text-sm
              font-medium
              text-violet-500
            "
          >
            {mood.songs}
          </span>

          {/* Arrow */}

          <motion.div
            whileHover={{ x: 4 }}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
              transition-all
              duration-300

              group-hover:border-violet-500
              group-hover:bg-violet-600
            "
          >
            <HiArrowRight
              className="
                text-base
                text-[var(--text-primary)]
                transition-colors
                duration-300

                group-hover:text-white
              "
            />
          </motion.div>
        </div>
      </div>

      {/* Border Glow */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-3xl
          border
          border-transparent
          transition-all
          duration-300
          group-hover:border-violet-500/40
        "
      />
    </motion.div>
  );
}

export default MoodCard;