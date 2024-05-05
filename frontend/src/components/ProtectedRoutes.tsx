import React from "react";

import { useAppSelector } from "@/hooks/hooks";
import { Navigate } from "react-router-dom";

type ProtectedRoutesProps = {
  children: React.ReactNode;
  type: "auth" | "guest";
};

const ProtectedRoutes = ({ children, type }: ProtectedRoutesProps) => {
  console.log(type);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (type === "auth") {
    return isAuthenticated ? children : <Navigate to="/login" />;
  } else {
    return isAuthenticated ? <Navigate to="/" /> : children;
  }
};

export default ProtectedRoutes;
