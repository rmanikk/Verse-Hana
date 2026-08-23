import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";

function SearchCard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    navigate("/login");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        mt-6
        w-full

        sm:mt-7
      "
    >
      <div
        className="
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--surface)]/80
          px-4
          py-3
          backdrop-blur-xl
          transition
          duration-300

          focus-within:border-violet-500/50
          focus-within:ring-2
          focus-within:ring-violet-500/10

          sm:px-5
          sm:py-3.5
        "
      >
        {/* Search Icon */}

        <HiMagnifyingGlass
          className="
            shrink-0
            text-lg
            text-[var(--text-muted)]

            sm:text-xl
          "
        />

        {/* Input */}

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by mood, artist or song..."
          aria-label="Search by mood, artist or song"
          className="
            min-w-0
            flex-1
            bg-transparent
            text-sm
            text-[var(--text-primary)]
            outline-none
            placeholder:text-[var(--text-muted)]

            sm:text-base
          "
        />

        {/* Search Button */}

        <button
          type="submit"
          className="
            shrink-0
            rounded-xl
            bg-violet-600
            px-3
            py-2
            text-xs
            font-semibold
            text-white
            transition

            hover:bg-violet-500

            sm:px-4
            sm:py-2.5
            sm:text-sm
          "
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchCard;