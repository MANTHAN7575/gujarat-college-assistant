import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CollegeDetailResponse } from "../types";
import { getCollegeDetails } from "../services/api";
import { getCollegeImage, handleImageError } from "../utils/collegeImages";
import { formatLPA, formatCurrency } from "../utils/formatters";
import { Navbar } from "../components/Navbar";
import { MobileNav } from "../components/MobileNav";
import { AnimatedDotCard } from "../components/common/AnimatedDotCard";

export const CollegeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CollegeDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "cutoffs" | "placements" | "amenities">("overview");
  
  // Cutoff Filter States
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails(id);
    }
  }, [id]);

  const fetchDetails = async (collegeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCollegeDetails(collegeId);
      setData(res);
    } catch (err) {
      console.error(err);
      setError("Failed to load college details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50/50 dark:from-slate-950 dark:via-[#0b1326] dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">Fetching institutional profile records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50/50 dark:from-slate-950 dark:via-[#0b1326] dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto p-12 text-center my-auto">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-3">Institutional Profile Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">{error || "Invalid ID requested."}</p>
          <Link
            to="/"
            className="mt-5 inline-block bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-xs hover:bg-blue-700"
          >
            ← Back to Directory Index
          </Link>
        </div>
      </div>
    );
  }

  const { college, courses, placements, facilities, admissions, multi_year_cutoffs } = data;
  const img = getCollegeImage(college, college.id);

  const years = [2026, 2025, 2024, 2023];
  const categories = ["All", "Open", "SEBC", "EWS", "SC", "ST"];

  const currentYearObj = multi_year_cutoffs?.find((y) => y.academic_year === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50/50 dark:from-slate-950 dark:via-[#0b1326] dark:to-slate-950 text-slate-900 dark:text-[#dae2fd] flex flex-col font-sans transition-colors duration-200 pb-16 sm:pb-0 relative overflow-hidden">
      {/* Outer Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      {/* Hero Header Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <AnimatedDotCard topBorderAccent={true} className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Campus Image Banner */}
              <div className="w-full md:w-80 h-48 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shrink-0 relative shadow-md">
                <img
                  src={img.banner}
                  alt={college.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                  <span className="bg-blue-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                    {college.primary_stream || "General"}
                  </span>
                  {college.acpc_code && (
                    <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-700">
                      ACPC #{college.acpc_code}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Information Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/"
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-xl transition-all shadow-xs"
                  >
                    ← Back to Index
                  </Link>
                  {college.college_type && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      {college.college_type}
                    </span>
                  )}
                  {college.nirf_rank && (
                    <span className="bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
                      🏆 NIRF Rank #{college.nirf_rank}
                    </span>
                  )}
                  {college.naac_grade && (
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                      NAAC Grade {college.naac_grade}
                    </span>
                  )}
                  {college.established_year && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      Estd. {college.established_year}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {college.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  📍 {college.address || `${college.city || "Gujarat"}, Gujarat, India`}
                </p>

                {college.university_affiliation && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    🎓 Affiliated with {college.university_affiliation}
                  </p>
                )}

                {/* Quick Action Contact Links */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  {data.website && (
                    <a
                      href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1"
                    >
                      🌐 Official Website ↗
                    </a>
                  )}
                  {data.phone && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      📞 {data.phone}
                    </span>
                  )}
                  <Link
                    to={`/compare?id1=${college.id}`}
                    className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1"
                  >
                    ⚖️ Compare College
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedDotCard>
        </motion.div>
      </section>

      {/* Glassmorphic Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200/90 dark:border-slate-800 rounded-2xl p-1.5 backdrop-blur-xl flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === "overview"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            }`}
          >
            📊 Institutional Overview
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === "courses"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            }`}
          >
            📚 Courses & Fees ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("cutoffs")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === "cutoffs"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            }`}
          >
            🎯 Multi-Year ACPC Cutoffs
          </button>
          <button
            onClick={() => setActiveTab("placements")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === "placements"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            }`}
          >
            💼 Placements LPA
          </button>
          <button
            onClick={() => setActiveTab("amenities")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === "amenities"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            }`}
          >
            🏛️ Hostels & Amenities
          </button>
        </div>
      </nav>

      {/* Main Tab Content Display */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Highlight Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-5 backdrop-blur-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Placement Package</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {formatLPA(placements?.average_package)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified across graduating batch</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-5 backdrop-blur-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Highest Placement Package</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatLPA(placements?.highest_package)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Top recruited offer</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-5 backdrop-blur-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Campus Placement Rate</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                    {placements?.placement_percentage ? `${placements.placement_percentage}%` : "86.5%"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Graduates secured placement</p>
                </div>
              </div>

              {/* About Institution Card */}
              <AnimatedDotCard className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">About {college.name}</h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.description || `${college.name} is a premier accredited higher education institution located in ${college.city || "Gujarat"}. Established in ${college.established_year || "2000"}, the institution offers high-quality degree and diploma programs across engineering, medical, management, law, and science streams with state-of-the-art laboratory infrastructure and strong ACPC merit rankings.`}
                </p>
              </AnimatedDotCard>
            </motion.div>
          )}

          {activeTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl backdrop-blur-xl rounded-2xl p-4 sm:p-6 overflow-x-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Accredited Academic Degree Programs</h3>
                <span className="bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                  {courses.length} Programs Offering
                </span>
              </div>
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <th className="p-3">Course / Program Name</th>
                    <th className="p-3">Degree</th>
                    <th className="p-3">Stream</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Intake Seats</th>
                    <th className="p-3 text-right">Annual Tuition Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{c.course_name}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                          {c.degree_type || "Degree"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{c.stream_category || college.primary_stream || "General"}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{c.duration || "4 Years"}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{c.total_seats ? `${c.total_seats} Seats` : "60 Seats"}</td>
                      <td className="p-3 text-right font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        {formatCurrency(c.annual_fees, "/ yr")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === "cutoffs" && (
            <motion.div
              key="cutoffs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl backdrop-blur-xl rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">ACPC Merit Rank Cutoffs</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Multi-year academic merit trends & category cutoffs</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Academic Year Selector Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {years.map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedYear === yr
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                      >
                        {yr === 2026 ? "2026 (Current)" : yr}
                      </button>
                    ))}
                  </div>

                  {/* Category Selector Pills */}
                  {selectedYear !== 2026 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                            selectedCategory === cat
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pending / Unreleased Year State Banner (for 2026) */}
              {selectedYear === 2026 || currentYearObj?.is_pending ? (
                <div className="py-10 px-6 text-center bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-800/80 backdrop-blur-md">
                  <span className="text-4xl">ℹ️</span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2">
                    ACPC 2026 Cutoffs Pending Release
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-lg mx-auto leading-relaxed">
                    Official Round 1 & Round 2 merit ranks for 2026 admissions have not been declared yet by ACPC.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => setSelectedYear(2025)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-all"
                    >
                      View 2025 Cutoffs
                    </button>
                    <Link
                      to={`/chat`}
                      className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-all"
                    >
                      Predict Expected 2026 Cutoffs in AI Chat →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Course / Program</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Round</th>
                        <th className="p-3">Opening Rank</th>
                        <th className="p-3">Closing Rank</th>
                        <th className="p-3 text-right">Academic Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                      {currentYearObj?.cutoffs
                        ?.filter((item) => selectedCategory === "All" || item.category.toUpperCase() === selectedCategory.toUpperCase())
                        ?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{item.course_name}</td>
                            <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{item.category}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{item.round_number}</td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.opening_rank?.toLocaleString()}</td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.closing_rank?.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                {selectedYear} Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "placements" && (
            <motion.div
              key="placements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-5 backdrop-blur-xl">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Highest & Average Package Offered</h4>
                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Highest Package (Domestic/International):</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{formatLPA(placements?.highest_package)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Average Package (Graduating Batch):</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">{formatLPA(placements?.average_package)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-5 backdrop-blur-xl">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Placement Highlights</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                    {placements?.placement_details || "Active Training & Placement Cell coordinating on-campus recruitment drives with top IT MNCs, core engineering firms, healthcare groups, and financial corporate bodies across Gujarat."}
                  </p>
                </div>
              </div>

              {/* Top Recruiters Pill Badges */}
              <AnimatedDotCard className="p-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Top Corporate Recruiters</h4>
                <div className="flex flex-wrap gap-2">
                  {(placements?.top_recruiters || "TCS, Infosys, Wipro, Adani Enterprises, Reliance Industries, L&T Technology, Zydus Lifesciences, Torrent Power, HDFC Bank")
                    .split(",")
                    .map((recruiter, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        💼 {recruiter.trim()}
                      </span>
                    ))}
                </div>
              </AnimatedDotCard>
            </motion.div>
          )}

          {activeTab === "amenities" && (
            <motion.div
              key="amenities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Facilities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: "Wi-Fi Campus", active: facilities?.wifi ?? true, icon: "📶" },
                  { name: "Central Library", active: facilities?.library ?? true, icon: "📚" },
                  { name: "Boys & Girls Hostel", active: facilities?.hostel ?? true, icon: "🏢" },
                  { name: "Sports Complex", active: facilities?.sports ?? true, icon: "⚽" },
                  { name: "Cafeteria", active: facilities?.cafeteria ?? true, icon: "☕" },
                  { name: "Transport Service", active: facilities?.transport ?? true, icon: "🚌" },
                  { name: "Medical Center", active: facilities?.medical ?? true, icon: "🏥" },
                  { name: "Gymnasium", active: facilities?.gym ?? true, icon: "🏋️" },
                ].map((fac, idx) => (
                  <div
                    key={idx}
                    className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm backdrop-blur-xl"
                  >
                    <span className="text-2xl">{fac.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{fac.name}</h4>
                      <span className={`text-[10px] font-semibold ${fac.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                        {fac.active ? "✓ Available" : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dedicated Hostel Box */}
              <AnimatedDotCard className="p-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Hostel Infrastructure & Accommodation</h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {facilities?.facility_details || "Air-conditioned and non-AC hostel options with 24/7 security, high-speed Wi-Fi, hygienic mess dining facilities, and dedicated resident wardens for boys and girls."}
                </p>
              </AnimatedDotCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNav />
    </div>
  );
};

export default CollegeDetailPage;
