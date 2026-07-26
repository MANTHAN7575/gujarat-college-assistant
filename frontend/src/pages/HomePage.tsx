import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { College, CollegeBranch } from "../types";
import { fetchPaginatedColleges, getCollegeBranches } from "../services/api";
import { getCollegeImage, handleImageError } from "../utils/collegeImages";
import { Navbar } from "../components/Navbar";
import { MobileNav } from "../components/MobileNav";
import { Pagination } from "../components/Pagination";
import { CollegeBranchModal } from "../components/CollegeBranchModal";
import { AnimatedDotCard } from "../components/common/AnimatedDotCard";

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const directoryRef = useRef<HTMLDivElement>(null);

  const [colleges, setColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedStream, setSelectedStream] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColleges, setTotalColleges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      let res = await fetchPaginatedColleges(page, 20, stream, search);
      if (res.items.length === 0 && search && search.trim() && stream !== "All") {
        res = await fetchPaginatedColleges(1, 20, "All", search);
        setSelectedStream("All");
      }
      setColleges(res.items);
      setTotalPages(res.pages);
      setTotalColleges(res.total);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to FastAPI backend server on http://127.0.0.1:8000.");
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
    setCurrentPage(newPage);
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: "smooth" });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50/50 dark:from-slate-950 dark:via-[#0b1326] dark:to-slate-950 text-slate-900 dark:text-[#dae2fd] flex flex-col font-sans transition-colors duration-200 pb-16 sm:pb-0 relative overflow-hidden">
      {/* Outer Ambient Glow Layer */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      {/* Refined Executive Hero Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <AnimatedDotCard topBorderAccent={true} className="p-6 sm:p-10 text-center">
            <div className="max-w-4xl mx-auto">
              <span className="bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Official ACPC & University Intelligence
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mt-3">
                Discover <span className="text-blue-600 dark:text-blue-400 font-extrabold">2,530+ Accredited Colleges</span> in Gujarat
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Explore ACPC rank cutoffs, annual tuition fees, highest LPA placement packages, and hostel facilities across engineering, medical, commerce, law, and polytechnic institutions.
              </p>

              {/* High Contrast Search Input Box */}
              <div className="mt-6 max-w-xl mx-auto relative group">
                <div className="flex items-center bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all p-1.5">
                  <input
                    type="text"
                    placeholder="Search by college name, ACPC code, or acronym (e.g. SSU, SSIT, LDRP, BVM)..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-sm py-2.5 px-4 outline-none font-medium"
                  />
                  <button
                    onClick={() => handleSearch(searchTerm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4.5 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Discipline Filter Pills */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {streams.map((st) => (
                  <motion.button
                    key={st}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleStreamSelect(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      selectedStream === st
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                        : "bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
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
      <main ref={directoryRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full scroll-mt-20">
        {/* Top Directory Controls Bar with Relocated Minimalist "Jump to Page" Control */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Higher Education Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Verified institutional records, ACPC merit cutoffs, and placement intelligence across Gujarat.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Minimalist Top "Jump to Page" Control */}
            {totalPages > 1 && (
              <form onSubmit={handleTopJumpSubmit} className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs px-3 py-1.5 rounded-xl backdrop-blur-xl">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Jump to Page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder="#"
                  value={topJumpInput}
                  onChange={(e) => setTopJumpInput(e.target.value)}
                  className="w-14 h-7 text-xs font-bold text-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                >
                  Go
                </button>
              </form>
            )}

            <span className="bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              {totalColleges.toLocaleString()} Institutions
            </span>
          </div>
        </div>

        {/* Toast Warning Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-4 bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-amber-900 dark:text-amber-200 hover:text-amber-700 dark:hover:text-white font-bold ml-3 text-xs"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => loadColleges(currentPage, selectedStream, searchTerm)}
              className="bg-amber-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-amber-800 shadow-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white/90 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 animate-pulse h-88 flex flex-col justify-between"
              >
                <div className="h-40 bg-slate-200 dark:bg-slate-800"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
                <div className="p-5 pt-0">
                  <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16 bg-white/90 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl backdrop-blur-xl">
            <span className="text-5xl">🏛️</span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-3">No Institutions Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Try searching with keywords like "SSU", "LDRP", "BVM", "SAL", "Medical", or "Gandhinagar".
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college, idx) => {
                const img = getCollegeImage(college, idx);
                return (
                  <motion.div
                    key={college.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="bg-white/95 dark:bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Campus Image Banner */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                      <img
                        src={img.banner}
                        alt={college.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                          {college.primary_stream || "General"}
                        </span>
                        {college.acpc_code && (
                          <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700/60 shadow-xs">
                            ACPC #{college.acpc_code}
                          </span>
                        )}
                        {college.nirf_rank && (
                          <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            🏆 NIRF #{college.nirf_rank}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 left-3.5 right-3.5">
                        <span className="text-xs text-blue-100 font-semibold flex items-center gap-1 drop-shadow-xs">
                          📍 {college.city || "Gujarat"}, Gujarat
                        </span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {college.name}
                        </h3>

                        <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md">
                            {college.college_type || "University"}
                          </span>
                          {college.university_affiliation && (
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md">
                              {college.university_affiliation}
                            </span>
                          )}
                          {college.naac_grade && (
                            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 font-bold px-2 py-0.5 rounded-md">
                              NAAC {college.naac_grade}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/college/${college.id}`}
                            className="flex-1 bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-xl text-center text-xs transition-all shadow-xs"
                          >
                            View Profile →
                          </Link>
                          <Link
                            to={`/compare?id1=${college.id}`}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
                            title="Compare College"
                          >
                            ⚖️ Compare
                          </Link>
                        </div>

                        <button
                          onClick={() => handleOpenBranches(college)}
                          className="w-full bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 font-semibold py-1.5 px-3 rounded-xl text-center text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          🏢 Network Campuses / Branches
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Clean Minimal Bottom Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalColleges}
              perPage={20}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* College Branch & Sister Campus Modal */}
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
