import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode (currently Dark)' : 'Switch to dark mode (currently Light)'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer border select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
        ${
          isDark
            ? 'bg-slate-800/90 text-amber-400 border-slate-700/80 hover:bg-slate-700 hover:border-slate-600 hover:text-amber-300 shadow-sm shadow-black/20'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-indigo-600 hover:border-slate-300 shadow-sm'
        } ${className}`}
    >
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>

      {/* Animated icon container */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 stroke-[2.2] animate-in fade-in zoom-in-75 duration-200" />
        ) : (
          <Moon className="w-4 h-4 stroke-[2.2] animate-in fade-in zoom-in-75 duration-200" />
        )}
      </div>
    </button>
  );
};
