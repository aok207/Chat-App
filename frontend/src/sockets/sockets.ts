import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKETS_BASE_URL;

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});
