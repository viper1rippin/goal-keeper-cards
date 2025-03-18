
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if there's a stored preference in localStorage
    const savedPreference = localStorage.getItem('darkMode');
    // Return the stored preference, or true as default (dark mode on)
    return savedPreference !== null ? JSON.parse(savedPreference) : true;
  });

  useEffect(() => {
    // Save preference to localStorage whenever it changes
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply the appropriate class to the body
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return { darkMode, toggleDarkMode };
};
