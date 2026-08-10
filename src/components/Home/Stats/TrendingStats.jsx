function TrendingStats() {
  const stats = [
    { value: "25K+", label: "Songs" },
    { value: "200+", label: "Moods" },
    { value: "1M+", label: "Listeners" },
  ];

  return (
    <div
      className="
        mt-10
        flex
        items-center
        justify-center
        gap-7

        sm:mt-12
        sm:gap-10

        lg:mt-14
        lg:justify-start
        lg:gap-12
      "
    >
      {stats.map((item) => (
        <div
          key={item.label}
          className="text-center lg:text-left"
        >
          <h2
            className="
              text-2xl
              font-bold
              text-[var(--text-primary)]

              sm:text-3xl
            "
          >
            {item.value}
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-[var(--text-muted)]

              sm:text-sm
            "
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default TrendingStats;