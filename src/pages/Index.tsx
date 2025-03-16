
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import IndexHeader from "@/components/index/IndexHeader";
import GoalsContent from "@/components/index/GoalsContent";
import Footer from "@/components/Footer";
import DialogManager from "@/components/index/DialogManager";
import { SidebarWrapper } from "@/components/AppSidebar";

const Index = () => {
  return (
    <IndexPageProvider>
      <SidebarWrapper>
        <div className="flex flex-col flex-1 bg-apple-dark">
          <IndexHeader />
          <GoalsContent />
          <Footer />
          <DialogManager />
        </div>
      </SidebarWrapper>
    </IndexPageProvider>
  );
};

export default Index;
