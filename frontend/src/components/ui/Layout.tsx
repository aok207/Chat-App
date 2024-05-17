import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatsList from "./ChatsList";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <div className="w-full h-full hidden md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={20}
            minSize={10}
            className="p-1 overflow-hidden h-screen"
          >
            <ChatsList />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="p-1 px-3">{children}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default Layout;
