import React, { useState } from 'react';
import { X, Shield, FileText, Send, CheckCircle2, Info } from 'lucide-react';

export type ActiveModal = 'about' | 'privacy' | 'terms' | 'contact' | null;

interface ModalsProps {
  activeModal: ActiveModal;
  onClose: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!activeModal) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-800 dark:text-slate-200"
        role="dialog"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* About Modal */}
        {activeModal === 'about' && (
          <div>
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-3">
              <Info className="w-6 h-6" />
              <h3 className="text-xl font-bold">About ClipVory</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>ClipVory</strong> is a modern, high-speed media downloading engine built for creators, educators, students, and archivers. It allows users to inspect and download authorized public videos across the web with zero bloat, ad popups, or deceptive download prompts.
              </p>
              <p>
                Our philosophy is centered on <strong>transparency, speed, and privacy</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Direct & Authentic Streams:</strong> We extract verified resolutions up to 1080p 60fps and pristine stereo audio (MP3).
                </li>
                <li>
                  <strong>Safe & Secure:</strong> Built with robust server-side request forgery (SSRF) filters and zero persistent logging of user search terms.
                </li>
                <li>
                  <strong>Ethical Architecture:</strong> We never bypass DRM or tamper with private authentication systems.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {activeModal === 'privacy' && (
          <div>
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-3">
              <Shield className="w-6 h-6" />
              <h3 className="text-xl font-bold">Privacy Policy</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="text-xs text-slate-400">Effective Date: October 2026</p>
              <p>
                At ClipVory, user privacy is not an afterthought; it is fundamental to how our service is designed.
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-white">1. No URL Storage</h4>
              <p>
                We do not log, persist, or correlate the video links you paste to any user account or database. URLs are processed in transient server memory solely to fetch media headers and are immediately discarded.
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-white">2. Browser-Only Local History</h4>
              <p>
                Your recent download history is stored solely on your device in your browser's LocalStorage. You can clear it at any time with one click.
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-white">3. No Third-Party Trackers</h4>
              <p>
                We do not sell data to data brokers or embed third-party advertising trackers.
              </p>
            </div>
          </div>
        )}

        {/* Terms of Service */}
        {activeModal === 'terms' && (
          <div>
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-3">
              <FileText className="w-6 h-6" />
              <h3 className="text-xl font-bold">Terms of Service & Copyright</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                By using ClipVory, you agree to these terms:
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-white">1. Authorized Use Only</h4>
              <p>
                You represent and warrant that you only download media that you own, have explicit authorization from the copyright holder to download, or which is governed by public domain, Creative Commons, or fair-use exceptions under applicable copyright law.
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-white">2. No Circumvention</h4>
              <p>
                ClipVory does not circumvent digital rights management (DRM), copy protection, or private account credentials. Users must not attempt to use ClipVory to bypass security controls.
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-white">3. DMCA & Takedown Notices</h4>
              <p>
                ClipVory does not host or store user content. However, we promptly process all inquiries regarding intellectual property.
              </p>
            </div>
          </div>
        )}

        {/* Contact Form */}
        {activeModal === 'contact' && (
          <div>
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-3">
              <Send className="w-6 h-6" />
              <h3 className="text-xl font-bold">Contact & Support</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
              Have feedback, platform suggestions, or an inquiry? Send us a direct message.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 dark:text-white">Message Received!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Thank you for reaching out. Our engineering team reviews all incoming feedback.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message / Bug Report
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your suggestion or issue..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
