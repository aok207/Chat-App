import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast, Bounce } from "react-toastify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type showToastFn = (
  type: "error" | "success" | "info",
  message: string
) => void;

export const showToast: showToastFn = (type, message) => {
  switch (type) {
    case "error":
      toast.error(`${message}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      break;
    case "success":
      toast.success(`${message}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      break;
    case "info":
      toast.info(`${message}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
  }
};

export const makeFallbackAvatar = (name: string): string => {
  const splitted = name.split(" ");
  if (splitted.length > 1) {
    return `${splitted[0][0] + splitted[1][0]}`;
  } else {
    return name.slice(0, 2);
  }
};
