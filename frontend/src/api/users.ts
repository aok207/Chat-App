import axios from "axios";
import { serverBaseUrl } from "@/lib/constants";
import { IUserAuthInputs } from "@/types/types";

export const postLogin = async (data: IUserAuthInputs) => {
  return axios
    .post(serverBaseUrl + "/auth/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res);
};

export const postRegister = async (data: IUserAuthInputs) => {
  return axios
    .post(serverBaseUrl + "/auth/register", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res);
};

export const getUserProfile = async () => {
  return axios
    .get(serverBaseUrl + "/users/profile", { withCredentials: true })
    .then((res) => res.data);
};
