import { UserType } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { makeFallbackAvatar } from "@/lib/utils";

const User = ({
  user,
  latestChat,
}: {
  user: UserType;
  latestChat?: string;
}) => {
  return (
    <div
      className={`w-full h-fit py-2 px-4 rounded-lg flex gap-2 cursor-pointer hover:bg-slate-200 hover:dark:bg-slate-500 bg-transparent transition-colors duration-300 ${
        !latestChat ? "items-center" : ""
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
  );
};

export default User;
