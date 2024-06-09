import { useAppSelector } from "@/hooks/useRedux";
import Navbar from "../layout/Navbar";
import { useQuery } from "react-query";
import { searchUsersByName } from "@/api/users";
import { cn, showToast } from "@/lib/utils";
import Search from "../search/Search";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Chat from "./Chat";
import { getChatsForUser } from "@/api/messages";
import Spinner from "../ui/spinner";
import { ChatResponseType } from "@/types/types";
import { useEffect, useState } from "react";
import { socket } from "@/sockets/sockets";
import { Plus } from "lucide-react";
import ToolTip from "../shared/ToolTip";

const ConversationList = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const currentPage = useAppSelector((state) => state.ui.currentPage);

  const [chats, setChats] = useState<ChatResponseType[] | null>(null);

  // search users query
  const searchUsersQuery = useQuery({
    enabled: searchQuery !== "",
    queryFn: () => searchUsersByName(searchQuery),
    queryKey: ["users", "profile", "search", { name: searchQuery }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  // get user's chats
  const chatsQuery = useQuery({
    queryFn: getChatsForUser,
    queryKey: ["chats"],
    onSuccess: (data) => {
      setChats(data.data);
    },
  });

  // socket io events
  useEffect(() => {
    socket.on("user online", (otherUserId: string) => {
      setChats((prev) => {
        if (!prev) {
          return null;
        }
        return prev.map((chat) => {
          if (chat.otherUser._id === otherUserId) {
            return {
              ...chat,
              otherUser: { ...chat.otherUser, isOnline: true },
            };
          }
          return chat;
        });
      });
    });

    socket.on("user offline", (otherUserId: string) => {
      setChats((prev) => {
        if (!prev) {
          return null;
        }
        return prev.map((chat) => {
          if (chat.otherUser._id === otherUserId) {
            return {
              ...chat,
              otherUser: { ...chat.otherUser, isOnline: false },
            };
          }
          return chat;
        });
      });
    });

    return () => {
      socket.off("user online");
      socket.off("user offline");
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 px-3 overflow-auto h-full relative">
      <Tabs className={cn("w-full h-full flex flex-col")} defaultValue="chats">
        <div className="w-full flex gap-2 items-center h-fit">
          {/* <LayoutGroup> */}
          <div className="flex-grow">
            <Navbar user={currentUser} searchUsersQuery={searchUsersQuery} />
          </div>
          <AnimatePresence mode="popLayout">
            {currentPage !== "search" && (
              <motion.div
                className="flex flex-shrink-0"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                layout
              >
                <TabsList className={cn("flex")}>
                  <TabsTrigger
                    value="chats"
                    className={cn(
                      "dark:data-[state=active]:bg-purple-700 data-[state=active]:bg-purple-700 data-[state=active]:text-slate-50"
                    )}
                  >
                    Chats
                  </TabsTrigger>
                  <TabsTrigger
                    value="groups"
                    className={cn(
                      "dark:data-[state=active]:bg-purple-700 data-[state=active]:bg-purple-700 data-[state=active]:text-slate-50"
                    )}
                  >
                    Groups
                  </TabsTrigger>
                </TabsList>
              </motion.div>
            )}
          </AnimatePresence>
          {/* </LayoutGroup> */}
        </div>
        {currentPage !== "search" ? (
          <>
            <TabsContent value="chats" className="h-full w-full">
              <div
                className={`flex flex-col gap-2 w-full text-center ${
                  chatsQuery.isLoading
                    ? "h-full items-center justify-center"
                    : chatsQuery.data?.data.length === 0
                    ? "h-full items-center justify-center"
                    : ""
                }`}
              >
                {chatsQuery.isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    {chats && chats.length === 0 ? (
                      <p className="text-sm font-semibold">
                        You currently have no chats!
                      </p>
                    ) : (
                      <>
                        {chats &&
                          chats.map((chat) => (
                            <Chat
                              key={chat.otherUser._id}
                              chatId={chat.otherUser._id}
                              latestMessage={chat.latestMessage}
                              isOnline={chat.otherUser.isOnline}
                              avatar={chat.otherUser.avatar}
                              latestTime={chat.latestTime}
                              name={chat.otherUser.name}
                              latestMessageStatus={chat.latestMessageStatus}
                              latestMessageSenderId={chat.latestMessageSenderId}
                              latestMessageType={chat.latestMessageType}
                            />
                          ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="groups" className="h-full">
              Group
            </TabsContent>
          </>
        ) : (
          <AnimatePresence>
            {currentPage === "search" && (
              <Search
                isLoading={searchUsersQuery.isLoading}
                users={searchUsersQuery.data?.data}
                chats={chatsQuery.data?.data}
              />
            )}
          </AnimatePresence>
        )}
      </Tabs>
      <motion.div
        className="absolute rounded-full p-3 bg-gray-400 text-gray-200 dark:bg-gray-700 right-8 bottom-4 flex items-center justify-center w-fit h-fit"
        whileHover={{
          y: -5,
          transition: {
            type: "spring",
            duration: 0.3,
          },
        }}
      >
        <ToolTip text="New group">
          <button className="">
            <Plus />
          </button>
        </ToolTip>
      </motion.div>
    </div>
  );
};

export default ConversationList;
