import { useAppSelector } from "@/hooks/useRedux";
import { ChatResponseType, UserType } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import Chat from "../chats/Chat";

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
  },
};

const userItemVariant = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
  },
};

const Search = ({
  isLoading,
  users,
  chats,
}: {
  isLoading: boolean;
  users: UserType[];
  chats: ChatResponseType[] | undefined;
}) => {
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const currentPage = useAppSelector((state) => state.ui.currentPage);

  return (
    <div className="h-full">
      {searchQuery === "" && currentPage === "search" && (
        <div className="overflow-hidden text-center flex flex-col justify-center h-full items-center">
          <motion.img
            src="/magnifying_glass.png"
            alt="magnifying_glass"
            className="w-40"
            initial={{ x: 100, y: -100, rotate: 80 }}
            animate={{ x: 0, y: 0, rotate: 0 }}
            exit={{ x: 300, y: -300, rotate: 80 }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Your search result will appear here
          </motion.span>
        </div>
      )}
      {searchQuery !== "" && (
        <ScrollArea key="search-query" className="w-full h-full">
          <div className="flex flex-col items-center w-full">
            {isLoading ? (
              <div className="w-full h-fit py-2 px-4 rounded-lg flex gap-2 ">
                <Skeleton className="rounded-full w-10 h-10 flex-shrink-0" />
                <div className="w-full flex flex-col gap-2">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-[90%] h-4" />
                </div>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  className="grid grid-cols-1 gap-2 w-full"
                  variants={containerVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {users?.map((user) => (
                    <motion.div key={user.name} variants={userItemVariant}>
                      {chats?.filter((chat) => chat.otherUser._id === user._id)
                        .length === 0 ? (
                        <Chat
                          chatId={user._id}
                          latestMessage={null}
                          latestTime={null}
                          avatar={user.avatar}
                          name={user.name}
                          isOnline={user.isOnline}
                          latestMessageSenderId={null}
                          latestMessageStatus={null}
                          latestMessageType={null}
                        />
                      ) : (
                        <Chat
                          chatId={user._id}
                          latestMessage={
                            chats?.filter(
                              (chat) => chat.otherUser._id === user._id
                            )[0].latestMessage
                          }
                          latestTime={
                            chats?.filter(
                              (chat) => chat.otherUser._id === user._id
                            )[0].latestTime
                          }
                          latestMessageSenderId={
                            chats?.filter(
                              (chat) => chat.otherUser._id === user._id
                            )[0].latestMessageSenderId as string
                          }
                          latestMessageStatus={
                            chats?.filter(
                              (chat) => chat.otherUser._id === user._id
                            )[0].latestMessageStatus as string
                          }
                          avatar={user.avatar}
                          name={user.name}
                          isOnline={user.isOnline}
                          latestMessageType={null}
                        />
                      )}
                    </motion.div>
                  ))}
                  {users?.length === 0 && (
                    <p className="mx-auto">No results found!</p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default Search;
