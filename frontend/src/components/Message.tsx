import { CheckCheck, CircleX } from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";
import Avatar from "./Avatar";
import { formatTime } from "@/lib/utils";

type MessageProps = {
  senderId: string;
  message: string;
  avatar: string | null | undefined;
  sentTime: Date;
  status?: "sent" | "sending" | "read" | "error" | string;
  previousSenderId: string | null;
  name: string;
};

const Message = ({
  senderId,
  message,
  sentTime,
  status,
  previousSenderId,
  avatar,
  name,
}: MessageProps) => {
  const userId = useAppSelector((state) => state.auth.user?._id);

  return (
    <div
      className={`w-full h-fit flex ${
        userId === senderId ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[45%] relative flex flex-col items-start gap-2 ${
          userId === senderId ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex gap-2 items-center ${
            userId === senderId ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Avatar name={name} image={`${avatar}`} isOnline={false} />
          <div
            className={`px-2 py-1 ${
              status !== "error" ? "bg-gray-200 dark:bg-gray-700" : "bg-red-600"
            } flex flex-col h-fit ${
              senderId === previousSenderId
                ? "rounded-lg"
                : senderId === userId
                ? "rounded-xl rounded-tr-none"
                : "rounded-xl rounded-tl-none"
            }`}
          >
            <pre className="text-[1rem] font-normal font-sans text-gray-900 dark:text-white text-left">
              {message}
            </pre>
            <div className="w-full h-full flex-shrink-0">
              {senderId === userId && status === "read" && (
                <CheckCheck className="text-purple-500 w-3.5 h-3.5 flex-shrink-0" />
              )}
              {senderId === userId && status === "sending" && (
                <div className="text-xs font-normal text-gray-400">
                  Sending...
                </div>
              )}
              {senderId === userId && status === "sent" && (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              {senderId === userId && status === "error" && (
                <span className="text-xs font-semibold flex gap-1">
                  <CircleX className="w-4 h-4 text-red-600" /> Couldn't sent
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="text-xs font-medium dark:text-slate-300 text-slate-800">
          {formatTime(
            new Date(sentTime).toLocaleString(navigator.language, {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
          )}
        </span>
      </div>
    </div>
  );
};

export default Message;
