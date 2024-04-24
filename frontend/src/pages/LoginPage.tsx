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

const LoginPage = () => {
  return (
    <div className="flex w-full justify-center mt-10">
      <Card className="sm:max-w-[400px] w-full h-fit">
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
                <Button variant="link">Sign Up</Button>
              </Link>
            </span>
          </CardFooter>
        </CardHeader>
      </Card>
    </div>
  );
};

export default LoginPage;
