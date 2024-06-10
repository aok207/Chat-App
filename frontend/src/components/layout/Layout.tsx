import { ReactNode, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ConversationList from "../chats/ConversationList";
import { useAppSelector } from "@/hooks/useRedux";
import ProtectedRoutes from "../shared/ProtectedRoutes";
import { socket } from "@/sockets/sockets";
import { useQueryClient } from "react-query";
import useSound from "@/hooks/useSound";

const Layout = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const currentPage = useAppSelector((state) => state.ui.currentPage);
  const queryClient = useQueryClient();
  const notiSound = useSound("/sounds/message-noti.mp3");

  useEffect(() => {
    // connect to sockets.io
    socket.connect();
  }, []);

  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.log(err);
    });

    // receiving message event if the user is on other pages
    socket.on("messages changed", () => {
      queryClient.invalidateQueries(["chats"]);
      notiSound.play();
    });

    return () => {
      socket.off("connect_error");
    };
  }, []);

  return (
    <ProtectedRoutes type="auth">
      <div className="w-full h-full hidden lg:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            minSize={20}
            className="overflow-hidden h-screen w-[35%] md:w-[25%] lg:w-[20%]"
          >
            <ConversationList />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            minSize={70}
            className="w-full h-full bg-gray-100 dark:bg-gray-900 overflow-hidden bg"
          >
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* for mobile */}
      <div className="w-full h-full lg:hidden overflow-hidden">
        {currentPage === "chats-list" || currentPage === "search" ? (
          <ConversationList />
        ) : (
          <>{children}</>
        )}
      </div>
    </ProtectedRoutes>
  );
};

export default Layout;
