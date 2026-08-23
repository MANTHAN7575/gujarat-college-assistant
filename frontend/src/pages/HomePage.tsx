import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, GraduationCap, Building2, AlertTriangle, Layers } from "lucide-react";
import { College, CollegeBranch } from "../types";
import { fetchPaginatedColleges, getCollegeBranches } from "../services/api";
import { Navbar } from "../components/Navbar";
import { MobileNav } from "../components/MobileNav";
import { CollegeBranchModal } from "../components/CollegeBranchModal";
import { CollegeCard } from "../components/CollegeCard";
import { AnimatedDotCard } from "../components/common/AnimatedDotCard";

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const directoryRef = useRef<HTMLDivElement>(null);

  const [colleges, setColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedStream, setSelectedStream] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalColleges, setTotalColleges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(totalColleges / perPage));

  // Top Page Jump State & Toast Warning
  const [topJumpInput, setTopJumpInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Branch Modal State
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [selectedCollegeName, setSelectedCollegeName] = useState("");
  const [branchList, setBranchList] = useState<CollegeBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const streams = [
    "All",
    "Engineering",
    "Medical",
    "Commerce",
    "Law",
    "Management",
    "Science",
    "Arts",
    "Polytechnic"
  ];

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setSearchTerm(q);
      setSelectedStream("All");
    }
  }, [searchParams]);

  useEffect(() => {
    loadColleges(currentPage, selectedStream, searchTerm);
  }, [currentPage, selectedStream, searchTerm]);

  const loadColleges = async (page: number, stream: string, search: string) => {
    setLoading(true);
    setError(null);
    try {
      let res = await fetchPaginatedColleges(page, perPage, stream, search);
      if (res.items.length === 0 && search && search.trim() && stream !== "All") {
        res = await fetchPaginatedColleges(1, perPage, "All", search);
        setSelectedStream("All");
      }
      setColleges(res.items || (res as any).colleges || []);
      setTotalColleges(res.total || (res as any).total_count || 2530);
    } catch (err) {
      console.error("Failed to load colleges", err);
      setError("Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    if (term.trim()) {
      setSelectedStream("All");
    }
  };

  const handleStreamSelect = (st: string) => {
    setSelectedStream(st);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleTopJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topJumpInput.trim()) return;

    const pageNum = parseInt(topJumpInput.trim(), 10);
    if (isNaN(pageNum)) {
      triggerToast("Please enter a valid numeric page number.");
      return;
    }

    if (pageNum < 1) {
      triggerToast("Page number must be 1 or higher.");
      return;
    }

    if (pageNum > totalPages) {
      triggerToast(`Page ${pageNum} does not exist. Maximum available page is ${totalPages}.`);
      return;
    }

    setToastMessage(null);
    handlePageChange(pageNum);
    setTopJumpInput("");
  };

  const handleOpenBranches = async (college: College) => {
    setSelectedCollegeName(college.name);
    setBranchModalOpen(true);
    setBranchesLoading(true);
    try {
      const branches = await getCollegeBranches(college.id);
      setBranchList(branches);
    } catch (err) {
      console.error(err);
      setBranchList([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2E8F0] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 pb-16 sm:pb-0 relative overflow-hidden">
      {/* Outer Ambient Glow Layer */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      {/* Hero Banner Container */}
      <section className="py-6 sm:py-8 responsive-page-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <AnimatedDotCard topBorderAccent={true} className="p-6 sm:p-10 md:p-12 text-center">
            <div className="max-w-4xl mx-auto">
              <span className="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>GUJARAT COLLEGE ADMISSION GUIDE</span>
              </span>

              <h1 className="hero-title tracking-tight text-slate-900 dark:text-white mt-3 sm:mt-4">
                Discover Accredited Colleges Across Gujarat
              </h1>

              {/* High Contrast Search Input Box */}
              <div className="mt-6 sm:mt-8 mb-5 sm:mb-6 max-w-xl mx-auto relative group">
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all p-1.5">
                  <Search className="w-4 h-4 text-slate-400 ml-2.5 sm:ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by college name, ACPC code, or acronym (e.g. SSU, SSIT, LDRP, BVM)..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm py-2 sm:py-2.5 px-2.5 sm:px-3 outline-none font-medium min-w-0"
                  />
                  <button
                    onClick={() => handleSearch(searchTerm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Discipline Filter Pills */}
              <div className="discipline-filters-row max-w-3xl mx-auto">
                {streams.map((st) => (
                  <motion.button
                    key={st}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleStreamSelect(st)}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      selectedStream === st
                        ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {st}
                  </motion.button>
                ))}
              </div>
            </div>
          </AnimatedDotCard>
        </motion.div>
      </section>

      {/* Main Directory Grid Content */}
      <main ref={directoryRef} className="responsive-page-container py-4 sm:py-6 flex-1 scroll-mt-20">
        {/* Top Directory Controls Bar */}
        <div className="directory-controls-bar">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h2 className="section-title font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
              <span>All Colleges</span>
            </h2>
            <span className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded-md text-xs border border-slate-300 dark:border-slate-700">
              {totalColleges.toLocaleString()} Total
            </span>
          </div>

          {/* Minimalist Top Page Jump Input Control */}
          <form onSubmit={handleTopJumpSubmit} className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jump to Page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder={`1-${totalPages}`}
              value={topJumpInput}
              onChange={(e) => setTopJumpInput(e.target.value)}
              className="w-14 sm:w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl outline-none focus:border-indigo-500 text-center"
            />
            <button
              type="submit"
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>

        {/* Validation Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner / Grid View */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 font-medium text-xs sm:text-sm text-slate-600 dark:text-slate-400">Loading ACPC Gujarat institutions...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Directory Connection Error</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">{error}</p>
          </div>
        ) : colleges.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">No Institutions Found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">Try broadening your search term or selecting "All" disciplines.</p>
          </div>
        ) : (
          <div className="college-cards-grid">
            {colleges.map((college, index) => (
              <div key={college.id} className="relative group h-full">
                <CollegeCard college={college} index={index} />
                {college.branches && college.branches.length > 1 && (
                  <button
                    onClick={() => handleOpenBranches(college)}
                    className="absolute top-3 right-3 z-10 bg-slate-900/90 hover:bg-slate-800 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 backdrop-blur-md shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Layers className="w-3 h-3" />
                    <span>{college.branches.length} Campuses</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dedicated Permanent Bottom Pagination Bar Card */}
        {!loading && colleges.length > 0 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Showing Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> <span className="text-slate-400 font-normal">({totalColleges.toLocaleString()} Institutions)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  if (directoryRef.current) {
                    directoryRef.current.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }
                }}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  if (directoryRef.current) {
                    directoryRef.current.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }
                }}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* College Sister Campuses Modal */}
      <CollegeBranchModal
        isOpen={branchModalOpen}
        collegeName={selectedCollegeName}
        branches={branchList}
        loading={branchesLoading}
        onClose={() => setBranchModalOpen(false)}
      />

      <MobileNav />
    </div>
  );
};
export default HomePage;
