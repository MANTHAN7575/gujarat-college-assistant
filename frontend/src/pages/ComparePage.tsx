import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { College, CollegeDetailResponse } from "../types";
import { getAllColleges, compareColleges } from "../services/api";
import { getCollegeImage, handleImageError } from "../utils/collegeImages";
import { formatLPA, formatCurrency } from "../utils/formatters";
import { Navbar } from "../components/Navbar";
import { MobileNav } from "../components/MobileNav";
import { AddCollegeModal } from "../components/AddCollegeModal";
import { AnimatedDotCard } from "../components/common/AnimatedDotCard";

export const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparedData, setComparedData] = useState<CollegeDetailResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    try {
      const list = await getAllColleges();
      setAllColleges(list);

      const id1 = searchParams.get("id1");
      const id2 = searchParams.get("id2");
      const id3 = searchParams.get("id3");

      const initialIds: number[] = [];
      if (id1) initialIds.push(Number(id1));
      if (id2) initialIds.push(Number(id2));
      if (id3) initialIds.push(Number(id3));

      if (initialIds.length === 0 && list.length >= 2) {
        initialIds.push(list[0].id, list[1].id);
      } else if (initialIds.length === 0 && list.length === 1) {
        initialIds.push(list[0].id);
      }

      setSelectedIds(initialIds);
      if (initialIds.length > 0) {
        runComparison(initialIds);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runComparison = async (ids: number[]) => {
    if (ids.length === 0) return;
    setLoading(true);
    try {
      const res = await compareColleges(ids);
      setComparedData(res?.colleges || []);
    } catch (err) {
      console.error(err);
      setComparedData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollege = (id: number) => {
    if (selectedIds.includes(id) || selectedIds.length >= 3) return;
    const updated = [...selectedIds, id];
    setSelectedIds(updated);
    runComparison(updated);
    setModalOpen(false);
  };

  const handleRemoveCollege = (id: number) => {
    const updated = selectedIds.filter((item) => item !== id);
    setSelectedIds(updated);
    if (updated.length > 0) {
      runComparison(updated);
    } else {
      setComparedData([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50/50 dark:from-slate-950 dark:via-[#0b1326] dark:to-slate-950 text-slate-900 dark:text-[#dae2fd] flex flex-col font-sans transition-colors duration-200 pb-16 sm:pb-0 relative overflow-hidden">
      {/* Outer Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      {/* Elevated Header Container */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <AnimatedDotCard topBorderAccent={true} className="p-6 sm:p-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl mb-4 transition-all shadow-xs"
            >
              ← Back to Directory Index
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-0.5 rounded-md uppercase tracking-wider">
                  Academic Decision Matrix
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight text-slate-900 dark:text-white leading-tight">
                  Compare Gujarat Institutions
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-normal">
                  Side-by-side analysis of tuition fees, highest LPA placement packages, and ACPC cutoffs.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs border border-slate-200/80 dark:border-slate-700 transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>📄</span> Download Report
                </button>
                {selectedIds.length < 3 && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>+</span> Add College ({selectedIds.length}/3)
                  </button>
                )}
              </div>
            </div>
          </AnimatedDotCard>
        </motion.div>
      </section>

      {/* Main Comparison Matrix Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 w-full">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 font-medium text-xs sm:text-sm text-slate-500">Loading side-by-side metrics...</p>
          </div>
        ) : !comparedData || comparedData.length === 0 ? (
          <div className="py-16 text-center bg-white/90 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl backdrop-blur-xl">
            <span className="text-5xl">⚖️</span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-3">No Colleges Selected</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Select up to 3 colleges from the directory to build a side-by-side comparison table.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-xs"
            >
              Select Colleges
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="overflow-x-auto bg-white/90 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-xl p-2 sm:p-4"
          >
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
                  <th className="p-4 sm:p-5 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/4">
                    Metric / Parameter
                  </th>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    const colId = col?.id || idx + 1;
                    const colName = col?.name || "Unknown Institution";
                    const colCity = col?.city || "Gujarat";
                    const img = getCollegeImage(col, colId);

                    return (
                      <th key={colId} className="p-4 sm:p-5 text-slate-900 dark:text-white w-1/4 relative">
                        <button
                          onClick={() => handleRemoveCollege(colId)}
                          className="absolute top-3 right-3 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white w-5 h-5 rounded-full flex items-center justify-center transition-all"
                          title="Remove"
                        >
                          ✕
                        </button>
                        <div className="w-full h-20 rounded-xl overflow-hidden mb-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xs">
                          <img
                            src={img.banner}
                            alt={colName}
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base leading-tight text-slate-900 dark:text-white">{colName}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">📍 {colCity}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stream / Discipline
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    return (
                      <td key={col?.id || idx} className="p-4 sm:p-5 font-semibold text-slate-900 dark:text-slate-100">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                          {col?.primary_stream || "General"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    NIRF Ranking
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    return (
                      <td key={col?.id || idx} className="p-4 sm:p-5 font-semibold text-slate-900 dark:text-slate-100">
                        {col?.nirf_rank ? (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700">
                            🏆 NIRF #{col.nirf_rank}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tuition Fees (Annual)
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    const courses = item?.courses || col?.courses || [];
                    const minFee = courses.length > 0 ? Math.min(...courses.map((c: any) => c.annual_fees || 0)) : 0;
                    return (
                      <td key={col?.id || idx} className="p-4 sm:p-5 font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        {formatCurrency(minFee, "/ yr")}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Highest Placement Package
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    const placements = item?.placements || col?.placements;
                    return (
                      <td key={col?.id || idx} className="p-4 sm:p-5 font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        {formatLPA(placements?.highest_package)}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Average Placement Package
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    const placements = item?.placements || col?.placements;
                    return (
                      <td key={col?.id || idx} className="p-4 sm:p-5 font-semibold text-slate-900 dark:text-slate-100">
                        {formatLPA(placements?.average_package)}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hostel Amenities
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    const facilities = item?.facilities || col?.facilities;
                    return (
                      <td key={col?.id || idx} className="p-4 sm:p-5 font-medium text-slate-800 dark:text-slate-200">
                        {facilities?.hostel ? "✅ On-Campus Hostels" : "❌ No Hostel"}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Entrance Exams
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    const admissions = item?.admissions || col?.admissions;
                    return (
                      <td key={col?.id || idx} className="p-4 sm:p-5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {admissions?.entrance_exams || "GUJCET / Merit"}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Action
                  </td>
                  {comparedData.map((item, idx) => {
                    const col = (item as any)?.college || item;
                    const colId = col?.id || idx + 1;
                    return (
                      <td key={colId} className="p-4 sm:p-5">
                        <Link
                          to={`/college/${colId}`}
                          className="block w-full text-center bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-xl text-xs shadow-xs transition-all"
                        >
                          View Full Profile
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </main>

      {/* College Selector Modal with Embedded Live Search */}
      <AddCollegeModal
        isOpen={modalOpen}
        selectedIds={selectedIds}
        allColleges={allColleges}
        onClose={() => setModalOpen(false)}
        onAddCollege={handleAddCollege}
      />

      <MobileNav />
    </div>
  );
};
export default ComparePage;
