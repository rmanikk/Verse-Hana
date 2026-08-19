import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ requiredRole }) {
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

  // The API enforces roles as well. This keeps non-admins out of the
  // dashboard before it can be rendered in the browser.
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in → allow the requested page
  return <Outlet />;
}

export default ProtectedRoute;
