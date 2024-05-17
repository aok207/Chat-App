import { useAppSelector } from "@/hooks/hooks";
import { UserType } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import User from "./User";
import { Skeleton } from "./skeleton";

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
}: {
  isLoading: boolean;
  users: UserType[];
}) => {
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const currentPage = useAppSelector((state) => state.ui.currentPage);

  return (
    <div className="h-full">
      {searchQuery === "" && currentPage === "search" && (
        <div className="overflow-hidden flex flex-col justify-center h-full items-center">
          <motion.img
            src="/magnifying_glass.png"
            alt="magnifying_glass"
            className="w-1/2"
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
                      <User user={user} />
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
