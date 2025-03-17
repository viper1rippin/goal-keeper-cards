
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-dark">
        <Loader2 className="h-12 w-12 animate-spin text-emerald" />
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page, but save the current location they were
    // trying to go to when they were redirected. This allows us
    // to send them to that page after they login, which is a nicer user experience
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
