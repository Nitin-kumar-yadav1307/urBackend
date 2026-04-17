import React, { useState, useEffect } from 'react';

// Synchronously read initial theme to prevent React-level FOUC
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('urbackend-theme');
    if (saved === 'light') return false;   // false = light mode
    if (saved === 'dark') return true;     // true = dark mode
  } catch {
    // localStorage not available – fallback to system preference
  }
  // Fallback to system preference
  return window.matchMedia('(prefers-color-scheme: light)').matches ? false : true;
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // Apply class whenever isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDark]);

  // Listen to system preference changes (optional)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      try {
        if (!localStorage.getItem('urbackend-theme')) {
          setIsDark(!e.matches);
        }
      } catch {
        // ignore
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      localStorage.setItem('urbackend-theme', newIsDark ? 'dark' : 'light');
    } catch {
      console.warn('Failed to save theme preference');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={!isDark}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeToggle;