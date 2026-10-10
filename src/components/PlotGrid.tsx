import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlotRecord, OccupancyFilter } from '../types';
import { PlotCard } from './PlotCard';
import { IslamicStarMotif } from './IslamicMotif';
import { Compass, LayoutGrid, Layers } from 'lucide-react';

interface PlotGridProps {
  plots: PlotRecord[];
  searchQuery: string;
  filter: OccupancyFilter;
  onSelectPlot: (plot: PlotRecord) => void;
  onAddDetails: (plot: PlotRecord) => void;
  jumpToPlotNumber: number | null;
  onJumpComplete: () => void;
}

const BATCH_SIZE = 50; // In batches of 50 (10 rows of 5)

export const PlotGrid: React.FC<PlotGridProps> = ({
  plots,
  searchQuery,
  filter,
  onSelectPlot,
  onAddDetails,
  jumpToPlotNumber,
  onJumpComplete,
}) => {
  const [renderedCount, setRenderedCount] = useState<number>(BATCH_SIZE);
  const [desktopCompactMode, setDesktopCompactMode] = useState<boolean>(false);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  // Filter plots based on query and filter tab
  const filteredPlots = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return plots.filter((plot) => {
      // 1. Status Filter
      if (filter === 'vacant' && plot.status !== 'vacant') return false;
      if (filter === 'occupied' && plot.status !== 'occupied') return false;

      // 2. Search Query Filter
      if (!q) return true;

      const numMatch = plot.plotNumber.toString().includes(q);
      const nameMatch = plot.fullName?.toLowerCase().includes(q) ?? false;
      const cnpMatch = (plot.cnp || plot.passportId)?.toLowerCase().includes(q) ?? false;
      const adeverintaMatch = plot.adeverinta ? String(plot.adeverinta).toLowerCase().includes(q) : false;

      return numMatch || nameMatch || cnpMatch || adeverintaMatch;
    });
  }, [plots, searchQuery, filter]);

  // Handle jump to plot number
  useEffect(() => {
    if (jumpToPlotNumber) {
      setRenderedCount((prev) => Math.max(prev, 200));

      setTimeout(() => {
        const el = document.getElementById(`plot-card-${jumpToPlotNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        onJumpComplete();
      }, 100);
    }
  }, [jumpToPlotNumber, onJumpComplete]);

  // Reset rendered count when filter or search changes
  useEffect(() => {
    setRenderedCount(BATCH_SIZE);
  }, [searchQuery, filter]);

  // IntersectionObserver for smooth infinite scroll
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRenderedCount((prev) => Math.min(prev + BATCH_SIZE, filteredPlots.length));
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPlots.length]);

  const visiblePlots = filteredPlots.slice(0, renderedCount);
  const hasMore = renderedCount < filteredPlots.length;

  return (
    <div className="w-full">
      {/* Grid Subheader Bar */}
      <div className="flex items-center justify-between px-1 mb-3 text-xs text-[#0F3D2E]/80 font-medium">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Compass className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="text-[11px] sm:text-xs">
            RTL Layout: <strong>Plot #1</strong> at top-right · 5 plots per row
          </span>
        </div>

        {/* View Mode Toggle for desktop */}
        <div className="hidden md:flex items-center gap-1 bg-[#EFECE1] p-0.5 rounded-lg border border-[#D4AF37]/30">
          <button
            type="button"
            onClick={() => setDesktopCompactMode(false)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              !desktopCompactMode
                ? 'bg-white text-[#0F3D2E] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3 text-[#D4AF37]" />
            <span>Detailed</span>
          </button>
          <button
            type="button"
            onClick={() => setDesktopCompactMode(true)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              desktopCompactMode
                ? 'bg-white text-[#0F3D2E] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3 h-3 text-[#D4AF37]" />
            <span>Map Tiles</span>
          </button>
        </div>
      </div>

      {/* RTL Graveyard Grid: 5 columns on ALL screens including mobile! */}
      <div
        dir="rtl"
        className="grid grid-cols-5 gap-1.5 sm:gap-3 lg:gap-4.5"
      >
        {visiblePlots.map((plot) => {
          const isHighlighted =
            Boolean(searchQuery.trim()) &&
            (plot.plotNumber.toString() === searchQuery.trim() ||
              (plot.fullName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ?? false) ||
              ((plot.cnp || plot.passportId)?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ?? false) ||
              (plot.adeverinta ? String(plot.adeverinta).toLowerCase().includes(searchQuery.toLowerCase().trim()) : false));

          return (
            <div key={plot.id} dir="ltr" className="h-full">
              <PlotCard
                plot={plot}
                isHighlighted={isHighlighted}
                onSelectPlot={onSelectPlot}
                onAddDetails={onAddDetails}
                compactOnly={desktopCompactMode}
              />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPlots.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#D4AF37]/40 p-6 my-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7EE] flex items-center justify-center text-[#D4AF37] mb-2.5">
            <IslamicStarMotif className="w-7 h-7" color="#D4AF37" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#0F3D2E]">
            No matching plots found
          </h3>
          <p className="text-xs text-[#0F3D2E]/70 max-w-sm mx-auto mt-0.5">
            Try adjusting your search criteria or reset filters to display all plots.
          </p>
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={bottomSentinelRef} className="py-5 flex flex-col items-center justify-center">
        {hasMore ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-xs text-[#0F3D2E]/70 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span>Showing {renderedCount} of {filteredPlots.length} plots...</span>
            </div>
            <button
              type="button"
              onClick={() => setRenderedCount(filteredPlots.length)}
              className="text-xs text-[#0F3D2E] hover:text-[#164E3A] underline underline-offset-4 font-semibold px-3 py-1.5 min-h-[40px]"
            >
              Load all plots at once
            </button>
          </div>
        ) : filteredPlots.length > 0 ? (
          <div className="flex items-center gap-2 text-xs text-[#0F3D2E]/50 font-medium">
            <IslamicStarMotif className="w-3.5 h-3.5" color="#D4AF37" />
            <span>All {filteredPlots.length} plots displayed</span>
            <IslamicStarMotif className="w-3.5 h-3.5" color="#D4AF37" />
          </div>
        ) : null}
      </div>
    </div>
  );
};
