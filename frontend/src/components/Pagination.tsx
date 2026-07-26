import React from "react";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  perPage = 20,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="relative mt-8">
      {/* Clean Minimalist Bottom Pagination Dock */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/80 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
      >
        {/* Left Side: Items Count Badge */}
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium text-center sm:text-left">
          Showing <span className="font-bold text-slate-900 dark:text-white">{startItem.toLocaleString()}</span> to{" "}
          <span className="font-bold text-slate-900 dark:text-white">{endItem.toLocaleString()}</span> of{" "}
          <span className="font-bold text-blue-600 dark:text-blue-400">{totalItems.toLocaleString()}</span> Institutions
        </div>

        {/* Right Side: Prev / Current Page / Next Controls */}
        <div className="flex items-center gap-2.5">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300"
          >
            ← Prev
          </button>

          {/* Current Page Badge */}
          <span className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            Page <span className="text-blue-600 dark:text-blue-400">{currentPage}</span> of {totalPages}
          </span>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300"
          >
            Next →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Pagination;
