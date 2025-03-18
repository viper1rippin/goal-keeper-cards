
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // If authentication is required and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If we're on a home/root route and user is a guest, redirect to landing page
  if (!user && location.pathname === "/" && location.search === "") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
