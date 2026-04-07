import React from "react";

const levelConfig = {
  Beginner:     { color: "badge-green",  icon: "🌱" },
  Intermediate: { color: "badge-blue",   icon: "⚡" },
  Advanced:     { color: "badge-purple", icon: "🔥" },
};

const LevelBadge = ({ level = "Beginner", showIcon = true }) => {
  const config = levelConfig[level] || levelConfig.Beginner;
  return (
    <span className={`badge ${config.color}`}>
      {showIcon && <span>{config.icon}</span>}
      {level}
    </span>
  );
};

export default LevelBadge;
