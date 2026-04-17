import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('urbackend-theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light-mode');
    } else if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.remove('light-mode');
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      setIsDark(!prefersLight);
      if (prefersLight) {
        document.documentElement.classList.add('light-mode');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('urbackend-theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('urbackend-theme', 'light');
    }
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
};

export default ThemeToggle;