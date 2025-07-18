import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', className = '' }) => {
  const { theme, actualTheme, setTheme } = useTheme();

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          aria-label="Select theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {theme === 'light' && <Sun className="w-4 h-4 text-gray-500" />}
          {theme === 'dark' && <Moon className="w-4 h-4 text-gray-500" />}
          {theme === 'system' && <Monitor className="w-4 h-4 text-gray-500" />}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(actualTheme === 'light' ? 'dark' : 'light')}
      className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
      aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {actualTheme === 'light' ? (
        <Moon className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
      )}
    </button>
  );
};

export default ThemeToggle;