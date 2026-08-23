import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Bot, Columns3 } from "lucide-react";

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "AI Chat", path: "/chat", icon: Bot },
    { label: "Compare", path: "/compare", icon: Columns3 },
  ];

  return (
    <div className="mobile-bottom-nav sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
export default MobileNav;
