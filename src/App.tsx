
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Import pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import IndexPage from "./pages/IndexPage";
import GuestGoals from "./pages/GuestGoals";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import ProjectDetails from "./pages/ProjectDetails";
import ProgressTracker from "./pages/ProgressTracker";

// Import components
import Footer from "./components/Footer";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/guest" element={<GuestGoals />} />
          <Route path="/pricing" element={<Pricing />} />
        
          {/* Protected routes */}
          <Route path="/goals" element={<ProtectedRoute><IndexPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
        
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
