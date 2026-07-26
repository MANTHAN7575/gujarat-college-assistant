import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, GraduationCap, Building2, AlertTriangle, Layers, ArrowRight } from "lucide-react";
import { College, CollegeBranch } from "../types";
import { fetchPaginatedColleges, getCollegeBranches } from "../services/api";
import { Navbar } from "../components/Navbar";
import { MobileNav } from "../components/MobileNav";
import { Pagination } from "../components/Pagination";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200 pb-16 sm:pb-0 relative overflow-hidden">
      {/* Outer Ambient Glow Layer */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-teal-500/10 via-indigo-500/10 to-slate-900 rounded-full blur-3xl pointer-events-none -z-10" />

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
              <span className="bg-slate-800 border border-slate-700 text-teal-400 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                <span>GUJARAT HIGHER EDUCATION ADMISSIONS INDEX</span>
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mt-3">
                Discover Accredited Colleges Across Gujarat
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Official ACPC merit rank cutoffs, annual tuition fees, placement LPA statistics, and hostel facilities across engineering, medical, commerce, law, and polytechnic institutions.
              </p>

              {/* High Contrast Search Input Box */}
              <div className="mt-6 max-w-xl mx-auto relative group">
                <div className="flex items-center bg-slate-900 border border-slate-700 shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all p-1.5">
                  <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by college name, ACPC code, or acronym (e.g. SSU, SSIT, LDRP, BVM)..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-transparent text-white placeholder:text-slate-500 text-sm py-2.5 px-3 outline-none font-medium"
                  />
                  <button
                    onClick={() => handleSearch(searchTerm)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4.5 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5"
                  >
                    <span>Search</span>
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
                        ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-500/20"
                        : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              <span>Institutions Directory</span>
            </h2>
            <span className="bg-slate-800 text-slate-300 font-bold px-2.5 py-0.5 rounded-md text-xs border border-slate-700">
              {totalColleges.toLocaleString()} Total
            </span>
          </div>

          {/* Minimalist Top Page Jump Input Control */}
          <form onSubmit={handleTopJumpSubmit} className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jump to Page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder={`1-${totalPages}`}
              value={topJumpInput}
              onChange={(e) => setTopJumpInput(e.target.value)}
              className="w-16 bg-slate-900 border border-slate-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl outline-none focus:border-teal-500 text-center"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-slate-700 transition-all shadow-xs"
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
              className="mb-4 bg-amber-950/60 border border-amber-800 text-amber-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner / Grid View */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 font-medium text-xs sm:text-sm text-slate-400">Loading ACPC Gujarat institutions...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white mt-3">Directory Connection Error</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">{error}</p>
          </div>
        ) : colleges.length === 0 ? (
          <div className="py-16 text-center bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white mt-3">No Institutions Found</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Try broadening your search term or selecting "All" disciplines.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {colleges.map((college, index) => (
              <div key={college.id} className="relative group">
                <CollegeCard college={college} index={index} />
                {college.branches && college.branches.length > 1 && (
                  <button
                    onClick={() => handleOpenBranches(college)}
                    className="absolute top-3 right-3 z-10 bg-slate-900/90 hover:bg-slate-800 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 backdrop-blur-md shadow-xs transition-all flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>{college.branches.length} Campuses</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalColleges}
              onPageChange={handlePageChange}
            />
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
