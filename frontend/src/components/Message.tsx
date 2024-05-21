import { CheckCheck, CircleX } from "lucide-react";
import Spinner from "./ui/spinner";
import { forwardRef } from "react";

type MessageProps = {
  userId: string;
  senderId: string;
  message: string;
  sentTime: string;
  status?: "sent" | "sending" | "read" | "error" | string;
  previousSenderId: string;
};

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ userId, senderId, message, sentTime, status, previousSenderId }, ref) => {
    return (
      <div
        className={`w-full h-fit flex ${
          userId === senderId ? "justify-end" : "justify-start"
        }`}
      >
        <div className="max-w-[45%] flex-col flex items-end" ref={ref}>
          <div
            className={`px-2 py-3 ${
              status !== "error"
                ? "bg-slate-300 dark:bg-slate-600"
                : "bg-red-600"
            } flex flex-col gap-1 ${
              senderId === previousSenderId
                ? "rounded-lg"
                : senderId === userId
                ? "rounded-lg rounded-br-none"
                : "rounded-lg rounded-bl-none"
            }`}
          >
            <p className="text-sm">{message}</p>
            <div className="w-full flex justify-between items-center">
              <span className="text-xs font-medium dark:text-slate-300 text-slate-800">
                {sentTime}
              </span>
              {status === "read" && (
                <CheckCheck className="text-purple-500 w-4 h-4" />
              )}
              {status === "sending" && (
                <div className="flex-shrink-0 w-fit h-fit">
                  <Spinner />
                </div>
              )}
              {status === "sent" && <CheckCheck className="w-4 h-4" />}
            </div>
          </div>
          {status === "error" && (
            <span className="text-xs font-semibold flex gap-1">
              <CircleX className="w-4 h-4 text-red-600" /> Couldn't sent
            </span>
          )}
        </div>
      </div>
    );
  }
);

export default Message;
