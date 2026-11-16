import React from 'react';
import { 
  Download, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  RefreshCw, 
  HardDrive,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import type { MediaFormat } from '../shared/types.ts';
import { formatBytes } from '../utils/formatters.ts';

export interface DownloadErrorDetails {
  requestId?: string;
  message: string;
  stage?: string;
  status?: number;
}

interface DownloadProgressModalProps {
  format: MediaFormat | null;
  videoTitle: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  errorDetails?: DownloadErrorDetails | null;
  bytesReceived?: number;
  totalBytes?: number;
  onRetry?: () => void;
  onClose: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  format,
  videoTitle,
  progress,
  status,
  errorDetails,
  bytesReceived = 0,
  totalBytes = 0,
  onRetry,
  onClose,
}) => {
  if (!format) return null;

  const isCompleted = status === 'completed';
  const isError = status === 'error';
  const isDownloading = status === 'downloading';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-white transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Status Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isCompleted 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
              : isError
              ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : isError ? (
              <AlertCircle className="w-6 h-6 text-red-500" />
            ) : (
              <Download className="w-6 h-6 animate-bounce" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base sm:text-lg truncate">
              {isCompleted 
                ? 'Download Complete' 
                : isError 
                ? 'Download Interrupted' 
                : 'Downloading Media File...'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {format.label} · {format.ext.toUpperCase()}
            </p>
          </div>
        </div>

        {/* File Target Name */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 mb-4 flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">
            {videoTitle}.{format.ext}
          </p>
        </div>

        {/* Active Progress Bar or Error Card */}
        {isDownloading && (
          <div className="mb-5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-200 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                {bytesReceived > 0 
                  ? `${formatBytes(bytesReceived)} ${totalBytes > 0 ? `of ${formatBytes(totalBytes)}` : 'downloaded'}`
                  : 'Establishing media stream...'}
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {progress > 0 ? `${progress}%` : 'Buffering'}
              </span>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs">
            <p className="font-semibold mb-0.5">Saved to your device!</p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              The file was safely assembled and dispatched to your browser downloads folder.
            </p>
          </div>
        )}

        {isError && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Diagnostic Details</span>
            </div>
            <p className="mb-2 leading-relaxed">
              {errorDetails?.message || 'Server was unable to complete the media transfer.'}
            </p>
            {errorDetails?.requestId && (
              <p className="font-mono text-[10px] text-red-600/70 dark:text-red-400/70">
                Request ID: {errorDetails.requestId}
                {errorDetails.stage ? ` · Stage: ${errorDetails.stage}` : ''}
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          {isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Download</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              isCompleted
                ? 'text-white bg-indigo-600 hover:bg-indigo-500 shadow-md'
                : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isCompleted ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
