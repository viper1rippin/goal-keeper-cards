
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import IndexHeader from "@/components/index/IndexHeader";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import WelcomeCard from "@/components/WelcomeCard";

const Index = () => {
  const { user } = useAuth();

  return (
    <IndexPageProvider>
      <div className="min-h-screen flex flex-col bg-apple-dark">
        <IndexHeader />
        {user ? (
          <GoalsContent />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <WelcomeCard />
          </div>
        )}
        <Footer />
        <DialogManager />
      </div>
    </IndexPageProvider>
  );
};

export default Index;
