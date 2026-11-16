import React from 'react';
import { Download, ShieldCheck, History, Radio } from 'lucide-react';
import type { User } from 'firebase/auth';
import { Logo } from './Logo.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { GoogleDriveIcon } from './GoogleDriveIcon.tsx';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  historyCount: number;
  onOpenDrive: () => void;
  driveUser: User | null;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  historyCount,
  onOpenDrive,
  driveUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <Logo size="md" />
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              Clip<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Vory</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Universal Downloader</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v2.5
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('platforms')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 text-slate-400" />
            Platforms
          </button>
          <button
            onClick={() => onNavigate('features')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            Security & Features
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-slate-400" />
            Recent History
            {historyCount > 0 && (
              <span className="text-xs bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                {historyCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('faq')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Google Drive Connection Button */}
          <button
            type="button"
            onClick={onOpenDrive}
            title={driveUser ? `Google Drive Connected (${driveUser.email})` : 'Connect Google Drive'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              driveUser
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            <GoogleDriveIcon size={16} />
            <span className="hidden sm:inline">
              {driveUser ? 'Drive Connected' : 'Google Drive'}
            </span>
          </button>

          <ThemeToggle />

          <button
            onClick={() => onNavigate('hero')}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Paste & Download
          </button>
        </div>
      </div>
    </header>
  );
};
