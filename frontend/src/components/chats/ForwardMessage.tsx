/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { searchUsersByName } from "@/api/users";
import { ChangeEvent, useState } from "react";
import { cn, showToast } from "@/lib/utils";
import { Input } from "../ui/input";
import Spinner from "../ui/spinner";
import { MessageType, UserType } from "@/types/types";
import { Button } from "../ui/button";
import Avatar from "../shared/Avatar";
import { Checkbox } from "../ui/checkbox";
import { sendMessage } from "@/api/messages";
import { socket } from "@/sockets/sockets";

const ForwardMessage = ({ message }: { message: MessageType }) => {
  const queryClient = useQueryClient();

  // search users query
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);

  const { isLoading, data } = useQuery({
    queryFn: () => searchUsersByName(query),
    queryKey: ["forward", "search", { name: query }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  async function handleForward() {
    if (selectedUsers.length < 1) {
      showToast("error", "Please choose someone to forward first.");
      return;
    }

    const data = new FormData();

    if (message.type === "text") {
      data.append("message", message.content!);
    } else {
      data.append("fileObj", JSON.stringify(message.file));
      data.append("fileType", message.type!);
    }

    for (const index in selectedUsers) {
      try {
        await sendMessageMutation.mutateAsync({
          receiverId: selectedUsers[index]._id,
          data,
        });
      } catch (error) {
        showToast("error", "Failed to forward message.");
        console.error("Error forwarding message:", error);
      }
    }
    queryClient.invalidateQueries(["chats"]);

    selectedUsers.forEach((user) => {
      socket.emit("changed messages", user._id);
      queryClient.invalidateQueries(["messages", user._id]);
      showToast("success", "Message forwarded successfully.");
    });
  }

  return (
    <DialogContent className="w-[90%] md:w-3/4 lg:w-1/2 h-2/3 flex flex-col flex-auto gap-4">
      <DialogHeader className="flex-grow-0">
        <DialogTitle className="dark:text-gray-300 text-black">
          Forward message to
        </DialogTitle>
      </DialogHeader>
      <div className="w-full relative flex-shrink-0 flex-grow-0">
        <Input
          className="pl-8 text-black dark:text-white"
          name="query"
          placeholder="Search..."
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
          }}
          autoComplete="off"
        />
        <SearchIcon className="w-4 h-4 peer-focus:dark:text-white peer-focus:text-black text-gray-400 absolute inset-0 top-1/2 transform -translate-y-1/2 left-2" />
      </div>
      <hr />
      <div className="flex flex-col gap-4 w-full overflow-y-auto flex-grow">
        <ScrollArea className="w-full h-full dark:text-white text-black">
          <div className="w-full flex flex-col gap-4">
            {isLoading ? (
              <div className="w-fit mx-auto">
                <Spinner />
              </div>
            ) : (
              <>
                {data?.data.map((user) => (
                  <User
                    key={user._id}
                    user={user}
                    setSelectedUsers={setSelectedUsers}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="flex justify-center items-center flex-grow-0">
        <Button
          variant={"primary"}
          className={cn("rounded-full")}
          onClick={handleForward}
          disabled={selectedUsers.length < 1 || sendMessageMutation.isLoading}
        >
          {sendMessageMutation.isLoading ? <Spinner /> : "Forward"}
        </Button>
      </div>
    </DialogContent>
  );
};

const User = ({
  user,
  setSelectedUsers,
}: {
  user: UserType;
  setSelectedUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
}) => {
  const [checked, setChecked] = useState(false);

  async function handleCheck() {
    setSelectedUsers((prevUsers) => {
      if (!checked) {
        return [...prevUsers, user];
      }

      return prevUsers.filter((u) => u._id !== user._id);
    });
    setChecked((prev) => !prev);
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <Avatar
          image={user.avatar as string}
          isOnline={false}
          name={user.name}
        />
        <b className="text-sm">{user.name}</b>
      </div>
      <Checkbox
        checked={checked}
        onClick={handleCheck}
        className={cn("rounded-full w-5 h-5")}
      />
    </div>
  );
};

export default ForwardMessage;
