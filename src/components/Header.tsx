import React from 'react';
import { Search, Lock, LogOut, ShieldCheck, X, CloudUpload } from 'lucide-react';
import { IslamicStarMotif } from './IslamicMotif';
import { AdminUser, PlotRecord } from '../types';

interface HeaderProps {
  plots: PlotRecord[];
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  onOpenAdminModal: () => void;
  adminUser: AdminUser | null;
  onAdminSignOut: () => void;
  onPublishToDatabase?: () => void;
  isPublishing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  plots,
  isSearchOpen,
  onToggleSearch,
  onOpenAdminModal,
  adminUser,
  onAdminSignOut,
  onPublishToDatabase,
  isPublishing = false,
}) => {
  const total = plots.length;
  const occupiedCount = plots.filter((p) => p.status === 'occupied').length;
  const vacantCount = total - occupiedCount;

  return (
    <header className="sticky top-0 z-30 bg-[#0F3D2E] text-[#FDFBF7] shadow-md border-b border-[#D4AF37]/30">
      {/* Decorative Gold Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark (Scalable, no hardcoded capacity in subtitle) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#164E3A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner shrink-0">
            <IslamicStarMotif className="w-5 h-5 sm:w-6 sm:h-6" color="#D4AF37" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-[#FDFBF7] truncate">
                Rawdah
              </span>
              <span className="text-[11px] font-serif text-[#D4AF37] font-semibold px-1 py-0.2 border border-[#D4AF37]/30 rounded bg-[#D4AF37]/10 shrink-0">
                روضة
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#D4AF37]/80 font-medium tracking-wide truncate">
              Plot Registry
            </p>
          </div>
        </div>

        {/* Zone 2: Plot Stats (Desktop only, unboxed) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#FDFBF7]/90 font-medium">
          <span className="tabular-nums font-semibold text-[#FDFBF7]">{total} Total</span>
          <span className="text-[#D4AF37]/60" aria-hidden="true">·</span>
          <span className="tabular-nums font-medium text-emerald-300">{vacantCount} Vacant</span>
          <span className="text-[#D4AF37]/60" aria-hidden="true">·</span>
          <span className="tabular-nums font-medium text-amber-200">{occupiedCount} Occupied</span>
        </div>

        {/* Zone 3: Actions (Mobile-Optimized Touch Hitboxes) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Collapsible Search Trigger Button */}
          <button
            type="button"
            onClick={onToggleSearch}
            aria-label={isSearchOpen ? "Close search bar" : "Open search bar"}
            title="Search plots (by number, name, passport)"
            className={`min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${
              isSearchOpen
                ? 'bg-[#D4AF37] text-[#0F3D2E] shadow'
                : 'bg-[#164E3A]/90 hover:bg-[#164E3A] text-[#FDFBF7] border border-[#D4AF37]/30'
            }`}
          >
            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            <span className="hidden md:inline">Search</span>
          </button>

          {/* Admin Sign-In & Publish Controls (Phone-Tolerant, zero horizontal overflow) */}
          {adminUser ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Publish to Database Button (Strictly for verified Firebase staff admins, hidden for demo) */}
              {!adminUser.isDemoAdmin && onPublishToDatabase && (
                <button
                  type="button"
                  onClick={onPublishToDatabase}
                  disabled={isPublishing}
                  title="Publish all 200 cemetery plots and records to the database"
                  aria-label="Publish to Database"
                  className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-gradient-to-b from-[#D4AF37] to-[#B8972E] hover:brightness-105 active:scale-95 text-[#0F3D2E] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {isPublishing ? "Publishing..." : "Publish to Database"}
                  </span>
                  <span className="sm:hidden text-[11px]">
                    {isPublishing ? "..." : "Publish"}
                  </span>
                </button>
              )}

              {/* Admin Profile Chip (Clickable to open Admin details) */}
              <button
                type="button"
                onClick={onOpenAdminModal}
                title={adminUser.isDemoAdmin ? "Local Sandbox Demo Mode (Click for details)" : `Signed in as ${adminUser.email}. Click for admin settings.`}
                className={`hidden md:flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-lg max-w-[140px] truncate transition-colors ${
                  adminUser.isDemoAdmin
                    ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-400/40 text-amber-200'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/40 text-emerald-200'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${adminUser.isDemoAdmin ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span className="truncate">{adminUser.isDemoAdmin ? 'Demo (Sandbox)' : adminUser.email}</span>
              </button>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={onAdminSignOut}
                aria-label="Sign out from Admin"
                title={`Signed in as ${adminUser.email}. Click to sign out.`}
                className="min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 rounded-xl bg-[#164E3A] hover:bg-red-950 text-red-200 border border-red-500/40 flex items-center justify-center gap-1 text-xs transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminModal}
              aria-label="Admin Sign In"
              className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 rounded-xl bg-gradient-to-b from-[#D4AF37] to-[#B8972E] hover:brightness-105 active:scale-95 text-[#0F3D2E] font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
