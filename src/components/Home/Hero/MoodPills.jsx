const moods = [
  "😊 Happy",
  "😌 Calm",
  "🌧 Rain",
  "🌙 Night",
  "❤️ Love",
  "💪 Focus",
  "🎉 Party",
  "😢 Sad",
];

function MoodPills() {
  return (
    <div
      className="
        mt-6
        flex
        flex-wrap
        justify-center
        gap-2

        sm:mt-8
        sm:justify-center
        sm:gap-3

        lg:justify-start
      "
    >
      {moods.map((mood) => (
        <button
          key={mood}
          className="
            rounded-full
            border
            border-[var(--border)]
            bg-[var(--surface)]
            px-3.5
            py-1.5
            text-xs
            font-medium
            text-[var(--text-secondary)]
            backdrop-blur-xl
            transition-all
            duration-300

            hover:-translate-y-1
            hover:border-violet-500/50
            hover:bg-violet-500/10
            hover:text-violet-500
            hover:shadow-lg
            hover:shadow-violet-500/10

            sm:px-4
            sm:py-2
            sm:text-sm

            lg:px-5
          "
        >
          {mood}
        </button>
      ))}
    </div>
  );
}

export default MoodPills;