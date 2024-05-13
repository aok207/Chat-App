import api from "./api";
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

export const getUserProfile = () => {
  return api.get("/users/profile").then((res) => res.data);
};

export const searchUsersByName = (name: string) => {
  return api.get(`/users/profile/search?name=${name}`).then((res) => res.data);
};

export const updateUserInfo = (data: {
  name?: string | null;
  email?: string | null;
  profilePicture?: string | null;
}) => {
  return api.put("/users/profile/update", data).then((res) => res.data);
};
