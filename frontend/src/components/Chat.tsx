import { cn, makeFallbackAvatar } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useParams } from "react-router-dom";

type ChatProps = {
  chatId: string;
  latestMessage: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  latestTime: string;
};

const Chat = ({
  chatId,
  latestMessage,
  name,
  avatar,
  isOnline,
  latestTime,
}: ChatProps) => {
  const { id } = useParams();

  return (
    <div
      className={`w-full h-fit p-2 flex gap-2 items-center justify-start rounded-lg hover:bg-slate-200 hover:dark:bg-slate-500 transition-colors duration-300 ${
        id === chatId ? "bg-slate-200 dark:bg-slate-500" : "bg-transparent"
      }`}
    >
      <div>
        <Avatar className={cn("relative")}>
          <AvatarImage src={avatar as string} />
          <AvatarFallback>{makeFallbackAvatar(name)}</AvatarFallback>
          {isOnline && (
            <div className="w-2 h-2 bg-green-600 absolute bottom-0 left-full" />
          )}
        </Avatar>
      </div>
      <div className="flex flex-col gap-2 overflow-hidden">
        <div className="flex justify-between w-full">
          <p className="font-semibold dark:text-white text-black text-sm">
            {name}
          </p>
          <span className="text-xs font-medium dark:text-slate-300 text-slate-800">
            {latestTime}
          </span>
        </div>
        <p className="truncate text-nowrap text-sm font-medium dark:text-slate-300 text-slate-800">
          {latestMessage}
        </p>
      </div>
    </div>
  );
};

export default Chat;
