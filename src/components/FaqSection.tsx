import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Is it legal to download videos with ClipVory?',
      answer:
        'Yes, provided that you have the right or authorization to download the content. ClipVory is intended for personal archiving, educational fair use, public domain media, creative commons content, and downloading your own uploaded videos. ClipVory explicitly does not bypass DRM or private access controls.',
    },
    {
      question: 'Can I extract audio-only (MP3) from videos?',
      answer:
        'Yes! For every supported video, ClipVory provides an "Audio Only" option which exports clean audio in MP3 format, ideal for podcasts, lectures, royalty-free audio tracks, and speech recordings.',
    },
    {
      question: 'Why do private or age-restricted videos fail to download?',
      answer:
        'Private videos, friends-only posts, and paywalled content require user credentials and cookies that ClipVory intentionally does not ask for or store. We respect creator privacy and platform access restrictions.',
    },
    {
      question: 'How do I download videos on an iPhone or iPad (iOS)?',
      answer:
        'On iOS 13+, tap the Download button in Safari. Safari will prompt "Do you want to download this file?". Tap Download, and the file will appear in the Files app under the "Downloads" folder, where you can tap the Share button and select "Save Video" to store it in your Camera Roll.',
    },
    {
      question: 'Does ClipVory store or log the links I paste?',
      answer:
        'No. ClipVory processes metadata in transient server memory and does not log or persist your pasted URLs to any database. Your recent download history is stored solely inside your own browser using HTML5 LocalStorage.',
    },
    {
      question: 'How does SSRF security protection work?',
      answer:
        'ClipVory implements strict server-side validation against Server-Side Request Forgery. Any attempt to query internal network ranges (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16) or cloud metadata endpoints is immediately rejected before any network request is issued.',
    },
  ];

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 mb-24 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="w-7 h-7 text-indigo-500" />
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
          Everything you need to know about formats, privacy, and supported platforms.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-indigo-500' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
