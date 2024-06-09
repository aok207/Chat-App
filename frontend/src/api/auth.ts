import api from ".";
import { IResetPasswordInputs } from "@/types/types";

import { IUserAuthInputs } from "@/types/types";

export const postLogin = (data: IUserAuthInputs) => {
  return api.post("/auth/login", data).then((res) => res);
};

export const postRegister = (data: IUserAuthInputs) => {
  return api.post("/auth/register", data).then((res) => res);
};

export const postLogOut = () => {
  return api.delete("/auth/logout").then((res) => res.data);
};

export const postForgotPassword = (email: string) => {
  return api.post("/auth/forgot-password", { email }).then((res) => res.data);
};

export const verifyResetToken = (token: string) => {
  return api.get(`/auth/verify-reset-token/${token}`);
};

export const postResetPassword = ({
  data,
  token,
}: {
  data: IResetPasswordInputs;
  token: string;
}) => {
  return api
    .post(`/auth/reset-password/${token}`, data)
    .then((res) => res.data);
};
