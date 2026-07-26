import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, GraduationCap, Award, Eye, GitCompare } from "lucide-react";
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
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
    >
      {/* Stream-Aware Dynamic Campus Image Banner */}
      <div className="relative h-44 overflow-hidden bg-slate-900">
        <img
          src={img.banner}
          alt={college.name}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-slate-700 shadow-xs flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-teal-400" />
            {college.primary_stream || "General"}
          </span>
          {college.nirf_rank && (
            <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              NIRF #{college.nirf_rank}
            </span>
          )}
        </div>

        <div className="absolute bottom-2.5 left-3.5 right-3.5">
          <span className="text-xs text-slate-200 font-medium flex items-center gap-1.5 drop-shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            {college.city || "Gujarat"}, Gujarat
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
            {college.name}
          </h3>

          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md text-[11px]">
              {college.college_type || "University"}
            </span>
            {college.ownership && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded-md text-[11px]">
                {college.ownership}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Link
            to={`/college/${college.id}`}
            className="flex-1 bg-slate-900 hover:bg-teal-700 text-white font-semibold py-2 px-3 rounded-xl text-center text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </Link>
          <Link
            to={`/compare?id1=${college.id}`}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold p-2 rounded-xl text-xs transition-all flex items-center justify-center"
            title="Compare College Matrix"
          >
            <GitCompare className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CollegeCard;
