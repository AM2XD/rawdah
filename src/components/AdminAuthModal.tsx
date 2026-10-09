import React, { useState } from 'react';
import { X, Lock, Mail, Key, ShieldCheck, AlertCircle, Sparkles, CloudUpload, Check } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { AdminUser } from '../types';
import { initializeFirebaseServices } from '../firebase/config';
import { seedAll200PlotsToFirestore } from '../services/plotService';
import { IslamicStarMotif } from './IslamicMotif';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated: (user: AdminUser) => void;
  adminUser: AdminUser | null;
  onAdminSignOut: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated,
  adminUser,
  onAdminSignOut,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const { isConfigured, auth } = initializeFirebaseServices();

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!isConfigured || !auth) {
      setErrorMessage(
        'Authentication service is initializing. You can use "Quick Demo Admin" below for immediate administrator access.'
      );
      return;
    }

    try {
      setIsLoading(true);
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        onAdminAuthenticated({
          email: cred.user.email || email,
          uid: cred.user.uid,
          isDemoAdmin: false,
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        onAdminAuthenticated({
          email: cred.user.email || email,
          uid: cred.user.uid,
          isDemoAdmin: false,
        });
      }
      onClose();
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'User not found. You can switch to "Create Admin Account" or use Quick Demo Admin.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToDatabase = async () => {
    if (adminUser?.isDemoAdmin) {
      setSyncStatus('Notice: Demo Admin is local-only. Live database publishing requires a verified Firebase staff account.');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus('Publishing plots to database...');
      const res = await seedAll200PlotsToFirestore(adminUser);
      setSyncStatus(`Success: ${res.message}`);
    } catch (err: any) {
      setSyncStatus(`Notice: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    onAdminAuthenticated({
      email: 'admin@rawdah-cemetery.org',
      uid: 'demo-admin-local-uid',
      isDemoAdmin: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/35 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0F3D2E] text-[#FDFBF7] px-5 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#164E3A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <IslamicStarMotif className="w-5 h-5" color="#D4AF37" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#FDFBF7]">
                Administrator Authentication
              </h3>
              <p className="text-[11px] text-[#D4AF37]/80">
                Authorized cemetery staff access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 text-[#FDFBF7]/80 hover:text-white flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {adminUser ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F3D2E]">Currently Signed In</h4>
                <p className="text-xs text-slate-600 mt-0.5">{adminUser.email}</p>
                {adminUser.isDemoAdmin ? (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                    Local Sandbox Mode (No Cloud Writes)
                  </span>
                ) : (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                    Verified Firebase Staff Account
                  </span>
                )}
              </div>

              {/* Database Publish Action: Only for Authenticated Firebase Staff, NOT Demo Admin */}
              {adminUser.isDemoAdmin ? (
                <div className="pt-3 border-t border-slate-100 text-left space-y-2">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      Sandbox Mode Protection
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      This demo account is isolated in your local browser. It cannot write or publish changes to your live Firestore database. To synchronize data with the cloud database, sign in with your verified staff credentials below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F3D2E]">Publish to Database:</span>
                    <span className="text-[10px] text-slate-500 font-mono">200 Plots</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Publish all 200 cemetery plots and records to the central cloud database.
                  </p>
                  <button
                    type="button"
                    onClick={handlePublishToDatabase}
                    disabled={isSyncing}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-gradient-to-b from-[#0F3D2E] to-[#164E3A] hover:brightness-110 text-[#FDFBF7] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow"
                  >
                    <CloudUpload className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isSyncing ? "Publishing to Database..." : "Publish All 200 Plots to Database"}</span>
                  </button>
                  {syncStatus && (
                    <p className="text-[11px] font-medium text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {syncStatus}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onAdminSignOut}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F3D2E] text-[#FDFBF7] hover:bg-[#164E3A] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form for Firebase Auth */}
              <form onSubmit={handleFirebaseLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1">
                    Cemetery Staff Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@rawdah-cemetery.org"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#D4AF37]/40 rounded-xl text-xs text-[#0F3D2E] focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#D4AF37]/40 rounded-xl text-xs text-[#0F3D2E] focus:ring-2 focus:ring-[#0F3D2E]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[#0F3D2E] font-medium hover:underline min-h-[36px]"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Need an admin account? Register"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[44px] rounded-xl bg-[#0F3D2E] hover:bg-[#164E3A] text-[#FDFBF7] text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {isLoading
                      ? "Verifying..."
                      : isSignUp
                      ? "Create Admin Account"
                      : "Sign In via Firebase Auth"}
                  </span>
                </button>
              </form>

              {/* Local Sandbox Preview for UI inspection without cloud database access */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 mb-2">
                  Want to inspect the UI without writing to the cloud database?
                </p>
                <button
                  type="button"
                  onClick={handleQuickDemoAdmin}
                  className="w-full min-h-[44px] rounded-xl bg-[#FAF7EE] hover:bg-[#F2EFE6] border border-[#D4AF37]/50 text-[#0F3D2E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Local Sandbox Preview (Offline / No DB Writes)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
