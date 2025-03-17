
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme from localStorage if available
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.classList.add(savedTheme);
}

// Call the initialize function
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
