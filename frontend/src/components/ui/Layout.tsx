import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatsList from "./ChatsList";
import { useAppSelector } from "@/hooks/hooks";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const currentPage = useAppSelector((state) => state.ui.currentPage);
  return (
    <>
      <div className="w-full h-full hidden md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={20}
            minSize={20}
            className="p-1 overflow-hidden h-screen"
          >
            <ChatsList />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="p-1 w-full h-full overflow-hidden">
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* for mobile */}
      <div className="w-full h-full md:hidden overflow-hidden">
        {currentPage === "chats-list" || currentPage === "search" ? (
          <ChatsList />
        ) : (
          children
        )}
      </div>
    </>
  );
};

export default Layout;
