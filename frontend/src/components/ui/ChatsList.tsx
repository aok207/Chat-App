import { useAppSelector } from "@/hooks/hooks";
import Navbar from "./Navbar";
import { useQuery } from "react-query";
import { searchUsersByName } from "@/api/users";
import { showToast } from "@/lib/utils";
import Search from "./Search";
import { AnimatePresence } from "framer-motion";

const ChatsList = () => {
  const user = useAppSelector((state) => state.auth?.user);
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
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return (
    <div className="flex flex-col gap-4 px-3 overflow-auto h-full">
      <Navbar user={user} searchUsersQuery={searchUsersQuery} />
      <AnimatePresence>
        {currentPage === "search" && (
          <Search
            isLoading={searchUsersQuery.isLoading}
            users={searchUsersQuery.data?.data}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatsList;
