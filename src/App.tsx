/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PlotRecord, AdminUser, OccupancyFilter } from './types';
import { subscribeToProps, updatePlotRecord, vacatePlotRecord, seedAll200PlotsToFirestore } from './services/plotService';
import { initializeFirebaseServices } from './firebase/config';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { PlotGrid } from './components/PlotGrid';
import { AddPlotModal } from './components/AddPlotModal';
import { PlotDetailDrawer } from './components/PlotDetailDrawer';
import { AdminAuthModal } from './components/AdminAuthModal';
import { IslamicStarMotif, IslamicBorderBand } from './components/IslamicMotif';
import { CheckCircle2, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

export default function App() {
  const [plots, setPlots] = useState<PlotRecord[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Search & Filter State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<OccupancyFilter>('all');
  const [jumpToPlotNumber, setJumpToPlotNumber] = useState<number | null>(null);

  // Modal States
  const [activeVacantPlot, setActiveVacantPlot] = useState<PlotRecord | null>(null);
  const [activeOccupiedPlot, setActiveOccupiedPlot] = useState<PlotRecord | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  }, []);

  const handlePublishToDatabase = async () => {
    if (adminUser?.isDemoAdmin) {
      showToast('Demo Admin is local-only. Live database publishing requires a verified Firebase account.');
      return;
    }
    try {
      setIsPublishing(true);
      showToast('Publishing all 200 plots to the database...');
      const result = await seedAll200PlotsToFirestore(adminUser);
      showToast(result.message);
    } catch (err: any) {
      showToast(err.message || 'Publish failed. Check security rules in console.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Subscribe to plots from live database or localStorage fallback
  useEffect(() => {
    const unsubscribe = subscribeToProps(
      (loadedPlots, isLive) => {
        setPlots(loadedPlots);
        setIsFirebaseConnected(isLive);
      },
      (err) => {
        console.warn("Plot service notification:", err.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle saving a new burial in a vacant plot
  const handleSaveNewBurial = async (
    plotNumber: number,
    data: { fullName: string; passportId: string; burialDate?: string; notes?: string }
  ) => {
    const updated = await updatePlotRecord(
      plotNumber,
      {
        status: 'occupied',
        fullName: data.fullName,
        passportId: data.passportId,
        burialDate: data.burialDate,
        notes: data.notes,
      },
      adminUser
    );

    // Update local state copy
    setPlots((prev) =>
      prev.map((p) => (p.plotNumber === plotNumber ? updated : p))
    );

    showToast(`Plot #${plotNumber} allocated to ${data.fullName}`);
  };

  // Handle editing an occupied plot
  const handleUpdateOccupiedPlot = async (
    plotNumber: number,
    updates: Partial<PlotRecord>
  ) => {
    const updated = await updatePlotRecord(plotNumber, updates, adminUser);

    setPlots((prev) =>
      prev.map((p) => (p.plotNumber === plotNumber ? updated : p))
    );

    // Update the drawer's active plot reference
    setActiveOccupiedPlot(updated);
    showToast(`Plot #${plotNumber} record successfully updated`);
  };

  // Handle vacating an occupied plot
  const handleVacatePlot = async (plotNumber: number) => {
    const updated = await vacatePlotRecord(plotNumber, adminUser);

    setPlots((prev) =>
      prev.map((p) => (p.plotNumber === plotNumber ? updated : p))
    );

    setActiveOccupiedPlot(null);
    showToast(`Plot #${plotNumber} marked as Vacant`);
  };

  // Quick stats
  const totalCount = plots.length;
  const occupiedCount = plots.filter((p) => p.status === 'occupied').length;
  const vacantCount = totalCount - occupiedCount;

  // Filtered match count for the search bar
  const matchCount = plots.filter((plot) => {
    if (filter === 'vacant' && plot.status !== 'vacant') return false;
    if (filter === 'occupied' && plot.status !== 'occupied') return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const numMatch = plot.plotNumber.toString().includes(q);
    const nameMatch = plot.fullName?.toLowerCase().includes(q) ?? false;
    const passportMatch = plot.passportId?.toLowerCase().includes(q) ?? false;
    return numMatch || nameMatch || passportMatch;
  }).length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2922] flex flex-col font-sans">
      
      {/* 1. Header Navigation */}
      <Header
        plots={plots}
        isSearchOpen={isSearchOpen}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        adminUser={adminUser}
        onAdminSignOut={() => {
          setAdminUser(null);
          showToast('Signed out from Administrator mode');
        }}
        onPublishToDatabase={handlePublishToDatabase}
        isPublishing={isPublishing}
      />

      {/* 2. Collapsible Search Bar (Hidden until toggled) */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        totalCount={totalCount}
        vacantCount={vacantCount}
        occupiedCount={occupiedCount}
        matchCount={matchCount}
        onJumpToPlot={(num) => setJumpToPlotNumber(num)}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Solemn Islamic Hero & Cemetery Overview Banner */}
        <section className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F3D2E] via-[#164E3A] to-[#0A291E] text-[#FDFBF7] p-5 sm:p-7 shadow-lg border border-[#D4AF37]/35 overflow-hidden text-center">
          {/* Subtle Islamic Geometries Watermark */}
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 pointer-events-none opacity-10">
            <IslamicStarMotif className="w-72 h-72" color="#D4AF37" />
          </div>
          <div className="absolute left-0 bottom-0 -translate-x-1/4 translate-y-1/4 pointer-events-none opacity-5">
            <IslamicStarMotif className="w-56 h-56" color="#D4AF37" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-2.5">
            {/* Arabic Basmala Calligraphy Line Centered in Green Div */}
            <p className="font-serif text-lg sm:text-2xl text-[#D4AF37] font-bold tracking-wide">
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FDFBF7]">
              Rawdah Muslim Graveyard
            </h1>

            <p className="text-xs sm:text-sm text-[#D4AF37]/90 font-medium">
              Graveyard Plot Registry
            </p>

            {/* Dynamic Plot Metrics Showcase */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-[#FDFBF7]/90">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>
                  Total Plots: <strong className="font-semibold text-white tabular-nums">{totalCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Available: <strong className="font-semibold text-white tabular-nums">{vacantCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-300" />
                <span>
                  Occupied: <strong className="font-semibold text-white tabular-nums">{occupiedCount}</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Cemetery Plot Grid (RTL Container, 5 max desktop, 1-3 mobile, infinite scroll) */}
        <PlotGrid
          plots={plots}
          searchQuery={searchQuery}
          filter={filter}
          onSelectPlot={(plot) => setActiveOccupiedPlot(plot)}
          onAddDetails={(plot) => setActiveVacantPlot(plot)}
          jumpToPlotNumber={jumpToPlotNumber}
          onJumpComplete={() => setJumpToPlotNumber(null)}
        />

      </main>

      {/* 5. Footer */}
      <footer className="mt-12 border-t border-[#D4AF37]/30 bg-[#0F3D2E] text-[#FDFBF7] py-6 px-4 text-center text-xs">
        <IslamicBorderBand className="mb-4" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[#FDFBF7]/75">
          <div className="flex items-center gap-2">
            <IslamicStarMotif className="w-4 h-4" color="#D4AF37" />
            <span className="font-serif font-bold text-[#FDFBF7]">
              Rawdah Graveyard Registry
            </span>
          </div>
          <p className="text-[11px]">
            &ldquo;Indeed we belong to Allah, and indeed to Him we will return.&rdquo; (إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ)
          </p>
          <div className="text-[11px] text-[#D4AF37]/90 font-serif">
            روضة الشريفة
          </div>
        </div>
      </footer>

      {/* 6. Modals & Drawers */}
      
      {/* Vacant Plot Entry Modal */}
      <AddPlotModal
        plot={activeVacantPlot}
        isOpen={Boolean(activeVacantPlot)}
        onClose={() => setActiveVacantPlot(null)}
        onSave={handleSaveNewBurial}
        adminUser={adminUser}
        onOpenAdminLogin={() => {
          setActiveVacantPlot(null);
          setIsAdminModalOpen(true);
        }}
      />

      {/* Occupied Plot Detail & Edit Drawer */}
      <PlotDetailDrawer
        plot={activeOccupiedPlot}
        isOpen={Boolean(activeOccupiedPlot)}
        onClose={() => setActiveOccupiedPlot(null)}
        onUpdate={handleUpdateOccupiedPlot}
        onVacate={handleVacatePlot}
        adminUser={adminUser}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
      />

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAdminAuthenticated={(user) => {
          setAdminUser(user);
          showToast(`Signed in as ${user.email}`);
        }}
        adminUser={adminUser}
        onAdminSignOut={() => {
          setAdminUser(null);
          showToast('Signed out from Admin');
        }}
      />

      {/* Gentle Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F3D2E] text-[#FDFBF7] border border-[#D4AF37] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
