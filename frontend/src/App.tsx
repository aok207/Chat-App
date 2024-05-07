import { Routes, Route } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-white dark:bg-dark text-black dark:text-white">
      <div className="w-full h-full overflow-auto">
        <Routes>
          <Route
            element={
              <ProtectedRoutes type="auth">
                <HomePage />
              </ProtectedRoutes>
            }
            path="/"
          />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<SignUpPage />} path="/signup" />
          <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
