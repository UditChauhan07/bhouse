import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
   
    return localStorage.getItem('theme') === 'dark';
  });

  
  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

 
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark'); 
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light'); 
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
