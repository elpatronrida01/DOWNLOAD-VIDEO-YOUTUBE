import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';
import { Logo } from './Logo.tsx';
import type { ActiveModal } from './Modals.tsx';

interface FooterProps {
  onOpenModal: (modal: ActiveModal) => void;
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal, onScrollToTop }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/60">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Clip<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Vory</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modern All-in-One Video Downloader
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => onOpenModal('about')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              About ClipVory
            </button>
            <button
              onClick={() => onOpenModal('privacy')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenModal('terms')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onOpenModal('contact')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Contact & Support
            </button>
          </div>

          {/* Back to top */}
          <button
            onClick={onScrollToTop}
            aria-label="Scroll back to top"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} ClipVory. Only authorized media downloads supported.</p>
          <p className="flex items-center gap-1">
            Built with modern web standards and SSRF protections.
          </p>
        </div>
      </div>
    </footer>
  );
};
