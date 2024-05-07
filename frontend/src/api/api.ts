import axios from "axios";
import { serverBaseUrl } from "@/lib/constants";

const api = axios.create({
  baseURL: serverBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
