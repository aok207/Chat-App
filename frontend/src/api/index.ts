import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL
    ? import.meta.env.VITE_SERVER_BASE_URL + "/api/v1"
    : "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
