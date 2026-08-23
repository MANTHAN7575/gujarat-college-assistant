import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, Plus, X, Building2, MapPin, Loader2 } from "lucide-react";
import { College } from "../types";
import { fetchPaginatedColleges } from "../services/api";

interface AddCollegeModalProps {
  isOpen: boolean;
  selectedIds: number[];
  allColleges: College[];
  onClose: () => void;
  onAddCollege: (collegeId: number) => void;
}

export const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  isOpen,
  selectedIds,
  allColleges,
  onClose,
  onAddCollege,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<College[]>(allColleges);
  const [searching, setSearching] = useState(false);

  // Sync initial list when modal opens or allColleges updates
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(allColleges);
    }
  }, [allColleges]);

  // Debounced API search (200ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(allColleges);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetchPaginatedColleges(1, 20, undefined, searchQuery.trim());
        setSearchResults(res.items);
      } catch (err) {
        console.error("Search error in AddCollegeModal:", err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, allColleges]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-2xl rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 mb-3">
            <div>
              <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                Search Colleges
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight mt-1">
                Choose a College to Compare
              </h3>
            </div>
            <button
              onClick={onClose}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sticky Search Input Bar */}
          <div className="relative mb-3.5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 2,530+ colleges by name, ACPC code, city, or stream..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
            />
            {searching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
            )}
          </div>

          {/* Scrollable College List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {searchResults.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  No colleges found matching "{searchQuery}"
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Try searching by city (e.g. Gandhinagar, Rajkot) or ACPC code (e.g. 088, 015).
                </p>
              </div>
            ) : (
              searchResults.map((col) => {
                const isSelected = selectedIds.includes(col.id);
                return (
                  <div
                    key={col.id}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                        : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                          {col.name}
                        </span>
                        {col.acpc_code && (
                          <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                            #{col.acpc_code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{col.city || "Gujarat"} • {col.primary_stream || "General"}</span>
                      </p>
                    </div>

                    {isSelected ? (
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold px-3 py-1 rounded-xl shrink-0 flex items-center gap-1 border border-slate-300 dark:border-slate-700">
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Added
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddCollege(col.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddCollegeModal;
