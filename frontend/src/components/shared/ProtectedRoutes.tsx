import React from "react";

import { useAppSelector } from "@/hooks/useRedux";
import { Navigate } from "react-router-dom";

type ProtectedRoutesProps = {
  children: React.ReactNode;
  type: "auth" | "guest";
};

const ProtectedRoutes = ({ children, type }: ProtectedRoutesProps) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const username = useAppSelector((state) => state.auth.user?.name);

  if (type === "auth") {
    if (username === null) {
      return <Navigate to="/pick-username" />;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  } else {
    return isAuthenticated ? <Navigate to="/" /> : children;
  }
};

export default ProtectedRoutes;
