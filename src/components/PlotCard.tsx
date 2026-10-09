import React from 'react';
import { User, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { PlotRecord } from '../types';
import { IslamicStarMotif } from './IslamicMotif';

interface PlotCardProps {
  plot: PlotRecord;
  isHighlighted?: boolean;
  onSelectPlot: (plot: PlotRecord) => void;
  onAddDetails: (plot: PlotRecord) => void;
  compactOnly?: boolean;
}

export const PlotCard: React.FC<PlotCardProps> = ({
  plot,
  isHighlighted = false,
  onSelectPlot,
  onAddDetails,
  compactOnly = false,
}) => {
  const isOccupied = plot.status === 'occupied';

  const handleClick = () => {
    if (isOccupied) {
      onSelectPlot(plot);
    } else {
      onAddDetails(plot);
    }
  };

  return (
    <div
      id={`plot-card-${plot.plotNumber}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      title={
        isOccupied
          ? `Plot #${plot.plotNumber} - Occupied by ${plot.fullName || 'Deceased'} (Passport: ${plot.passportId || 'N/A'})`
          : `Plot #${plot.plotNumber} - Vacant (Click to record burial)`
      }
      className={`relative group rounded-xl sm:rounded-2xl transition-all duration-150 cursor-pointer overflow-hidden border flex flex-col justify-between text-left select-none active:scale-[0.97] ${
        isHighlighted
          ? 'ring-2 ring-[#D4AF37] shadow-md scale-[1.02]'
          : 'hover:shadow-sm'
      } ${
        isOccupied
          ? 'bg-white border-[#D4AF37]/45'
          : 'bg-[#FDFBF7] border-dashed border-[#D4AF37]/40 hover:border-[#0F3D2E]/60'
      }`}
    >
      {/* MOBILE COMPACT TILE VIEW (Phone 5-wide grid with icon and number) */}
      <div
        className={`${
          compactOnly ? 'flex' : 'flex md:hidden'
        } flex-col items-center justify-between p-1.5 xs:p-2 min-h-[66px] xs:min-h-[72px] w-full text-center ${
          isOccupied
            ? 'bg-[#0F3D2E] text-[#FDFBF7]'
            : 'bg-[#FAF7EE] text-[#0F3D2E] hover:bg-[#F2EFE6]'
        }`}
      >
        {/* Top: Plot Number */}
        <div className="w-full flex items-center justify-between px-0.5">
          <span
            className={`font-mono tabular-nums text-[11px] xs:text-xs font-bold leading-none ${
              isOccupied ? 'text-[#D4AF37]' : 'text-[#0F3D2E]'
            }`}
          >
            #{plot.plotNumber}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isOccupied ? 'bg-[#D4AF37]' : 'bg-emerald-500/80'
            }`}
          />
        </div>

        {/* Center: Iconic Symbol */}
        <div className="my-0.5 flex items-center justify-center">
          {isOccupied ? (
            <div className="w-5 h-5 rounded-full bg-[#164E3A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <IslamicStarMotif className="w-3.5 h-3.5" color="#D4AF37" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-emerald-100/90 text-emerald-800 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Bottom: Abbreviated Label */}
        <div className="w-full px-0.5 truncate text-[9px] xs:text-[10px] font-medium leading-tight">
          {isOccupied ? (
            <span className="text-[#FDFBF7]/90 truncate block">
              {plot.fullName?.split(' ')[0] || 'Occupied'}
            </span>
          ) : (
            <span className="text-emerald-800/80">Vacant</span>
          )}
        </div>
      </div>

      {/* TABLET / DESKTOP DETAILED VIEW (Expanded inside 5-column layout on larger screens) */}
      <div className={`${compactOnly ? 'hidden' : 'hidden md:flex'} flex-col h-full justify-between`}>
        {/* Card Header Banner */}
        <div
          className={`px-3 py-2 flex items-center justify-between border-b transition-colors ${
            isOccupied
              ? 'bg-[#0F3D2E] text-[#FDFBF7] border-[#D4AF37]/30'
              : 'bg-[#F5F2E9] text-[#0F3D2E] border-[#D4AF37]/20'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-mono tabular-nums text-xs font-bold tracking-tight px-1.5 py-0.5 rounded bg-black/15 text-[#D4AF37]">
              #{plot.plotNumber}
            </span>
            <span className="text-[10px] font-serif uppercase tracking-wider opacity-80">
              Plot
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isOccupied ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4AF37] px-1.5 py-0.5 rounded-full bg-[#164E3A] border border-[#D4AF37]/30">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>Occupied</span>
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-medium text-emerald-800 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                Vacant
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 flex-1 flex flex-col justify-between relative min-h-[96px]">
          {isOccupied ? (
            <div className="space-y-1.5 z-10">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-[#0F3D2E]/55">
                  Deceased
                </p>
                <h4 className="text-xs font-bold text-[#0F3D2E] line-clamp-2 leading-snug">
                  {plot.fullName || "Record on file"}
                </h4>
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-slate-500">ID:</span>
                <span className="font-mono tabular-nums font-semibold text-[#0F3D2E] bg-amber-50 px-1 rounded border border-amber-200/50 text-[10px]">
                  {plot.passportId || "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-2 text-center z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 mb-1 group-hover:bg-[#0F3D2E] group-hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-[#0F3D2E]/80 font-medium">
                Available Plot
              </p>
            </div>
          )}

          {/* Bottom Tap Trigger */}
          <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center justify-between">
            {isOccupied ? (
              <div className="w-full flex items-center justify-between text-[10px] text-slate-500 group-hover:text-[#0F3D2E]">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#D4AF37]" />
                  <span>View Details</span>
                </span>
                <span className="font-serif text-[#D4AF37] font-semibold">
                  Tap &rarr;
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddDetails(plot);
                }}
                className="w-full min-h-[32px] rounded-lg bg-[#0F3D2E] hover:bg-[#164E3A] text-[#FDFBF7] text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3 h-3 text-[#D4AF37]" />
                <span>+ Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
