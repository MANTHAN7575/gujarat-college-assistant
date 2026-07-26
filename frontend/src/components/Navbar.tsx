import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Bot, Columns3, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { label: "Home Directory", path: "/", icon: Home },
    { label: "AI Advisor", path: "/chat", icon: Bot },
    { label: "Compare Matrix", path: "/compare", icon: Columns3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Left: Custom SVG Emblem & Institutional Brand Title */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shadow-inner group-hover:border-teal-500/50 transition-all duration-200">
            {/* Bespoke Geometric State Crest & Open Book Shield Vector Emblem */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-teal-400 group-hover:scale-105 transition-transform"
            >
              {/* Shield Outline */}
              <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="#0F172A" />
              {/* Architectural Pillars / Book Wings */}
              <path d="M12 7v8" stroke="#0D9488" strokeWidth="2" />
              <path d="M8 9h8" stroke="#0D9488" strokeWidth="1.5" />
              <path d="M7 13h10" stroke="#0D9488" strokeWidth="1.5" />
              <circle cx="12" cy="5" r="1" fill="#0D9488" />
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-base font-bold text-white tracking-tight leading-none">
              Gujarat ACPC Directory
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mt-1">
              State Higher Education Portal
            </span>
          </div>
        </Link>

        {/* Right Section: Lucide Navigation Links & Theme Switcher */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="h-5 w-px bg-slate-800 mx-0.5 hidden sm:block"></div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-700 transition-all shrink-0 shadow-xs"
            aria-label="Toggle Theme"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
