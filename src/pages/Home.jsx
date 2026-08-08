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
      <Hero />
      <MoodSection />
      <FeaturedMusic />
         <Features />
          <TrendingArtists />
          <Lyrics />
          <Community />
          <CTA />
              <Footer />
    </>
  );
}

export default Home;