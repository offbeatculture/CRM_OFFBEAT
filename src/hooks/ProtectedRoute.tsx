import { Navigate } from "react-router-dom";

const AUTH_KEY = "crm_logged_in";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === "1";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}