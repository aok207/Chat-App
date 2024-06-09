import { useAppDispatch } from "@/hooks/useRedux";
import { setCurrentPage } from "@/store/slices/uiSlice";
import { useEffect } from "react";

const HomePage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentPage("chats-list"));
  }, []);

  return (
    <div className="w-full h-full grid place-items-center">
      <p className="rounded-full px-3 text-white bg-black/30 dark:text-white dark:bg-slate-900 p-2">
        Select a chat to start messaging
      </p>
    </div>
  );
};

export default HomePage;
