
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import AnimatedContainer from "@/components/AnimatedContainer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const IndexPage: React.FC = () => {
  return (
    <IndexPageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <AnimatedContainer className="flex-1 container mx-auto px-4 py-8">
          <GoalsContent />
          <DialogManager />
        </AnimatedContainer>
        <Footer />
      </div>
    </IndexPageProvider>
  );
};

export default IndexPage;
