import { useAppSelector } from "@/hooks/hooks";
import Navbar from "./Navbar";
import { useQuery } from "react-query";
import { searchUsersByName } from "@/api/users";
import { cn, showToast } from "@/lib/utils";
import Search from "./Search";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Chat from "./Chat";
import { Link } from "react-router-dom";

// dummy data
const chats = [
  {
    id: "1",
    name: "AOK",
    latestMessage:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, esse consequuntur minima assumenda excepturi provident, quas voluptatum iure necessitatibus aliquam error veritatis voluptate voluptas officia consequatur. Corrupti porro distinctio dolores!",
    latestTime: "yesterday",
    isOnline: true,
    avatar: "https://i.ibb.co/pzwJgRx/1a03dc4738fe.jpg",
  },
  {
    id: "2",
    name: "Test1",
    latestMessage:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, esse consequuntur minima assumenda excepturi provident, quas voluptatum iure necessitatibus aliquam error veritatis voluptate voluptas officia consequatur. Corrupti porro distinctio dolores!",
    latestTime: "yesterday",
    isOnline: false,
    avatar: "https://i.ibb.co/pzwJgRx/1a03dc4738fe.jpg",
  },
  {
    id: "3",
    name: "Test2",
    latestMessage:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, esse consequuntur minima assumenda excepturi provident, quas voluptatum iure necessitatibus aliquam error veritatis voluptate voluptas officia consequatur. Corrupti porro distinctio dolores!",
    latestTime: "yesterday",
    isOnline: true,
    avatar: "https://i.ibb.co/pzwJgRx/1a03dc4738fe.jpg",
  },
];

const ChatsList = () => {
  const user = useAppSelector((state) => state.auth.user);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const currentPage = useAppSelector((state) => state.ui.currentPage);

  // search users query
  const searchUsersQuery = useQuery({
    queryFn: () => searchUsersByName(searchQuery),
    queryKey: ["users", "profile", "search", { name: searchQuery }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  return (
    <div className="flex flex-col gap-4 px-3 overflow-auto h-full">
      <Tabs className={cn("w-full h-full flex flex-col")} defaultValue="chats">
        <div className="w-full flex gap-2 items-center h-fit">
          <div className="flex-grow">
            <Navbar user={user} searchUsersQuery={searchUsersQuery} />
          </div>
          <TabsList className={cn("flex flex-shrink-0")}>
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
        </div>
        {currentPage !== "search" ? (
          <>
            <TabsContent value="chats" className="h-full w-full">
              <div className="flex flex-col gap-2 w-full">
                {chats.map((chat, index) => (
                  <Link to={`/chats/${chat.id}`} key={index}>
                    <Chat
                      chatId={chat.id}
                      latestMessage={chat.latestMessage}
                      isOnline={chat.isOnline}
                      avatar={chat.avatar}
                      latestTime={chat.latestTime}
                      name={chat.name}
                    />
                  </Link>
                ))}
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
              />
            )}
          </AnimatePresence>
        )}
      </Tabs>
    </div>
  );
};

export default ChatsList;
