import React, { useState, useEffect } from "react";
import { College } from "../types";
import { getAllColleges, searchColleges } from "../services/api";
import { Navbar } from "../components/Navbar";
import { CollegeCard } from "../components/CollegeCard";
import { Chatbot } from "../components/Chatbot";

export const Home: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllColleges();
      setColleges(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server. Please ensure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      fetchColleges();
      return;
    }

    try {
      const results = await searchColleges(term);
      setColleges(results);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            🚀 Gujarat Higher Education Intelligence Engine
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Discover Top Colleges in Gujarat
          </h1>
          <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light">
            Compare degree programs, tuition fees, NIRF rankings, hostel amenities, and placement packages across Gujarat's premier institutions.
          </p>

          {/* Search Input Box */}
          <div className="mt-8 max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search by college name, city (e.g. Gandhinagar), or type (Private/Government)..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-white text-gray-900 placeholder-gray-400 text-base md:text-lg px-6 py-4 rounded-2xl shadow-2xl outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            />
            <span className="absolute right-5 top-4 text-xl">🔍</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Gujarat Universities & Institutes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Verified details directly from database records
            </p>
          </div>
          <span className="bg-blue-100 text-blue-800 font-bold px-3.5 py-1.5 rounded-xl text-sm">
            {colleges.length} Institutions
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl mb-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={fetchColleges}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-4 py-2 rounded-xl"
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
                className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-64 flex flex-col justify-between"
              >
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <span className="text-5xl">🏛️</span>
            <h3 className="text-xl font-bold text-gray-800 mt-4">No Colleges Found</h3>
            <p className="text-gray-500 text-sm mt-1">
              Try searching with a different keyword like "PDEU", "Nirma", or "Ahmedabad".
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        )}
      </main>

      <Chatbot />
    </div>
  );
};
export default Home;
