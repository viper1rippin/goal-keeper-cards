
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import IndexHeader from "@/components/index/IndexHeader";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GuestWelcome = () => {
  return (
    <div className="flex-1 py-10 px-6 sm:px-8 md:px-12 lg:px-16 flex flex-col items-center justify-center">
      <div className="glass-card p-10 rounded-lg border border-slate-800/80 text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Welcome to Goal Tracker</h1>
        <p className="text-slate-300 mb-8">Sign up to start tracking your goals and build better habits.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-emerald hover:bg-emerald-dark">
            <Link to="/signup">Sign Up</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-apple-dark">
      <IndexHeader />
      
      {user ? (
        <IndexPageProvider>
          <GoalsContent />
          <DialogManager />
        </IndexPageProvider>
      ) : (
        <GuestWelcome />
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
