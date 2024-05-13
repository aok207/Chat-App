import { Routes, Route } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PickNamePage from "./pages/PickNamePage";

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
          <Route
            element={
              <ProtectedRoutes type="guest">
                <LoginPage />
              </ProtectedRoutes>
            }
            path="/login"
          />
          <Route
            element={
              <ProtectedRoutes type="guest">
                <SignUpPage />
              </ProtectedRoutes>
            }
            path="/signup"
          />
          <Route element={<PickNamePage />} path="/pick-username" />
          <Route element={<NotFoundPage />} path="*" />
        </Routes>
        <ToastContainer
          stacked
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
