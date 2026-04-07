import React from "react";

const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizes = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-[3px] border-surface-200 border-t-brand-600 rounded-full animate-spin`} />
      {text && <p className="text-txt-secondary text-sm font-medium">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-surface-50 flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

export default LoadingSpinner;
