import { useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatsList from "./ChatsList";
import { useAppSelector } from "@/hooks/hooks";
import { Outlet } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import { socket } from "@/sockets/sockets";
import { showToast } from "@/lib/utils";

const Layout = () => {
  const currentPage = useAppSelector((state) => state.ui.currentPage);

  useEffect(() => {
    // connect to sockets.io
    socket.connect();
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      showToast("success", "Connected to socket server!");
    });

    socket.on("connect_error", (err) => {
      console.log(err);
      showToast("error", err.message);
    });

    return () => {
      socket.off("connect_error");
    };
  }, []);

  return (
    <ProtectedRoutes type="auth">
      <div className="w-full h-full hidden md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={20}
            minSize={20}
            className="overflow-hidden h-screen"
          >
            <ChatsList />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="w-full h-full bg-gray-100 dark:bg-gray-900 overflow-hidden bg">
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* for mobile */}
      <div className="w-full h-full md:hidden overflow-hidden">
        {currentPage === "chats-list" || currentPage === "search" ? (
          <ChatsList />
        ) : (
          <Outlet />
        )}
      </div>
    </ProtectedRoutes>
  );
};

export default Layout;
