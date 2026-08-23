import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

import { useAuth } from "../context/AuthContext";

function Home() {
  const { user, loading } = useAuth();

  const navigate = useNavigate();

  // =====================================================
  // LOGGED-IN USERS SHOULD NOT SEE LANDING PAGE
  // =====================================================

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [loading, user, navigate]);

  // =====================================================
  // REDIRECT LANDING-PAGE CONTENT TO LOGIN
  // =====================================================

  const handleLandingContentClick = (event) => {
    // Auth state is still being checked.
    if (loading) {
      return;
    }

    // Logged-in users are already redirected to dashboard.
    if (user) {
      return;
    }

    const target = event.target;

    // -----------------------------------------------------
    // ALLOW SEARCH INPUT
    // -----------------------------------------------------
    //
    // Users should be able to type normally.
    // The search form/button itself will be handled below.
    //

    if (
      target.closest("input") ||
      target.closest("textarea")
    ) {
      return;
    }

    // -----------------------------------------------------
    // DON'T PROTECT NAVIGATION MARKED AS LANDING NAVIGATION
    // -----------------------------------------------------

    if (
      target.closest("[data-landing-navigation]")
    ) {
      return;
    }

    // -----------------------------------------------------
    // FIND CLICKABLE CONTENT
    // -----------------------------------------------------

    const clickableElement = target.closest(
      "button, a, [role='button'], [data-requires-auth]"
    );

    if (!clickableElement) {
      return;
    }

    // -----------------------------------------------------
    // LANDING NAVIGATION IS ALLOWED
    // -----------------------------------------------------

    if (
      clickableElement.closest(
        "[data-landing-navigation]"
      )
    ) {
      return;
    }

    // -----------------------------------------------------
    // REDIRECT UNAUTHENTICATED USER
    // -----------------------------------------------------

    event.preventDefault();
    event.stopPropagation();

    navigate("/login");
  };

  // =====================================================
  // DON'T SHOW LANDING PAGE WHILE AUTH IS LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)]" />
    );
  }

  // =====================================================
  // LOGGED-IN USER
  // =====================================================

  if (user) {
    return (
      <main className="min-h-screen bg-[var(--background)]" />
    );
  }

  // =====================================================
  // LANDING PAGE
  // =====================================================

  return (
    <>
      {/* =================================================
          NAVBAR
          NOT PROTECTED BY LANDING CLICK HANDLER
      ================================================= */}

      <Navbar />

      {/* =================================================
          LANDING PAGE CONTENT
      ================================================= */}

      <main
        onClickCapture={handleLandingContentClick}
        className="
          overflow-x-hidden
          bg-[var(--background)]
          text-[var(--text-primary)]
        "
      >
        {/* =================================================
            HERO
        ================================================= */}

        <div id="home">
          <Hero />
        </div>

        {/* =================================================
            MOODS
        ================================================= */}

        <div id="moods">
          <MoodSection />
        </div>

        {/* =================================================
            DISCOVER / FEATURED MUSIC
        ================================================= */}

        <div id="discover">
          <FeaturedMusic />
        </div>

        {/* =================================================
            FEATURES
        ================================================= */}

        <Features />

        {/* =================================================
            TRENDING ARTISTS
        ================================================= */}

        <div id="artists">
          <TrendingArtists />
        </div>

        {/* =================================================
            LYRICS
        ================================================= */}

        <div id="lyrics">
          <Lyrics />
        </div>

        {/* =================================================
            COMMUNITY
        ================================================= */}

        <Community />

        {/* =================================================
            CTA
        ================================================= */}

        <CTA />
      </main>

      {/* =================================================
          FOOTER
          NOT PROTECTED BY LANDING CLICK HANDLER
      ================================================= */}

      <Footer />
    </>
  );
}

export default Home;