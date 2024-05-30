/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserType } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { makeFallbackAvatar } from "@/lib/utils";
import { Link } from "react-router-dom";

const User = ({
  user,
  latestMessage,
}: {
  user: UserType;
  latestMessage?: string;
}) => {
  return (
    <Link to={`/chat/${user._id}`} className="w-full h-fit">
      <div
        className={`w-full relative h-fit rounded-lg flex gap-2 py-2 px-4 hover:bg-slate-200 hover:dark:bg-slate-500
        bg-transparent transition-colors duration-300 ${
          !latestMessage ? "items-center" : ""
        }`}
      >
        <div className="relative">
          <Avatar>
            <AvatarImage src={user.avatar as string} />
            <AvatarFallback>{makeFallbackAvatar(user.name)}</AvatarFallback>
          </Avatar>
          {user.isOnline && (
            <div className="w-3 h-3 bg-green-600 absolute right-0 bottom-0 rounded-full" />
          )}
        </div>
        <div>
          <span className="font-semibold text-sm">{user.name}</span>
        </div>
      </div>
    </Link>
  );
};

export default User;
