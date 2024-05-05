import axios from "axios";
import { serverBaseUrl } from "@/lib/constants";

interface ILoginData {
  email: string;
  password: string;
}

interface IRegisterData extends ILoginData {
  username: string;
  confirmPassword: string;
}

export const login = async (data: ILoginData) => {
  return axios
    .post(serverBaseUrl + "/auth/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res);
};

export const register = async (data: IRegisterData) => {
  return axios
    .post(serverBaseUrl + "/auth/register", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res);
};
