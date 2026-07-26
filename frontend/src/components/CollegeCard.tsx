import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { College } from "../types";
import { getCollegeImage, handleImageError } from "../utils/collegeImages";

interface CollegeCardProps {
  college: College;
  index?: number;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college, index = 0 }) => {
  const img = getCollegeImage(college, index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-white/90 dark:bg-slate-900/80 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/80 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
    >
      {/* High-Res Authentic Campus Image Banner */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <img
          src={img.banner}
          alt={college.name}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
            {college.primary_stream || "General"}
          </span>
          {college.nirf_rank && (
            <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              🏆 NIRF #{college.nirf_rank}
            </span>
          )}
        </div>

        <div className="absolute bottom-2.5 left-3.5 right-3.5">
          <span className="text-xs text-blue-100 font-medium flex items-center gap-1 drop-shadow-xs">
            📍 {college.city || "Gujarat"}, Gujarat
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
            {college.name}
          </h3>

          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded-md">
              {college.college_type || "University"}
            </span>
            {college.ownership && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded-md">
                {college.ownership}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Link
            to={`/college/${college.id}`}
            className="flex-1 bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-xl text-center text-xs transition-all shadow-xs"
          >
            View Profile →
          </Link>
          <Link
            to={`/compare?id1=${college.id}`}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-2 rounded-xl text-xs transition-all"
            title="Compare College"
          >
            ⚖️
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CollegeCard;
