import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait until authentication check finishes
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
        <p className="text-sm text-[var(--text-secondary)]">
          Loading VerseHana...
        </p>
      </div>
    );
  }

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → allow the requested page
  return <Outlet />;
}

export default ProtectedRoute;