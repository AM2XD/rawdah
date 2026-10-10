import React, { useState } from 'react';
import { X, Check, Lock, ShieldAlert, Calendar, FileText, User, CreditCard } from 'lucide-react';
import { PlotRecord, AdminUser } from '../types';
import { IslamicStarMotif } from './IslamicMotif';

interface AddPlotModalProps {
  plot: PlotRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plotNumber: number, data: { fullName: string; cnp: string; passportId?: string; adeverinta?: string; burialDate?: string; notes?: string }) => Promise<void>;
  adminUser: AdminUser | null;
  onOpenAdminLogin: () => void;
}

export const AddPlotModal: React.FC<AddPlotModalProps> = ({
  plot,
  isOpen,
  onClose,
  onSave,
  adminUser,
  onOpenAdminLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [cnp, setCnp] = useState('');
  const [adeverinta, setAdeverinta] = useState('');
  const [burialDate, setBurialDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !plot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminUser) {
      setErrorMessage('Admin authentication required to record a burial.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter the full legal name of the deceased.');
      return;
    }

    if (!cnp.trim()) {
      setErrorMessage('Please enter the CNP (Cod Numeric Personal).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(plot.plotNumber, {
        fullName: fullName.trim(),
        cnp: cnp.trim().toUpperCase(),
        passportId: cnp.trim().toUpperCase(), // backward compatibility
        adeverinta: adeverinta.trim() || undefined,
        burialDate: burialDate || new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      });
      // Reset form
      setFullName('');
      setCnp('');
      setAdeverinta('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save burial record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md mx-auto my-auto bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/35 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >

        {/* Modal Header */}
        <div className="bg-[#0F3D2E] text-[#FDFBF7] px-5 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#164E3A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <IslamicStarMotif className="w-5 h-5" color="#D4AF37" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#FDFBF7]">
                Record Burial in Plot #{plot.plotNumber}
              </h3>
              <p className="text-[11px] text-[#D4AF37]/80">
                First-time allocation entry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 text-[#FDFBF7]/80 hover:text-white flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Admin Guard Notice */}
          {!adminUser && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Admin Credentials Required</p>
                <p className="text-amber-800 mt-0.5">
                  Public visitors have read-only access. Sign in as an administrator to assign plots.
                </p>
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="mt-2 px-3 py-1.5 bg-[#0F3D2E] text-[#FDFBF7] font-medium rounded-lg text-xs hover:bg-[#164E3A] transition-colors flex items-center gap-1.5 min-h-[36px]"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Authenticate Admin</span>
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1.5">
                Full Legal Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Tariq bin Ibrahim Al-Qasim"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D4AF37]/40 rounded-xl text-sm text-[#0F3D2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* CNP Field */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1.5">
                CNP <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={cnp}
                  onChange={(e) => setCnp(e.target.value)}
                  placeholder="e.g., 1920412123456"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D4AF37]/40 rounded-xl text-sm font-mono text-[#0F3D2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* ADEVERENȚA Field */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1.5">
                ADEVERENȚA (Număr)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={adeverinta}
                  onChange={(e) => setAdeverinta(e.target.value)}
                  placeholder="e.g., 48201"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D4AF37]/40 rounded-xl text-sm font-mono text-[#0F3D2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Burial Date */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1.5">
                Burial Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={burialDate}
                  onChange={(e) => setBurialDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D4AF37]/40 rounded-xl text-sm text-[#0F3D2E] focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1.5">
                Administrative Notes / Grave Headstone Info (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Next of kin details, headstone inscription or section markers..."
                className="w-full px-3 py-2 bg-white border border-[#D4AF37]/40 rounded-xl text-xs text-[#0F3D2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent transition-shadow"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !adminUser}
                className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all ${
                  isSubmitting || !adminUser
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#0F3D2E] hover:bg-[#164E3A] text-[#FDFBF7]'
                }`}
              >
                <Check className="w-4 h-4 text-[#D4AF37]" />
                <span>{isSubmitting ? 'Saving...' : 'Save & Mark Occupied'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
