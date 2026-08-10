import HeroLeft from "./HeroLeft";
import HeroRight from "./HeroRight";

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* ================= AURORA BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Left Glow */}

        <div
          className="
            absolute
            -left-32
            top-10
            h-[350px]
            w-[350px]
            rounded-full
            bg-violet-700/20
            blur-[120px]

            sm:h-[450px]
            sm:w-[450px]
            sm:blur-[150px]

            lg:h-[550px]
            lg:w-[550px]
            lg:blur-[180px]
          "
        />

        {/* Right Glow */}

        <div
          className="
            absolute
            -right-32
            top-32
            h-[320px]
            w-[320px]
            rounded-full
            bg-fuchsia-600/20
            blur-[120px]

            sm:h-[400px]
            sm:w-[400px]
            sm:blur-[150px]

            lg:right-[-180px]
            lg:h-[500px]
            lg:w-[500px]
            lg:blur-[180px]
          "
        />

        {/* Bottom Glow */}

        <div
          className="
            absolute
            -bottom-40
            left-1/2
            h-[450px]
            w-[450px]
            -translate-x-1/2
            rounded-full
            bg-indigo-700/20
            blur-[150px]

            sm:-bottom-52
            sm:h-[550px]
            sm:w-[550px]
            sm:blur-[180px]

            lg:-bottom-[280px]
            lg:h-[700px]
            lg:w-[700px]
            lg:blur-[220px]
          "
        />

      </div>

      {/* ================= HERO CONTENT ================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          max-w-[1450px]
          flex-col
          items-center
          justify-center
          gap-16
          px-5
          pt-28
          pb-16

          sm:px-8
          sm:pt-32

          lg:flex-row
          lg:items-center
          lg:justify-between
          lg:gap-8
          lg:px-12
          lg:pt-28
          lg:pb-0

          xl:gap-12
        "
      >

        {/* Left Content */}

        <HeroLeft />

        {/* Right Visual */}

        <HeroRight />

      </div>

    </section>
  );
}

export default Hero;