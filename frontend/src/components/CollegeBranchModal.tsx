import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, MapPin, GraduationCap, Star, X, ExternalLink } from "lucide-react";
import { CollegeBranch } from "../types";

interface CollegeBranchModalProps {
  isOpen: boolean;
  collegeName: string;
  branches: CollegeBranch[];
  loading: boolean;
  onClose: () => void;
}

export const CollegeBranchModal: React.FC<CollegeBranchModalProps> = ({
  isOpen,
  collegeName,
  branches,
  loading,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div>
                <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Campus Locations
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  Other Campuses & Branches
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                  All campus locations for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{collegeName}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl text-sm font-bold transition-all shrink-0 border border-slate-200 dark:border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable List) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {loading ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 animate-pulse h-24"
                    />
                  ))}
                </div>
              ) : branches.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    Single Campus Location
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This college operates from a single campus.
                  </p>
                </div>
              ) : (
                branches.map((branch, idx) => (
                  <motion.div
                    key={branch.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 transition-all hover:border-indigo-500/60 hover:shadow-md group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {branch.is_main_campus && (
                          <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" /> Main Campus
                          </span>
                        )}
                        <span className="bg-slate-200 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-300 dark:border-slate-700">
                          <MapPin className="w-3 h-3" /> {branch.city}
                        </span>
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-300 dark:border-slate-700">
                          <GraduationCap className="w-3 h-3" /> {branch.stream}
                        </span>
                        {branch.acpc_code && (
                          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700">
                            ACPC #{branch.acpc_code}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {branch.name}
                      </h4>

                      {branch.annual_fees && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Annual Fees: <span className="font-bold text-slate-900 dark:text-white">₹{branch.annual_fees.toLocaleString()} / year</span>
                        </p>
                      )}
                    </div>

                    {branch.id ? (
                      <Link
                        to={`/college/${branch.id}`}
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs text-center shrink-0 flex items-center justify-center gap-1"
                      >
                        <span>View Branch Profile</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Affiliated Branch</span>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Verified ACPC & Gujarat University Network</span>
              <button
                onClick={onClose}
                className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700"
              >
                Close Explorer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CollegeBranchModal;
