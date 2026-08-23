import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Profile from "./pages/Profile";
import MoodSelection from "./pages/MoodSelection";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import MusicPlayer from "./components/music/MusicPlayer";

import LikedSongs from "./pages/LikedSongs";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import Playlists from "./pages/Playlists";
import PlaylistDetails from "./pages/PlaylistDetails";
import Discover from "./pages/Discover";
import Genre from "./pages/Genre";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Password reset uses:
            /reset-password?email=user@example.com
        */}
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* =========================
            PROTECTED USER ROUTES
        ========================== */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/mood"
            element={<MoodSelection />}
          />

          <Route
            path="/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/liked-songs"
            element={<LikedSongs />}
          />

          <Route
            path="/recently-played"
            element={<RecentlyPlayed />}
          />

          <Route
            path="/playlists"
            element={<Playlists />}
          />

          <Route
            path="/playlists/:playlistId"
            element={<PlaylistDetails />}
          />

          <Route
            path="/discover"
            element={<Discover />}
          />

          <Route
            path="/genres"
            element={<Genre />}
          />
        </Route>

        {/* =========================
            ADMIN-ONLY ROUTES
        ========================== */}

        <Route
          element={
            <ProtectedRoute requiredRole="admin" />
          }
        >
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />
        </Route>
      </Routes>

      {/* Global Music Player */}
      <MusicPlayer />
    </BrowserRouter>
  );
}

export default App;