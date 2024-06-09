import { Routes, Route, useLocation } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ProtectedRoutes from "./components/shared/ProtectedRoutes";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PickNamePage from "./pages/PickNamePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Layout from "./components/layout/Layout";
import { AnimatePresence } from "framer-motion";
import SettingsPage from "./pages/SettingsPage";
import IndividualChatPage from "./pages/IndividualChatPage";

const App = () => {
  const location = useLocation();
  const locationArr = location.pathname?.split("/") ?? [];

  return (
    <div className="w-screen h-screen overflow-hidden bg-white dark:bg-dark text-black dark:text-white">
      <div className="w-full h-full overflow-auto">
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/*"
              element={
                <Layout>
                  <AnimatePresence>
                    <Routes location={location} key={locationArr[2]}>
                      <Route element={<HomePage />} index />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route
                        path="/chat/:id"
                        element={<IndividualChatPage />}
                      />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AnimatePresence>
                </Layout>
              }
            />

            <Route
              path="/login"
              element={
                <ProtectedRoutes type="guest">
                  <LoginPage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoutes type="guest">
                  <SignUpPage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/pick-username"
              element={
                <ProtectedRoutes type="guest">
                  <PickNamePage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <ProtectedRoutes type="guest">
                  <ForgotPasswordPage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <ProtectedRoutes type="guest">
                  <ResetPasswordPage />
                </ProtectedRoutes>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
      </div>
    </div>
  );
};

export default App;
