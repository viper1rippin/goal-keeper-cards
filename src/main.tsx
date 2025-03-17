
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply initial theme class based on localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('darkMode');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Default to system preference if no saved preference
  const isDarkMode = savedTheme !== null ? JSON.parse(savedTheme) : systemPrefersDark;
  
  // Apply the appropriate class to the document
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
};

// Initialize theme before rendering
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
