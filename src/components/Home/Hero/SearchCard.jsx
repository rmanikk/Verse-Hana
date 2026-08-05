function SearchCard() {
  return (
    <div className="mt-10">
      <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10">

        <span className="mr-4 text-xl">
          🔍
        </span>

        <input
          type="text"
          placeholder="Search by mood, artist or song..."
          className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
        />

      </div>
    </div>
  );
}

export default SearchCard;