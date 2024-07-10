import { Link, useLocation } from "react-router-dom";
import Avatar from "../shared/Avatar";
import { useAppSelector } from "@/hooks/useRedux";
import { CheckCheck } from "lucide-react";
import { formatSentDate } from "@/lib/utils";

type ChatProps = {
  chatId: string;
  latestMessage: string | null | undefined;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  latestTime: Date | null | undefined;
  latestMessageStatus: string | null;
  latestMessageSenderId: string | null;
  latestMessageType: string | undefined | null;
};

const Chat = ({
  chatId,
  latestMessage,
  name,
  avatar,
  isOnline,
  latestTime,
  latestMessageStatus,
  latestMessageSenderId,
  latestMessageType,
}: ChatProps) => {
  const id = useLocation().pathname.split("/")[2];
  const userId = useAppSelector((state) => state.auth.user?._id);

  return (
    <Link
      to={userId === chatId ? "#" : `/chat/${chatId}`}
      className="w-full h-fit"
    >
      <div
        className={`w-full h-fit p-2 flex gap-2 items-center justify-start rounded-lg hover:bg-slate-200 hover:dark:bg-slate-500 transition-colors duration-300 ${
          id === chatId && latestMessage && latestMessageSenderId
            ? "bg-slate-200 dark:bg-slate-500"
            : "bg-transparent"
        }`}
      >
        <div>
          <Avatar name={name} image={`${avatar}`} isOnline={isOnline} />
        </div>
        <div className="flex flex-col w-full items-start gap-1 overflow-hidden">
          <div className="flex justify-between w-full">
            <p className="font-semibold dark:text-white text-black text-sm">
              {name}
            </p>
            <span className="text-xs font-medium dark:text-slate-300 text-slate-800">
              {latestTime && formatSentDate(latestTime)}
            </span>
          </div>
          <div className="w-full text-left relative">
            {latestMessageType === "text" ? (
              <p
                className={`truncate w-[85%] text-sm  ${
                  latestMessageSenderId !== userId &&
                  latestMessageStatus !== "read"
                    ? "dark:text-white text-black font-bold"
                    : "font-normal dark:text-slate-300 text-slate-500"
                } `}
              >
                {latestMessage}
              </p>
            ) : (
              <p
                className={`text-sm ${
                  latestMessageSenderId !== userId &&
                  latestMessageStatus !== "read"
                    ? "dark:text-white text-black font-bold"
                    : "font-normal dark:text-slate-300 text-slate-500"
                } `}
              >
                {userId === latestMessageSenderId ? "You" : name} sent{" "}
                {latestMessageType?.toLowerCase() === "Video"
                  ? "Audio"
                  : ["a", "e", "i", "o", "u"].includes(
                      latestMessageType?.charAt(0).toLowerCase() || ""
                    )
                  ? "an"
                  : "a"}{" "}
                {latestMessageType === "raw" ? "file" : latestMessageType}.
              </p>
            )}

            {latestMessageSenderId !== null &&
              latestMessageSenderId !== userId &&
              latestMessageStatus !== "read" && (
                <div className="w-3 h-3 rounded-full absolute bottom-2 right-2 shadow-md bg-purple-500" />
              )}
            {latestMessageSenderId !== null &&
              latestMessageSenderId === userId &&
              latestMessageStatus === "sent" && (
                <CheckCheck className="w-3 h-3 absolute bottom-2 right-2" />
              )}
            {latestMessageSenderId !== null &&
              latestMessageSenderId === userId &&
              latestMessageStatus === "read" && (
                <CheckCheck className="w-3 h-3 absolute bottom-2 right-2 text-purple-500" />
              )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Chat;
