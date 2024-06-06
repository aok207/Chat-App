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
  const splitted = name?.split(" ");
  if (splitted && splitted.length > 1) {
    return `${splitted[0][0] + splitted[1][0]}`;
  } else {
    return name?.slice(0, 2);
  }
};

export const formatTime = (time: string) => {
  const [hoursMinutes, postfix] = time.split(" ");
  let hours = hoursMinutes.split(":")[0];
  const minutes = hoursMinutes.split(":")[1];

  if (hours === "0" && postfix === "pm") {
    hours = "12";
  }

  return `${hours}:${minutes} ${postfix}`;
};

export const formatSentDate = (date: Date) => {
  const givenDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  // Reset time part for comparison
  givenDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  const givenDateTime = new Date(date); // Preserve original time for time output

  if (givenDate.getTime() === today.getTime()) {
    // Today, show the time
    return formatTime(
      givenDateTime.toLocaleString(navigator.language, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    );
  } else if (givenDate.getTime() === yesterday.getTime()) {
    // Yesterday
    return "Yesterday";
  } else {
    // Else, show the full date
    return givenDateTime.toLocaleDateString(navigator.language);
  }
};

export const formatActiveTime = (targetTime: Date) => {
  const now = new Date().getTime();
  const secondsPast = (now - new Date(targetTime).getTime()) / 1000;

  if (secondsPast < 60) {
    return "a few moments ago";
  }

  if (secondsPast < 3600) {
    const minutesPast = Math.floor(secondsPast / 60);
    return `${minutesPast} minute${minutesPast === 1 ? "" : "s"} ago`;
  }

  if (secondsPast < 86400) {
    const hoursPast = Math.floor(secondsPast / 3600);
    return `${hoursPast} hour${hoursPast === 1 ? "" : "s"} ago`;
  }

  if (secondsPast < 604800) {
    const daysPast = Math.floor(secondsPast / 86400);
    return `${daysPast} day${daysPast === 1 ? "" : "s"} ago`;
  }

  if (secondsPast < 2592000) {
    const weeksPast = Math.floor(secondsPast / 604800);
    return `${weeksPast} week${weeksPast === 1 ? "" : "s"} ago`;
  }

  if (secondsPast < 31557600) {
    const monthsPast = Math.floor(secondsPast / 2592000);
    return `${monthsPast} month${monthsPast === 1 ? "" : "s"} ago`;
  }

  const yearspast = Math.floor(secondsPast / 31557600);
  return `${yearspast} year${yearspast === 1 ? "" : "s"} ago`;
};
