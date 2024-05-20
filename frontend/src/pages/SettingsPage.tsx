/* eslint-disable @typescript-eslint/no-explicit-any */
import { deleteAccount, updateUserInfo, updateUserPassword } from "@/api/users";
import DeleteModal from "@/components/DeleteModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { makeFallbackAvatar, showToast } from "@/lib/utils";
import { login, logout } from "@/slices/authSlice";
import { setCurrentPage } from "@/slices/uiSlice";
import { IUpdatePasswordInputs, IUpdateProfileInputs } from "@/types/types";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { pageVariant } from "@/framerMotion/variants";

const SettingsPage = () => {
  const user = useAppSelector((state) => state.auth?.user);
  const [avatar, setAvatar] = useState(user?.avatar);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // set the ui-state in the redux store to settings
  useEffect(() => {
    dispatch(setCurrentPage("settings"));
  }, []);

  // Form to update the user's profile
  const updateProfileForm = useForm<IUpdateProfileInputs>();

  // update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: (data) => {
      dispatch(login(data.data));
      showToast("success", data.message);
    },
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  // update profile form submit handler
  const submitProfileForm: SubmitHandler<IUpdateProfileInputs> = (data) => {
    const formData = new FormData();
    if (data.profilePicture && data.profilePicture[0]) {
      formData.append(
        "profilePicture",
        data.profilePicture[0],
        data.profilePicture[0].name
      );
    }

    formData.append("email", data.email);

    updateProfileMutation.mutate(formData);
  };

  // Form to update user's password
  const updatePasswordForm = useForm<IUpdatePasswordInputs>();

  // update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: updateUserPassword,
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
    onSuccess: (data) => {
      showToast("success", data.message);
    },
  });

  // passsword submit handler
  const submitUpdatePasswordForm: SubmitHandler<IUpdatePasswordInputs> = (
    data
  ) => {
    updatePasswordMutation.mutate(data);
  };

  // handle account delete
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      dispatch(logout());
      showToast("success", "Your account has been deleted");
      navigate("/login");
    },
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariant}
    >
      <ScrollArea className="w-full h-full">
        <div className="w-full md:w-[80%] md:mx-auto h-full my-10 mx-2">
          <div className="w-full flex flex-col justify-center gap-10 items-center">
            <section className="flex items-center justify-between w-full">
              <Link
                to={"/"}
                className="flex items-center gap-0.5 hover:text-purple-400 text-gray-800 dark:text-slate-50  transition-colors"
              >
                <ArrowLeft />
              </Link>

              <h1 className="text-3xl font-extrabold">Settings</h1>
              <div></div>
            </section>
            {/* Update profile section */}
            <section className="w-[80%] mx-auto md:w-1/2 flex flex-col gap-6">
              <h1 className="text-lg font-bold">Your profile</h1>
              <Separator />
              <form
                className="w-full flex flex-col gap-5"
                onSubmit={updateProfileForm.handleSubmit(submitProfileForm)}
              >
                <Label htmlFor="profile-picture">Your profile picture</Label>
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={`${avatar}`}
                    alt={`profile-of-${user?.name}`}
                  />
                  <AvatarFallback className="text-3xl">
                    {makeFallbackAvatar(user?.name as string)}
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  id="profile-picture"
                  {...updateProfileForm.register("profilePicture")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAvatar(URL.createObjectURL(e.target.files![0] as File));
                  }}
                />

                <Label htmlFor="email">Your Email</Label>
                <Input
                  type="text"
                  id="email"
                  defaultValue={user?.email}
                  className="w-full"
                  {...updateProfileForm.register("email", {
                    required: "Email field is required!",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email address!",
                    },
                  })}
                />
                {updateProfileForm.formState.errors?.email && (
                  <p className="font-semibold text-sm text-red-600">
                    {updateProfileForm.formState.errors.email.message}
                  </p>
                )}
                <Button
                  className="w-fit mt-5"
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? (
                    <Spinner />
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </form>
            </section>

            {/* Update Password section */}
            <section className="w-[80%] mx-auto md:w-1/2 flex flex-col gap-6">
              <h1 className="text-lg font-bold">Change your password</h1>
              <Separator />
              <form
                className="w-full flex flex-col gap-5"
                onSubmit={updatePasswordForm.handleSubmit(
                  submitUpdatePasswordForm
                )}
              >
                <Label htmlFor="currentPassword">Your Current Password</Label>
                <Input
                  type="password"
                  id="currentPassword"
                  className="w-full"
                  placeholder="Enter your current password..."
                  {...updatePasswordForm.register("currentPassword", {
                    required: "Current Password field is required!",
                  })}
                />
                {updatePasswordForm.formState.errors.currentPassword && (
                  <p className="font-semibold text-sm text-red-600">
                    {
                      updatePasswordForm.formState.errors.currentPassword
                        .message
                    }
                  </p>
                )}

                <Label htmlFor="password">Your New Password</Label>
                <Input
                  type="password"
                  id="password"
                  className="w-full"
                  placeholder="Enter your new password..."
                  {...updatePasswordForm.register("password", {
                    required: "Password field is required!",
                  })}
                />
                {updatePasswordForm.formState.errors.password && (
                  <p className="font-semibold text-sm text-red-600">
                    {updatePasswordForm.formState.errors.password.message}
                  </p>
                )}

                <Label htmlFor="confirmPassword">Confirm Your Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  className="w-full"
                  placeholder="Confirm your password..."
                  {...updatePasswordForm.register("confirmPassword", {
                    required: "Confirm password field is required!",
                    validate: (data) => {
                      if (updatePasswordForm.getValues("password") !== data) {
                        return "Passwords do not match!";
                      }
                    },
                  })}
                />
                {updatePasswordForm.formState.errors.confirmPassword && (
                  <p className="font-semibold text-sm text-red-600">
                    {
                      updatePasswordForm.formState.errors.confirmPassword
                        .message
                    }
                  </p>
                )}

                <Button
                  className="w-fit mt-5"
                  disabled={updatePasswordMutation.isLoading}
                >
                  {updatePasswordMutation.isLoading ? (
                    <Spinner />
                  ) : (
                    "Update your password"
                  )}
                </Button>
              </form>
            </section>

            <section className="w-[80%] mx-auto md:w-1/2 flex flex-col gap-6">
              <h1 className="text-lg font-bold text-red-500">Danger Zone</h1>
              <Separator />
              <p className="text-red-600 text-sm font-bold">
                Warning! Once you delete your account, there is no going back.
                Please be certain.
              </p>

              <DeleteModal
                TriggerButton={
                  <Button className="w-fit mt-3" variant={"destructive"}>
                    Delete your account!
                  </Button>
                }
                handleDelete={() => {
                  deleteMutation.mutate();
                }}
                content={{
                  title: "Are you absolutely sure?",
                  description:
                    "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
                }}
                deleteDisabled={deleteMutation.isLoading}
              />
            </section>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default SettingsPage;
