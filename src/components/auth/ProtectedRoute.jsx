import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  requiredRole,
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-white/50">
          Loading VerseHana...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    requiredRole &&
    user.role !== requiredRole
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}