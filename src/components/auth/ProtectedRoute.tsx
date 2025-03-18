
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

export default function ProtectedRoute({ children, allowGuest = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // For progress tracker, allow guests
  if (!user && !allowGuest && location.pathname === "/progress") {
    return <Navigate to="/login" replace />;
  }

  // For other protected routes, allow guests if specified
  if (!user && !allowGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
