import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const location = useLocation();
  
    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  
    return children;
  };
  
  export default RequireAuth;