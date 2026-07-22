import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { tokenStorage } from "@/utils/tokenStorage";

interface GuestRouteProps {
  children: ReactNode;
}

function GuestRoute({ children }: GuestRouteProps) {
  // Get the access token from localStorage and check exists or not
  const isAuthenticated = Boolean(tokenStorage.getAccessToken());

  // Navigate to the redirect page if access token exists
  if (isAuthenticated) {
    return <Navigate to="/redirect" replace />;
  }

  return <>{children}</>;
}

export default GuestRoute;
