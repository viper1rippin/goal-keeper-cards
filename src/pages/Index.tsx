
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import IndexHeader from "@/components/index/IndexHeader";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If user is not logged in and not loading, redirect to login
  // But we'll allow showing the page even if not logged in (will default to thawlinoo2021@gmail.com)
  // The commented redirect would enforce login
  /*
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  */

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
