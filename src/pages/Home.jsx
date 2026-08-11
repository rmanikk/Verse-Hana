import Navbar from "../components/layout/Navbar/Navbar";
import Hero from "../components/Home/Hero/Hero";
import MoodSection from "../components/Home/MoodSection/MoodSection";
import FeaturedMusic from "../components/Home/FeaturedMusic/FeaturedMusic";
import Features from "../components/Home/Features/Features";
import TrendingArtists from "../components/Home/TrendingArtists/TrendingArtists";
import Lyrics from "../components/Home/Lyrics/Lyrics";
import Community from "../components/Home/Community/Community";
import CTA from "../components/Home/CTA/CTA";
import Footer from "../components/layout/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <div id="home">
        <Hero />
      </div>

      <div id="moods">
        <MoodSection />
      </div>

      <div id="discover">
        <FeaturedMusic />
      </div>

      <Features />

      <div id="artists">
        <TrendingArtists />
      </div>

      <div id="lyrics">
        <Lyrics />
      </div>

      <Community />

      <CTA />

      <Footer />
    </>
  );
}

export default Home;