import React from 'react';
import { PaymentStatus } from '../types';
import { SearchIcon, DownloadIcon, ChevronDownIcon } from './Icons';

export type SortOption = 'date-desc' | 'priority-desc';

interface FilterControlsProps {
  filterStatus: PaymentStatus | 'all';
  setFilterStatus: (status: PaymentStatus | 'all') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  onExport: () => void;
}

const filterOptions: { label: string; value: PaymentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: PaymentStatus.PENDING },
  { label: 'Processing', value: PaymentStatus.PROCESSING },
  { label: 'Settled', value: PaymentStatus.SETTLED },
  { label: 'Failed', value: PaymentStatus.FAILED },
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  onExport,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilterStatus(option.value)}
            className={`
              px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200
              ${filterStatus === option.value
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }
            `}
          >
            {option.label}
          </button>
        ))}
        <div className="relative">
          <select
            id="sort-by"
            value={sortOption}
            onChange={e => setSortOption(e.target.value as SortOption)}
            className="bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-8 text-sm font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none hover:bg-slate-700 transition-colors"
          >
            <option value="date-desc">Sort: Newest</option>
            <option value="priority-desc">Sort: Priority</option>
          </select>
          <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by user, retailer, tx hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <button
          onClick={onExport}
          title="Export filtered payments as CSV"
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 bg-slate-800 text-slate-300 hover:bg-slate-700"
        >
          <DownloadIcon className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};