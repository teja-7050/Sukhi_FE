import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

/**
 * Wrap any route with <ProtectedRoute> to require authentication.
 * If the user is not logged in (no valid token), they are redirected
 * to /login?redirect=<intended-path> automatically so that after login
 * the user is taken to where they wanted to go.
 * Manual logins (no redirect param) always return to the landing page.
 *
 * Usage:
 *   <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return children;
}
