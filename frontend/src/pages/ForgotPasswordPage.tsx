/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "react-query";
import { FormEvent, useRef, useState } from "react";
import Spinner from "@/components/ui/spinner";
import { showToast } from "@/lib/utils";
import { postForgotPassword } from "@/api/auth";

const ForgotPasswordPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // update user info mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: postForgotPassword,
    onError: (error: any) => {
      setIsLoading(false);
      showToast("error", error.response.data.error || error.message);
    },
    onSuccess: (data) => {
      setIsLoading(false);
      showToast("success", data.message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    const email = inputRef.current?.value;
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!email) {
      showToast("error", "Email field cannot be empty.");
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      showToast("error", "Email format is incorrect!");
      setIsLoading(false);
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="flex w-full justify-center mt-10">
      <Card className="sm:max-w-[450px] w-[90%] h-fit">
        <CardHeader className="flex flex-col items-center">
          <img src="/logo.png" alt="" className="h-10" />
          <CardTitle className="py-2 text-center">
            Please provide your email to reset your password
          </CardTitle>
          <CardContent className="p-0 py-6 w-[90%]">
            <form
              onSubmit={handleSubmit}
              className="grid w-full items-center gap-4"
            >
              <Label htmlFor="name">Email</Label>
              <Input
                id="name"
                type="email"
                required
                ref={inputRef}
                placeholder="Enter your email..."
              />
              <Button type="submit" className="w-fit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
