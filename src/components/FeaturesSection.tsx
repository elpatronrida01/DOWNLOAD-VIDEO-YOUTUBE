import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  EyeOff, 
  Layers, 
  HardDriveDownload, 
  Smartphone 
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Server-Side SSRF Protection',
      description: 'Strict network filters reject loopback IPs, internal private networks, and cloud metadata servers to prevent exploitation.',
    },
    {
      icon: EyeOff,
      title: 'Zero-Log Privacy Architecture',
      description: 'Your pasted links and queries are processed in memory and never stored in any database. Download history stays strictly in your browser.',
    },
    {
      icon: Zap,
      title: 'High-Bitrate & Multi-Quality',
      description: 'Select between 1080p Full HD, 720p HD, 480p, 360p, or extract clean stereo MP3 audio at up to 320kbps.',
    },
    {
      icon: Layers,
      title: 'Modular Adapter System',
      description: 'Each platform has an isolated adapter with native oEmbed protocols, REST APIs, or progressive stream parsers.',
    },
    {
      icon: HardDriveDownload,
      title: 'True Stream Piping',
      description: 'Real browser file downloads with accurate Content-Disposition headers and direct progress tracking. No fake loaders.',
    },
    {
      icon: Smartphone,
      title: 'Responsive & Accessible',
      description: 'Designed from the ground up for iOS Safari, Android Chrome, and desktop browsers with full keyboard accessibility.',
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Engineered for Speed, Quality & Security
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
          Why creators, students, and researchers trust ClipVory for their media workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
