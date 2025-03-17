
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme from localStorage if available
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.classList.add(savedTheme === "dark" ? "dark-mode" : "light-mode");
};

// Run theme initialization before rendering
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
