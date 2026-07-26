import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CollegeDetailResponse } from "../types";
import { getCollegeDetails } from "../services/api";
import { Navbar } from "../components/Navbar";
import { Chatbot } from "../components/Chatbot";

export const CollegeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CollegeDetailResponse | null>(null);
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
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-semibold text-sm">Fetching detailed institutional records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto p-12 text-center my-auto">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">College Record Not Found</h2>
          <p className="text-gray-600 mt-2">{error || "Invalid institutional ID."}</p>
          <Link
            to="/"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
          >
            ← Back to All Colleges
          </Link>
        </div>
      </div>
    );
  }

  const { college, description, website, email, phone, address, established_year, affiliation, courses, placements, facilities, admissions } = data;

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* College Hero Header */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white py-14 px-6 shadow-md">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="text-blue-200 hover:text-white text-sm font-semibold mb-4 inline-block">
            ← Back to Institutional Index
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {college.college_type || "University"}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight">
                {college.name}
              </h1>
              <p className="mt-2 text-lg text-blue-100 flex items-center gap-2 font-medium">
                📍 {address || `${college.city || "Gujarat"}, Gujarat`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {college.nirf_rank && (
                <div className="bg-amber-500/20 border border-amber-400/30 text-amber-200 px-4 py-2 rounded-2xl text-sm font-bold">
                  🏆 NIRF Rank #{college.nirf_rank}
                </div>
              )}
              {established_year && (
                <div className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-2xl text-sm font-medium">
                  🏛️ Est. {established_year}
                </div>
              )}
            </div>
          </div>

          {/* Contact Badges */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-xs text-blue-200">
            {website && (
              <a href={website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-semibold text-white">
                🌐 {website}
              </a>
            )}
            {email && <span>📧 {email}</span>}
            {phone && <span>📞 {phone}</span>}
            {affiliation && <span>📜 Affiliation: {affiliation}</span>}
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-8">
        {/* Description */}
        {description && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About Institutional Campus</h2>
            <p className="text-gray-700 leading-relaxed text-base">{description}</p>
          </div>
        )}

        {/* Courses Offered */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Courses & Programs Offered</h2>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {courses.length} Programs
            </span>
          </div>

          {courses.length === 0 ? (
            <p className="text-gray-500 text-sm">Course data currently being updated.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-md">
                      {course.degree_type || "Degree"}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{course.course_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Duration: {course.duration || "N/A"}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-end text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block">Annual Fees</span>
                      <span className="font-extrabold text-blue-700 text-base">
                        {formatCurrency(course.annual_fees)}
                      </span>
                    </div>
                    {course.total_seats && (
                      <span className="text-xs text-gray-600 font-medium">
                        Seats: {course.total_seats}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placements */}
        {placements && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Career & Placement Metrics</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">
                  Average Package
                </span>
                <span className="text-2xl font-extrabold text-blue-900 mt-1 block">
                  {formatCurrency(placements.average_package)}
                </span>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">
                  Highest Package
                </span>
                <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">
                  {formatCurrency(placements.highest_package)}
                </span>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <span className="text-xs text-purple-600 font-bold uppercase tracking-wider block">
                  Placement Rate
                </span>
                <span className="text-2xl font-extrabold text-purple-900 mt-1 block">
                  {placements.placement_percentage ? `${placements.placement_percentage}%` : "N/A"}
                </span>
              </div>
            </div>

            {placements.top_recruiters && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                  Top Recruiting Organizations
                </h4>
                <p className="text-sm font-semibold text-gray-800">{placements.top_recruiters}</p>
              </div>
            )}
          </div>
        )}

        {/* Facilities */}
        {facilities && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Campus Infrastructure & Facilities</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Hostel", key: facilities.hostel, icon: "🏠" },
                { label: "Library", key: facilities.library, icon: "📚" },
                { label: "WiFi Campus", key: facilities.wifi, icon: "📶" },
                { label: "Sports Complex", key: facilities.sports, icon: "⚽" },
                { label: "Cafeteria", key: facilities.cafeteria, icon: "☕" },
                { label: "Gymnasium", key: facilities.gym, icon: "🏋️" },
                { label: "Transport", key: facilities.transport, icon: "🚌" },
                { label: "Medical Center", key: facilities.medical, icon: "🏥" },
              ].map((fac, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border text-center font-semibold text-sm flex items-center justify-center gap-2 ${
                    fac.key
                      ? "bg-blue-50/60 border-blue-200 text-blue-900"
                      : "bg-gray-50 border-gray-100 text-gray-400 opacity-60"
                  }`}
                >
                  <span>{fac.icon}</span>
                  <span>{fac.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admissions */}
        {admissions && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admissions & Eligibility Criteria</h2>
            {admissions.admission_process && (
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">{admissions.admission_process}</p>
            )}

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              {admissions.entrance_exams && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-gray-500 block mb-1">ACCEPTED ENTRANCE EXAMS</span>
                  <span className="font-bold text-gray-800 text-sm">{admissions.entrance_exams}</span>
                </div>
              )}
              {admissions.cutoff_details && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-gray-500 block mb-1">CUTOFF OVERVIEW</span>
                  <span className="font-bold text-gray-800 text-sm">{admissions.cutoff_details}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Chatbot />
    </div>
  );
};
export default CollegeDetails;
