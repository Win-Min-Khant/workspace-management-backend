import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { tokenStorage } from "@/utils/tokenStorage";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Get the access token from localStorage and check exists or not
  const isAuthenticated = Boolean(tokenStorage.getAccessToken());

  // Navigate to the login page if access token doesn't exist
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
