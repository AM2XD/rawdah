import React, { useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { OccupancyFilter } from '../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: OccupancyFilter;
  onFilterChange: (filter: OccupancyFilter) => void;
  totalCount: number;
  vacantCount: number;
  occupiedCount: number;
  matchCount: number;
  onJumpToPlot: (plotNumber: number) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  totalCount,
  vacantCount,
  occupiedCount,
  matchCount,
  onJumpToPlot,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchQuery.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= 200) {
      onJumpToPlot(num);
    }
  };

  return (
    <div className="bg-[#FAF7EE] border-b border-[#D4AF37]/30 shadow-inner px-4 py-3.5 transition-all animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Main Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0F3D2E]/60">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Plot #, Name, CNP, or Adeverință..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D4AF37]/40 rounded-xl text-xs sm:text-sm text-[#0F3D2E] placeholder-[#0F3D2E]/50 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent transition-shadow shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 min-h-[44px]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Control Group (Segmented Buttons) */}
          <div className="flex items-center gap-1 bg-[#EFECE1] p-1 rounded-xl border border-[#D4AF37]/25 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#0F3D2E] text-[#FDFBF7] shadow-sm'
                  : 'text-[#0F3D2E]/80 hover:text-[#0F3D2E]'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('vacant')}
              className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filter === 'vacant'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-[#0F3D2E]/80 hover:text-[#0F3D2E]'
              }`}
            >
              Vacant ({vacantCount})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('occupied')}
              className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filter === 'occupied'
                  ? 'bg-[#D4AF37] text-[#0F3D2E] shadow-sm'
                  : 'text-[#0F3D2E]/80 hover:text-[#0F3D2E]'
              }`}
            >
              Occupied ({occupiedCount})
            </button>
          </div>

          {/* Close Search Button */}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] sm:min-h-[44px] min-w-[38px] sm:min-w-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#D4AF37]/30 text-[#0F3D2E] hover:bg-[#F2EFE6] text-xs font-medium flex items-center justify-center gap-1 shrink-0 transition-colors"
            title="Hide search panel"
          >
            <X className="w-4 h-4" />
            <span className="sm:hidden">Close</span>
          </button>
        </div>

        {/* Search Results Summary & Quick Jump */}
        <div className="flex items-center justify-between text-xs text-[#0F3D2E]/80 pt-0.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              Showing <strong className="font-semibold text-[#0F3D2E] tabular-nums">{matchCount}</strong> of {totalCount} plots
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </span>
          </div>

          {/* Quick jump trigger */}
          <div className="text-[11px] text-[#0F3D2E]/70 hidden sm:block">
            Tip: Type plot number to jump directly
          </div>
        </div>

      </div>
    </div>
  );
};
