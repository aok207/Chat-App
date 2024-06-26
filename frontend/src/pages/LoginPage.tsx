import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthForm from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { pageVariant } from "@/framerMotion/variants";
import { socket } from "@/sockets/sockets";

const LoginPage = () => {
  const [target, setTargetPage] = useState("");

  useEffect(() => {
    socket.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 w-full h-full">
      <motion.img
        exit={target !== "register" ? { opacity: 0 } : {}}
        src="/auth_bg.jpg"
        alt=""
        className="hidden lg:flex lg:col-span-2 w-full h-full"
      />
      <motion.div
        exit={target !== "register" ? { opacity: 0 } : {}}
        className="w-full h-full col-span-1"
      >
        <Card className="w-full h-full col-span-1 pt-4 overflow-x-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariant}
          >
            <CardHeader className="flex flex-col items-center">
              <img src="/logo.png" alt="" className="h-10" />
              <CardTitle className="py-2">Log In</CardTitle>
              <CardDescription>
                Log in to your account to continue chatting.
              </CardDescription>
              <CardContent className="p-0 py-6">
                <AuthForm type="login" />
              </CardContent>

              <CardFooter className="flex items-center justify-center">
                <span>
                  Don't have an account?{" "}
                  <Link to="/signup">
                    <Button
                      variant="link"
                      onClick={() => setTargetPage("register")}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </span>
              </CardFooter>
            </CardHeader>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
