import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../shared/Avatar";
import Spinner from "../ui/spinner";
import { formatActiveTime } from "@/lib/utils";
import { UserType } from "@/types/types";

type ChatNavProps = {
  otherUser: UserType | null;
  isLoading: boolean;
};

const ChatNav = ({ otherUser, isLoading }: ChatNavProps) => {
  return (
    <nav className="flex justify-between items-center bg-white dark:bg-black w-full py-2 px-4 ">
      <div className="flex gap-4 items-center">
        <Link to={"/"}>
          <ArrowLeft />
        </Link>

        {otherUser && (
          <Avatar
            name={otherUser?.name as string}
            image={otherUser?.avatar as string}
            isOnline={otherUser?.isOnline as boolean}
          />
        )}

        <div className="flex flex-col">
          {isLoading ? (
            <Spinner />
          ) : (
            <p className="text-sm font-medium">{otherUser?.name}</p>
          )}

          <span className="text-xs">
            {otherUser &&
              (otherUser?.isOnline
                ? "Active Now"
                : otherUser?.lastOnline
                ? `Last seen ${formatActiveTime(otherUser?.lastOnline)}`
                : "")}
          </span>
        </div>
      </div>
      {/* <div>
        <button>
          <PanelRight className="w-5 h-5" />
        </button>
      </div> */}
    </nav>
  );
};

export default ChatNav;
