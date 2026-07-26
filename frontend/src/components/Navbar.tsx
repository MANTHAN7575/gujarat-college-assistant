import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/", icon: "🏛️" },
    { label: "AI Assistant", path: "/chat", icon: "🤖" },
    { label: "Compare", path: "/compare", icon: "⚖️" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-300/80 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Left: Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            🎓
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-base font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight leading-none">
              Gujarat Assistant
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider mt-1">
              ACPC & Institutional Intelligence
            </span>
          </div>
        </Link>

        {/* Right Section: Clean Navigation Links & Theme Switcher */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="h-5 w-px bg-slate-300/80 dark:bg-slate-800 mx-0.5 hidden sm:block"></div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-base hover:bg-white dark:hover:bg-slate-700 transition-all shrink-0 shadow-xs"
            aria-label="Toggle Theme"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
