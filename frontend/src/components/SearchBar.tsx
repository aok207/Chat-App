import { Input } from "./ui/input";
import { ChangeEvent, useState } from "react";
import { SearchIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { setSearchQuery, setCurrentPage } from "@/slices/uiSlice";

const SearchBar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);

  return (
    <div className="py-2 w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for users..."
          className="px-7 peer h-fit"
          value={searchQuery}
          onFocus={() => {
            setIsSearchFocused(true);
            dispatch(setCurrentPage("search"));
          }}
          onBlur={() => {
            if (searchQuery !== "") return;
            setIsSearchFocused(false);
            dispatch(setCurrentPage("chats-list"));
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            dispatch(setSearchQuery(e.target.value));
          }}
        />
        <SearchIcon className="w-4 h-4 peer-focus:dark:text-white peer-focus:text-black text-gray-400 absolute inset-0 top-1/2 transform -translate-y-1/2 left-2" />
        <AnimatePresence>
          {isSearchFocused && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ rotate: 180, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              exit={{ rotate: 0, scale: 0 }}
              className="absolute inset-full left-[97%] top-[75%]"
              onClick={() => {
                setIsSearchFocused(false);
                dispatch(setSearchQuery(""));
                dispatch(setCurrentPage("chats-list"));
              }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
