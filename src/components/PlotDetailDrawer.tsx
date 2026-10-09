import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  ShieldAlert,
  Check,
  Calendar,
  CreditCard,
  User,
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { PlotRecord, AdminUser } from '../types';
import { IslamicStarMotif } from './IslamicMotif';

interface PlotDetailDrawerProps {
  plot: PlotRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (plotNumber: number, data: Partial<PlotRecord>) => Promise<void>;
  onVacate: (plotNumber: number) => Promise<void>;
  adminUser: AdminUser | null;
  onOpenAdminLogin: () => void;
}

export const PlotDetailDrawer: React.FC<PlotDetailDrawerProps> = ({
  plot,
  isOpen,
  onClose,
  onUpdate,
  onVacate,
  adminUser,
  onOpenAdminLogin,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [passportId, setPassportId] = useState('');
  const [burialDate, setBurialDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showVacateConfirm, setShowVacateConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Sync state when plot changes
  useEffect(() => {
    if (plot) {
      setFullName(plot.fullName || '');
      setPassportId(plot.passportId || '');
      setBurialDate(plot.burialDate || '');
      setNotes(plot.notes || '');
      setIsEditMode(false);
      setShowVacateConfirm(false);
      setErrorMessage('');
      setSuccessToast('');
    }
  }, [plot]);

  if (!isOpen || !plot) return null;

  const handleToggleEditMode = () => {
    if (!adminUser) {
      onOpenAdminLogin();
      return;
    }
    setIsEditMode(!isEditMode);
    setShowVacateConfirm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminUser) {
      setErrorMessage('Admin privileges required to save changes.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    if (!passportId.trim()) {
      setErrorMessage('Passport / ID Number is required.');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(plot.plotNumber, {
        fullName: fullName.trim(),
        passportId: passportId.trim().toUpperCase(),
        burialDate: burialDate || undefined,
        notes: notes.trim() || undefined,
      });
      setIsEditMode(false);
      setSuccessToast('Plot record updated successfully.');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVacateConfirm = async () => {
    try {
      setIsSaving(true);
      await onVacate(plot.plotNumber);
      setShowVacateConfirm(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to vacate plot.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#D4AF37]/35 overflow-hidden transform transition-all animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto my-2.5" />

        {/* Header */}
        <div className="bg-[#0F3D2E] text-[#FDFBF7] px-5 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#164E3A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <IslamicStarMotif className="w-5 h-5" color="#D4AF37" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-[#FDFBF7]">
                  Plot #{plot.plotNumber} Registry
                </h3>
                <span className="text-[11px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#164E3A] border border-[#D4AF37]/30">
                  Occupied
                </span>
              </div>
              <p className="text-[11px] text-[#D4AF37]/80">
                Official burial record
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 text-[#FDFBF7]/80 hover:text-white flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protection & Edit Mode Control Strip */}
        <div className="bg-[#FAF7EE] px-5 py-3 border-b border-[#D4AF37]/25 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {isEditMode ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
                <Unlock className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit Mode Enabled</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#0F3D2E]/80 bg-white px-2.5 py-1 rounded-md border border-[#D4AF37]/30">
                <Lock className="w-3.5 h-3.5 text-[#0F3D2E]" />
                <span>Protected Read-Only</span>
              </span>
            )}
          </div>

          {/* Toggle Switch Protection */}
          {adminUser ? (
            <button
              type="button"
              onClick={handleToggleEditMode}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isEditMode
                  ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  : 'bg-[#0F3D2E] text-[#FDFBF7] hover:bg-[#164E3A]'
              }`}
            >
              {isEditMode ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-[#D4AF37]" />}
              <span>{isEditMode ? 'Lock Details' : 'Enable Edit Mode'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#0F3D2E] hover:bg-[#D4AF37]/25 flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#0F3D2E]" />
              <span>Admin Login to Edit</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {successToast && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {isEditMode && (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Modifying Permanent Cemetery Record</p>
                <p className="mt-0.5 text-amber-800">
                  Ensure corrections match the official death certificate and passport before saving.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Plot Number info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#D4AF37]/25">
              <div>
                <span className="text-[11px] text-[#0F3D2E]/60 uppercase font-bold tracking-wider">
                  Cemetery Plot Number
                </span>
                <p className="text-sm font-serif font-bold text-[#0F3D2E]">
                  Plot #{plot.plotNumber} of 200
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span>Last updated:</span>
                <p className="font-mono text-slate-700">
                  {plot.updatedAt ? new Date(plot.updatedAt).toLocaleDateString() : 'Initial seed'}
                </p>
              </div>
            </div>

            {/* Deceased Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1">
                Deceased Full Name
              </label>
              {isEditMode ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D4AF37]/50 rounded-xl text-sm font-semibold text-[#0F3D2E] focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#0F3D2E]">
                  {plot.fullName || "—"}
                </div>
              )}
            </div>

            {/* Passport / ID Number */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1">
                Passport / National ID Number
              </label>
              {isEditMode ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={passportId}
                    onChange={(e) => setPassportId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D4AF37]/50 rounded-xl text-sm font-mono text-[#0F3D2E] focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-sm text-[#0F3D2E] flex items-center justify-between">
                  <span>{plot.passportId || "—"}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Verified ID</span>
                </div>
              )}
            </div>

            {/* Burial Date */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1">
                Burial Date
              </label>
              {isEditMode ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={burialDate}
                    onChange={(e) => setBurialDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D4AF37]/50 rounded-xl text-sm text-[#0F3D2E] focus:ring-2 focus:ring-[#0F3D2E]"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                  {plot.burialDate ? new Date(plot.burialDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Date not specified'}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1">
                Cemetery Records / Notes
              </label>
              {isEditMode ? (
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D4AF37]/50 rounded-xl text-xs text-[#0F3D2E] focus:ring-2 focus:ring-[#0F3D2E]"
                />
              ) : (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 italic">
                  {plot.notes || "No special administrative notes."}
                </div>
              )}
            </div>

            {/* Action buttons when in edit mode */}
            {isEditMode && (
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100">
                {/* Secondary Vacate action */}
                <button
                  type="button"
                  onClick={() => setShowVacateConfirm(true)}
                  className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-red-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Vacate This Plot</span>
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-[#0F3D2E] hover:bg-[#164E3A] text-[#FDFBF7] flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Confirm Vacate Dialog */}
          {showVacateConfirm && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-900 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Confirm Vacating Plot #{plot.plotNumber}?</span>
              </div>
              <p className="text-xs text-red-800">
                This will clear the deceased record and mark Plot #{plot.plotNumber} as <strong>Vacant</strong> in the registry.
              </p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowVacateConfirm(false)}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300"
                >
                  Keep Record
                </button>
                <button
                  type="button"
                  onClick={handleVacateConfirm}
                  disabled={isSaving}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow"
                >
                  {isSaving ? 'Clearing...' : 'Yes, Vacate Plot'}
                </button>
              </div>
            </div>
          )}

          {!isEditMode && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
