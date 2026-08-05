function TrendingStats() {
  const stats = [
    { value: "25K+", label: "Songs" },
    { value: "200+", label: "Moods" },
    { value: "1M+", label: "Listeners" },
  ];

  return (
    <div className="mt-14 flex flex-wrap gap-12">
      {stats.map((item) => (
        <div key={item.label}>
          <h2 className="text-3xl font-bold">
            {item.value}
          </h2>

          <p className="mt-1 text-gray-500">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default TrendingStats;