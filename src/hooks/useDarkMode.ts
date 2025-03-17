
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if there's a stored preference in localStorage
    const savedPreference = localStorage.getItem('darkMode');
    
    // If there's no saved preference, check system preference
    if (savedPreference === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Return the stored preference
    return JSON.parse(savedPreference);
  });

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    
    // Save preference to localStorage whenever it changes
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return { darkMode, toggleDarkMode };
};
