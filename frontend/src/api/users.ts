import api from "./api";

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
  console.log(data);
  return api.put("/users/profile/update", data).then((res) => res.data);
};
