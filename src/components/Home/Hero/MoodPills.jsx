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
    <div className="mt-8 flex flex-wrap gap-3">
      {moods.map((mood) => (
        <button
          key={mood}
          className="
            rounded-full
            border border-white/10
            bg-white/5
            px-5 py-2
            text-sm
            font-medium
            text-gray-300
            backdrop-blur-xl
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-violet-500/50
            hover:bg-violet-500/20
            hover:text-white
            hover:shadow-lg
            hover:shadow-violet-500/20
          "
        >
          {mood}
        </button>
      ))}
    </div>
  );
}

export default MoodPills;