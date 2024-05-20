import api from "./api";

export const getUserProfile = () => {
  return api.get("/users/profile").then((res) => res.data);
};

export const searchUsersByName = (name: string) => {
  return api.get(`/users/profile/search?name=${name}`).then((res) => res.data);
};

export const updateUserInfo = (
  data:
    | {
        name?: string | null;
        email?: string | null;
        profilePicture?: string | null;
      }
    | FormData
) => {
  return api
    .put("/users/profile/update", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const updateUserPassword = (data: {
  password: string;
  currentPassword: string;
  confirmPassword: string;
}) => {
  return api
    .patch("/users/password/update/", data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((res) => res.data);
};

export const deleteAccount = () => {
  return api.delete("/users/profile").then((res) => res.data);
};
