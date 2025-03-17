
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import IndexHeader from "@/components/index/IndexHeader";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { loading } = useAuth();

  // Show a simple loading indicator while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-apple-dark">
        <div className="text-white text-lg">Loading your goals...</div>
      </div>
    );
  }

  return (
    <IndexPageProvider>
      <div className="min-h-screen flex flex-col bg-apple-dark">
        <IndexHeader />
        <GoalsContent />
        <Footer />
        <DialogManager />
      </div>
    </IndexPageProvider>
  );
};

export default Index;
