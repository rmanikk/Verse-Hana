import Navbar from "../components/layout/Navbar/Navbar";
import Hero from "../components/Home/Hero/Hero";
import MoodSection from "../components/Home/MoodSection/MoodSection";
import FeaturedMusic from "../components/Home/FeaturedMusic/FeaturedMusic";
import Features from "../components/Home/Features/Features";
import TrendingArtists from "../components/Home/TrendingArtists/TrendingArtists";
import Lyrics from "../components/Home/Lyrics/Lyrics";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <MoodSection />
      <FeaturedMusic />
         <Features />
          <TrendingArtists />
          <Lyrics />
    </>
  );
}

export default Home;