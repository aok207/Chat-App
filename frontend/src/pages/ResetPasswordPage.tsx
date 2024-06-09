/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "react-query";
import Spinner from "@/components/ui/spinner";
import { showToast } from "@/lib/utils";
import { postResetPassword, verifyResetToken } from "@/api/auth";
import { SubmitHandler, useForm } from "react-hook-form";
import { IResetPasswordInputs } from "@/types/types";
import { useNavigate, useParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IResetPasswordInputs>();
  const { token } = useParams();
  const navigate = useNavigate();

  // Check if token is valid
  const verifyTokenQuery = useQuery({
    queryFn: () => verifyResetToken(token as string),
    queryKey: ["verifyResetToken"],
    onError: (err) => {
      console.log(err);
      showToast("error", "Token either doesn't exist or is expired!");
      navigate("/login");
    },
    retry: false,
  });

  // reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: postResetPassword,
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
      navigate("/");
    },
    onSuccess: (data) => {
      showToast("success", data.message);
      navigate("/login");
    },
  });

  const onSubmit: SubmitHandler<IResetPasswordInputs> = (data) => {
    const resetToken = token as string;
    resetPasswordMutation.mutate({ data, token: resetToken });
  };

  if (verifyTokenQuery.isSuccess) {
    return (
      <div className="flex w-full justify-center mt-10">
        <Card className="sm:max-w-[450px] w-[90%] h-fit">
          <CardHeader className="flex flex-col items-center">
            <img src="/logo.png" alt="" className="h-10" />
            <CardTitle className="py-2 text-center">
              Create your new password
            </CardTitle>
            <CardContent className="p-0 py-6 w-[90%]">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid w-full items-center gap-4"
              >
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password..."
                  {...register("password", {
                    required: "Password field is required!",
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 font-semibold">
                    {errors.password?.message}
                  </p>
                )}
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password..."
                  {...register("confirmPassword", {
                    required: "Confirm Password field is required!",
                    validate: (data) => {
                      if (watch("password") !== data) {
                        return "Passwords do not match!";
                      }
                    },
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 font-semibold">
                    {errors.confirmPassword?.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-fit"
                  disabled={resetPasswordMutation.isLoading}
                >
                  {resetPasswordMutation.isLoading ? (
                    <Spinner />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  } else {
    return (
      <div className="w-full flex justify-center items-center h-full">
        <Spinner width={10} height={10} />
      </div>
    );
  }
};

export default ResetPasswordPage;
