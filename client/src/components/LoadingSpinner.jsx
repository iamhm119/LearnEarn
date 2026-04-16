import React from "react";
import { GraduationCap } from "lucide-react";

const LoadingSpinner = ({ size = "md" }) => {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-[3px]",
  };

  return (
    <div
      className={`${sizes[size]} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
    />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-surface-50 relative overflow-hidden">
    {/* Background mesh */}
    <div className="fixed inset-0 bg-mesh pointer-events-none" />

    <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
      {/* Animated logo */}
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-400 rounded-2xl flex items-center justify-center shadow-glow animate-scale-bounce">
          <GraduationCap size={32} className="text-white" />
        </div>
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-2xl border-2 border-brand-300/30 animate-ping" style={{ animationDuration: '2s' }} />
      </div>

      {/* Spinner */}
      <div className="w-10 h-10 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin mb-4" />

      {/* Text */}
      <p className="text-sm font-semibold text-txt-secondary animate-pulse">Loading your experience...</p>
    </div>
  </div>
);

export default LoadingSpinner;
