import React from "react";
import { Link, useLocation } from "react-router-dom";

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/", icon: "🏛️" },
    { label: "AI Chat", path: "/chat", icon: "🤖" },
    { label: "Compare", path: "/compare", icon: "⚖️" },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0b1326]/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
export default MobileNav;
