import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatsList from "./ChatsList";
import { useAppSelector } from "@/hooks/hooks";
import { Outlet } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";

const Layout = () => {
  const currentPage = useAppSelector((state) => state.ui.currentPage);
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
