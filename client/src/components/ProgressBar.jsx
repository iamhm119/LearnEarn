import React from "react";

const ProgressBar = ({ percentage = 0, color = "brand", label, showLabel = true, size = "md" }) => {
  const clamp = Math.min(Math.max(percentage, 0), 100);

  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  const colors = {
    brand:   "from-brand-500 to-brand-400",
    emerald: "from-success-500 to-emerald-400",
    amber:   "from-warning-500 to-amber-400",
    purple:  "from-purple-500 to-violet-400",
    red:     "from-danger-500 to-rose-400",
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-txt-secondary font-medium">{label}</span>}
          <span className="text-xs font-semibold text-txt-tertiary ml-auto">{clamp}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-surface-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamp}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
