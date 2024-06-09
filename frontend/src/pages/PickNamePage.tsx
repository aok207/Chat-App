/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IUsernameInput, UserType } from "@/types/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useState } from "react";
import { searchUsersByName, updateUserInfo } from "@/api/users";
import Spinner from "@/components/ui/spinner";
import { showToast } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import { Navigate, useNavigate } from "react-router-dom";

const PickNamePage = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IUsernameInput>();

  const [name, setName] = useState("");
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.auth.user?.name);
  const navigate = useNavigate();

  // search users query
  const searchUsersQuery = useQuery({
    queryFn: () => searchUsersByName(name),
    queryKey: ["users", "profile", "search", { name }],
    enabled: name !== "",
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  // update user info mutation
  const updateMutation = useMutation({
    mutationFn: (name: string) => updateUserInfo({ name }),
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
    onSuccess: (data) => {
      dispatch(login(data.data));
      showToast("success", `Welcome ${data.data.name}`);
      navigate("/");
    },
  });

  // if the username is not null return to home
  if (username !== null) {
    return <Navigate to="/" />;
  }

  const onSubmit: SubmitHandler<IUsernameInput> = (data) => {
    updateMutation.mutate(data.name);
  };

  return (
    <div className="flex w-full justify-center mt-10">
      <Card className="sm:max-w-[450px] w-[90%] h-fit">
        <CardHeader className="flex flex-col items-center">
          <img src="/logo.png" alt="" className="h-10" />
          <CardTitle className="py-2">Please Create a Username</CardTitle>
          <CardContent className="p-0 py-6 w-[90%]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid w-full items-center gap-4"
            >
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                type="text"
                {...register("name", {
                  required: "Username field is required!",
                  maxLength: {
                    value: 25,
                    message: "Username cannot be longer than 25 characters!",
                  },
                  onChange: (e) => {
                    queryClient.removeQueries([
                      "users",
                      "profile",
                      "search",
                      { name },
                    ]);
                    setName(e.target.value);
                  },
                  validate: () => {
                    if (
                      searchUsersQuery.data &&
                      searchUsersQuery.data.data.filter(
                        (user: UserType) => user.name === watch("name")
                      ).length !== 0
                    ) {
                      return "Username already taken!";
                    }
                  },
                })}
              />
              {errors?.name && (
                <p className="text-red-600 text-sm">{errors?.name?.message}</p>
              )}
              <div className="flex gap-2 items-center">
                <Button type="submit" className="w-fit">
                  Create
                </Button>
                {searchUsersQuery.isLoading && <Spinner />}

                {name !== "" &&
                  searchUsersQuery.data &&
                  searchUsersQuery.data.data.filter(
                    (user: UserType) => user.name === name
                  ).length === 0 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z"
                        fill="#00FF00"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  )}

                {name !== "" &&
                  searchUsersQuery.data &&
                  !(
                    searchUsersQuery.data.data.filter(
                      (user: UserType) => user.name === name
                    ).length === 0
                  ) && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                        fill="#FF0000"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  )}
              </div>
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default PickNamePage;
