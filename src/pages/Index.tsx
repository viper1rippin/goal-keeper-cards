
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import IndexHeader from "@/components/index/IndexHeader";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Index = () => {
  return (
    <ProtectedRoute>
      <IndexPageProvider>
        <div className="min-h-screen flex flex-col bg-apple-dark">
          <IndexHeader />
          <GoalsContent />
          <Footer />
          <DialogManager />
        </div>
      </IndexPageProvider>
    </ProtectedRoute>
  );
};

export default Index;
