import Navbar from "../components/layout/Navbar/Navbar";
import Hero from "../components/Home/Hero/Hero";
import MoodSection from "../components/Home/MoodSection/MoodSection";
import FeaturedMusic from "../components/Home/FeaturedMusic/FeaturedMusic";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <MoodSection />
      <FeaturedMusic />
    </>
  );
}

export default Home;