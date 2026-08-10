function SearchCard() {
  return (
    <div className="mt-8 w-full sm:mt-10">
      <div
        className="
          flex
          w-full
          items-center
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--surface)]/80
          px-4
          py-3.5
          backdrop-blur-xl
          transition
          duration-300

          focus-within:border-violet-500
          focus-within:ring-2
          focus-within:ring-violet-500/10

          sm:px-5
          sm:py-4

          lg:px-6
        "
      >
        {/* Search Icon */}

        <span
          className="
            mr-3
            shrink-0
            text-lg

            sm:mr-4
            sm:text-xl
          "
        >
          🔍
        </span>

        {/* Search Input */}

        <input
          type="text"
          placeholder="Search by mood, artist or song..."
          aria-label="Search by mood, artist or song"
          className="
            min-w-0
            w-full
            bg-transparent
            text-sm
            text-[var(--text-primary)]
            outline-none
            placeholder:text-[var(--text-muted)]

            sm:text-base
          "
        />
      </div>
    </div>
  );
}

export default SearchCard;