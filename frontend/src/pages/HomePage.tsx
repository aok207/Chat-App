import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { setCurrentPage } from "@/slices/uiSlice";
import { useEffect } from "react";

const HomePage = () => {
  const user = useAppSelector((state) => state.auth?.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentPage("chats-list"));
  }, []);

  return (
    <div>
      <h1>Hello {user?.name}</h1>
    </div>
  );
};

export default HomePage;
