import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  BookOpen,
  BarChart3,
  Briefcase,
  Home,
  Award,
  MapPin,
  ExternalLink,
  Phone,
  Columns3,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Info,
  ArrowLeft
} from "lucide-react";
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
      <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">Fetching institutional profile records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto p-12 text-center my-auto">
          <Info className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3">Institutional Profile Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">{error || "Invalid ID requested."}</p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Directory Index</span>
          </Link>
        </div>
      </div>
    );
  }

  const college = (data as any)?.college || data;
  const courses = data?.courses || college?.courses || [];
  const placements = data?.placements || college?.placements;
  const facilities = data?.facilities || college?.facilities;
  const admissions = data?.admissions || college?.admissions;
  const multi_year_cutoffs = data?.multi_year_cutoffs || college?.multi_year_cutoffs;
  const img = getCollegeImage(college, college?.id || 1);

  const years = [2026, 2025, 2024, 2023];
  const categories = ["All", "Open", "SEBC", "EWS", "SC", "ST"];

  const currentYearObj = multi_year_cutoffs?.find((y: any) => y.academic_year === selectedYear);

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 pb-16 sm:pb-0 relative overflow-hidden">
      {/* Outer Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-slate-900 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      {/* Hero Header Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Compact Back Button Positioned Outside & Above Hero Banner */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xs transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform" />
            <span>Back to Directory Index</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <AnimatedDotCard topBorderAccent={true} className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Campus Image Banner */}
              <div className="w-full md:w-80 h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-900 shrink-0 relative shadow-md">
                <img
                  src={img.banner}
                  alt={college?.name || "Institution"}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                  <span className="bg-indigo-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {college?.primary_stream || "General"}
                  </span>
                  {college?.acpc_code && (
                    <span className="bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-700">
                      ACPC #{college.acpc_code}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Information Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {college?.college_type && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      {college.college_type}
                    </span>
                  )}
                  {college?.nirf_rank && (
                    <span className="bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>NIRF Rank #{college.nirf_rank}</span>
                    </span>
                  )}
                  {college?.naac_grade && (
                    <span className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                      NAAC Grade {college.naac_grade}
                    </span>
                  )}
                  {college?.established_year && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      Estd. {college.established_year}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {college?.name || "Institution Name"}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{college?.address || `${college?.city || "Gujarat"}, Gujarat, India`}</span>
                </p>

                {college?.university_affiliation && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>Affiliated with {college.university_affiliation}</span>
                  </p>
                )}

                {/* Quick Action Contact Links */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  {(data?.website || college?.website) && (
                    <a
                      href={(data?.website || college?.website).startsWith("http") ? (data?.website || college?.website) : `https://${data?.website || college?.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Official Website</span>
                    </a>
                  )}
                  {(data?.phone || college?.phone) && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{data?.phone || college?.phone}</span>
                    </span>
                  )}
                  <Link
                    to={`/compare?id1=${college?.id || 1}`}
                    className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Columns3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Compare Matrix</span>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedDotCard>
        </motion.div>
      </section>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 backdrop-blur-xl flex items-center justify-between gap-1 overflow-x-auto scrollbar-none shadow-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap text-center flex items-center justify-center gap-2 ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap text-center flex items-center justify-center gap-2 ${
              activeTab === "courses"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses & Fees ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("cutoffs")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap text-center flex items-center justify-center gap-2 ${
              activeTab === "cutoffs"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ACPC Cutoffs</span>
          </button>
          <button
            onClick={() => setActiveTab("placements")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap text-center flex items-center justify-center gap-2 ${
              activeTab === "placements"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Placements & LPA</span>
          </button>
          <button
            onClick={() => setActiveTab("amenities")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap text-center flex items-center justify-center gap-2 ${
              activeTab === "amenities"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Campus Hostels</span>
          </button>
        </div>
      </nav>

      {/* Tab Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <AnimatedDotCard className="p-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3">About the Institution</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                      {college?.description || `${college?.name || "This institution"} is a premier higher education center located in ${college?.city || "Gujarat"}. It offers accredited undergraduate and postgraduate programs under ${college?.university_affiliation || "GTU / State Board"}.`}
                    </p>
                  </AnimatedDotCard>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Starting Fee</p>
                      <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                        {courses.length > 0 ? formatCurrency(courses[0].annual_fees || 85000, "/yr") : "₹85,000 /yr"}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Highest LPA</p>
                      <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                        {formatLPA(placements?.highest_package)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Placement</p>
                      <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                        {formatLPA(placements?.average_package)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hostels</p>
                      <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                        {facilities?.hostel ? "Available" : "No Hostel"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Quick Info Card */}
                <div className="space-y-6">
                  <AnimatedDotCard className="p-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">Admissions & Contact</h3>
                    <ul className="space-y-3 text-xs sm:text-sm">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400 w-24 shrink-0">Process:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{admissions?.admission_process || "ACPC Online Merit Allocation"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400 w-24 shrink-0">Exams:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{admissions?.entrance_exams || "GUJCET / JEE Main / NEET"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400 w-24 shrink-0">Affiliation:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{college?.university_affiliation || "GTU"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400 w-24 shrink-0">Ownership:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{college?.ownership || "Government / Grant-in-Aid"}</span>
                      </li>
                    </ul>
                  </AnimatedDotCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: COURSES & FEES */}
          {activeTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Accredited Academic Courses ({courses.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course: any, idx: number) => (
                  <div
                    key={course?.id || idx}
                    className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                          {course?.degree_type || "Degree"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Duration: {course?.duration || "4 Years"}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{course?.course_name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-normal">{course?.eligibility || "Class 12 in relevant stream with 45% minimum."}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Annual Tuition Fee</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {formatCurrency(course?.annual_fees || 85000, "/ yr")}
                        </span>
                      </div>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        Intake: {course?.total_seats || 60} Seats
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: ACPC MERIT CUTOFFS */}
          {activeTab === "cutoffs" && (
            <motion.div
              key="cutoffs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">ACPC Merit Rank Cutoffs</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Filter category-wise Opening & Closing merit ranks by Academic Year.</p>
                </div>

                {/* Academic Year Selection Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedYear === y
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {y} {y === 2026 ? "(Current)" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white font-bold"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Refined Pending Cutoff Alert Banner */}
              {selectedYear === 2026 && currentYearObj?.is_pending ? (
                <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/80 dark:border-amber-500/30 rounded-2xl p-5 text-amber-900 dark:text-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">2026 ACPC Cutoff Ranks Pending Release</h4>
                      <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-1 max-w-2xl font-medium">
                        {currentYearObj?.status_message || "Official Round 1 & Round 2 merit ranks for 2026 admissions have not been declared yet by ACPC."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => setSelectedYear(2025)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all flex-1 md:flex-none text-center cursor-pointer"
                    >
                      View 2025 Cutoffs
                    </button>
                    <Link
                      to="/chat"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all flex-1 md:flex-none text-center cursor-pointer"
                    >
                      AI Rank Predictor →
                    </Link>
                  </div>
                </div>
              ) : (
                /* Cutoffs Data Table */
                <div className="overflow-x-auto bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                        <th className="p-4">Course Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Round</th>
                        <th className="p-4">Opening Merit Rank</th>
                        <th className="p-4">Closing Merit Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                      {currentYearObj?.cutoffs
                        ?.filter((c: any) => selectedCategory === "All" || c.category === selectedCategory)
                        .map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{item.course_name}</td>
                            <td className="p-4">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-2 py-0.5 rounded-md text-xs border border-slate-200 dark:border-slate-700">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{item.round_number}</td>
                            <td className="p-4 font-extrabold text-indigo-600 dark:text-indigo-400">{item.opening_rank?.toLocaleString()}</td>
                            <td className="p-4 font-extrabold text-blue-600 dark:text-blue-400">{item.closing_rank?.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: PLACEMENTS */}
          {activeTab === "placements" && (
            <motion.div
              key="placements"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatedDotCard className="p-6 text-center">
                  <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Highest Campus LPA</h4>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{formatLPA(placements?.highest_package)}</p>
                </AnimatedDotCard>
                <AnimatedDotCard className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Average Package</h4>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{formatLPA(placements?.average_package)}</p>
                </AnimatedDotCard>
                <AnimatedDotCard className="p-6 text-center">
                  <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Placement Success Rate</h4>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{placements?.placement_percentage || 85}%</p>
                </AnimatedDotCard>
              </div>

              <AnimatedDotCard className="p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Top Corporate Recruiters</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {placements?.top_recruiters || "TCS, Infosys, Wipro, Adani Enterprises, Reliance Industries, L&T Technology Services, Zydus Lifesciences, Torrent Power, HDFC Bank"}
                </p>
              </AnimatedDotCard>
            </motion.div>
          )}

          {/* TAB 5: AMENITIES & HOSTELS */}
          {activeTab === "amenities" && (
            <motion.div
              key="amenities"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <AnimatedDotCard className="p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Campus Facilities & Hostels</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300">Hostels:</span>
                    {facilities?.hostel ? <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300">Library:</span>
                    {facilities?.library ? <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300">Wi-Fi:</span>
                    {facilities?.wifi ? <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300">Sports:</span>
                    {facilities?.sports ? <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
                  {facilities?.facility_details || "High-speed campus Wi-Fi, central digital library, AC hostels, multi-sports complex, cafeteria, and transport across major city routes."}
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
