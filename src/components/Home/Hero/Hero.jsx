import HeroLeft from "./HeroLeft";
import HeroRight from "./HeroRight";

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* Aurora Background */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 top-10 h-[550px] w-[550px] rounded-full bg-violet-700/20 blur-[180px]" />

        <div className="absolute right-[-180px] top-32 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[180px]" />

        <div className="absolute bottom-[-280px] left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-700/20 blur-[220px]" />

      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1450px] items-center justify-between px-8 pt-28 lg:px-12">

        <HeroLeft />

        <HeroRight />

      </div>

    </section>
  );
}

export default Hero;