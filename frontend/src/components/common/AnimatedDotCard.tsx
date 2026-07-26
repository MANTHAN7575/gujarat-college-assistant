import React from "react";

interface AnimatedDotCardProps {
  children: React.ReactNode;
  className?: string;
  topBorderAccent?: boolean;
}

export const AnimatedDotCard: React.FC<AnimatedDotCardProps> = ({
  children,
  className = "",
  topBorderAccent = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 ${
        topBorderAccent ? "border-t-2 border-t-blue-500/70" : ""
      } shadow-xl shadow-slate-200/60 dark:shadow-black/50 backdrop-blur-xl rounded-2xl transition-all duration-300 hover:border-blue-400/50 hover:shadow-blue-500/10 ${className}`}
    >
      {/* Blueprint Dot-Grid Sub-Layer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-70 dark:opacity-40 pointer-events-none -z-0"
        style={{
          backgroundImage: `radial-gradient(#2563eb 1.2px, transparent 1.2px)`,
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
        }}
      />

      {/* Top-Right Glowing Orb */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse -z-0" />

      {/* Bottom-Left Floating Light Beam */}
      <div
        className="absolute -bottom-16 -left-16 w-80 h-80 bg-gradient-to-tr from-indigo-500/20 via-blue-400/20 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse -z-0"
        style={{ animationDuration: "6s" }}
      />

      {/* Relative Content Wrapper */}
      <div className="relative z-10 flex flex-col h-full flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AnimatedDotCard;
