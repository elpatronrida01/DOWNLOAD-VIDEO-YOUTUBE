import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Trash2, 
  Folder, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  LogOut,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { GoogleDriveIcon } from './GoogleDriveIcon.tsx';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken,
  initAuth 
} from '../services/googleAuth.ts';
import { 
  listClipVoryDriveFiles, 
  deleteDriveFile, 
  type DriveFileItem 
} from '../services/googleDrive.ts';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserChange: (user: User | null) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Explicit confirmation dialog state for destructive file deletion
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    fileId: string;
    fileName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load files when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && user) {
      loadFiles();
    }
  }, [isOpen, user]);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in to access Google Drive.');
      }
      const driveFiles = await listClipVoryDriveFiles(token);
      setFiles(driveFiles);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load files from Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onUserChange(res.user);
        const driveFiles = await listClipVoryDriveFiles(res.accessToken);
        setFiles(driveFiles);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Drive authentication was cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    onUserChange(null);
    setFiles([]);
  };

  // Explicit destructive deletion handler with user confirmation
  const executeDelete = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated.');
      await deleteDriveFile(token, deleteConfirmation.fileId);
      
      // Update local file list
      setFiles((prev) => prev.filter((f) => f.id !== deleteConfirmation.fileId));
      setDeleteConfirmation(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700 flex items-center justify-center">
              <GoogleDriveIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Google Drive Storage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save & manage downloaded videos directly in your Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Error notice */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {!user ? (
            /* Unauthenticated View: Sign in with Google */
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/40">
                <Cloud className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold mb-2">Connect Your Google Drive</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
                Export downloaded 1080p videos, MP3 audio, and playlist ZIPs directly to your Google Drive in one click, without taking up local device storage.
              </p>

              {/* Official Sign In with Google Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-sm hover:border-indigo-500 dark:hover:border-indigo-500 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Auto-organizes in 'ClipVory Downloads'
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Tokens kept in memory only
                </span>
              </div>
            </div>
          ) : (
            /* Authenticated View: User Profile & Drive Files List */
            <div>
              {/* Account summary bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                      {user.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold truncate">{user.displayName || 'Google Account'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={loadFiles}
                    disabled={isLoadingFiles}
                    title="Refresh files"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer border border-red-200/60 dark:border-red-900/40"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Files header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-indigo-500" />
                  Saved Media in Google Drive ({files.length})
                </h4>
              </div>

              {isLoadingFiles ? (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-xs font-medium">Loading your Google Drive media...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <Folder className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No videos saved to Drive yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                    When you extract any video, click "Save to Google Drive" to store it directly in your cloud account.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate text-slate-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {file.createdTime ? new Date(file.createdTime).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmation({ fileId: file.id, fileName: file.name })}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mandatory User Confirmation Dialog for Destructive Delete */}
        {deleteConfirmation && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl text-slate-900 dark:text-white">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-base mb-1">Delete file from Google Drive?</h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deleteConfirmation.fileName}"</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={executeDelete}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Delete File</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
