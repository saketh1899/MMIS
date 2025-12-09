// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  console.log(token);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Decode JWT
  const payload = JSON.parse(atob(token.split(".")[1]));
  const role = payload.role; // "admin" or "user"

  // If allowedRoles not provided → allow all logged-in users
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
