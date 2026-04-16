import React from "react";

const colors = {
  brand:   "from-brand-500 to-brand-600",
  amber:   "from-amber-400 to-warning-500",
  emerald: "from-emerald-400 to-success-600",
  red:     "from-red-400 to-danger-600",
  purple:  "from-purple-400 to-purple-600",
};

const trackColors = {
  brand:   "bg-brand-100/60",
  amber:   "bg-amber-100/60",
  emerald: "bg-emerald-100/60",
  red:     "bg-red-100/60",
  purple:  "bg-purple-100/60",
};

const ProgressBar = ({
  percentage = 0,
  color = "brand",
  label = "",
  showLabel = true,
  size = "md",
}) => {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-txt-secondary font-semibold">{label}</span>
          <span className="text-[11px] text-txt-primary font-bold">{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full ${trackColors[color] || trackColors.brand} rounded-full overflow-hidden ${heights[size]}`}
      >
        <div
          className={`${heights[size]} bg-gradient-to-r ${colors[color] || colors.brand} rounded-full transition-all duration-700 ease-out relative`}
          style={{ width: `${Math.max(percentage, 0)}%` }}
        >
          {/* Shimmer effect on active bars */}
          {percentage > 0 && percentage < 100 && (
            <div className="absolute inset-0 animate-shimmer rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
