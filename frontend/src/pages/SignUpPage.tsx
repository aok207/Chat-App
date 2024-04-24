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

const SignUpPage = () => {
  return (
    <div className="flex w-full justify-center mt-10">
      <Card className="sm:max-w-[450px] w-full h-fit">
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
      </Card>
    </div>
  );
};

export default SignUpPage;
