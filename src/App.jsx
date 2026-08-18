import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import MoodSelection from "./pages/MoodSelection";
import UserDashboard from "./pages/UserDashboard";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import MusicPlayer from "./components/music/MusicPlayer";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mood" element={<MoodSelection />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

      </Routes>

      {/* Global Music Player */}
      <MusicPlayer />
    </BrowserRouter>
  );
}

export default App;