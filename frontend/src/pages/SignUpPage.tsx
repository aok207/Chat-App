import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthForm from "@/components/AuthForm";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { pageVariant } from "@/framerMotion/variants";

const SignUpPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 w-full h-full">
      <img
        src="/auth_bg.jpg"
        alt=""
        className="hidden md:flex md:col-span-2 w-full h-full"
      />

      <Card className="w-full h-full col-span-1 pt-4 overflow-x-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={pageVariant}
        >
          <CardHeader className="flex flex-col items-center">
            <img src="/logo.png" alt="" className="h-10" />
            <CardTitle className="py-2">Sign Up</CardTitle>
            <CardDescription>Sign up for a new account.</CardDescription>
            <CardContent className="p-0 py-6">
              <AuthForm type="register" />
            </CardContent>

            <CardFooter className="flex items-center justify-center">
              <span>
                Already have an account?{" "}
                <Link to="/login">
                  <Button variant="link">Log In</Button>
                </Link>
              </span>
            </CardFooter>
          </CardHeader>
        </motion.div>
      </Card>
    </div>
  );
};

export default SignUpPage;
