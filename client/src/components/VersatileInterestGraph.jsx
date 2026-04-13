import React, { useMemo } from "react";
const categoryColors = {
  Programming: { main: "#6366F1", light: "#EEF2FF" },
  Design: { main: "#EC4899", light: "#FDF2F8" },
  Business: { main: "#F59E0B", light: "#FFFBEB" },
  Science: { main: "#10B981", light: "#ECFDF5" },
  Other: { main: "#6B7280", light: "#F9FAFB" },
};

const getStyle = (cat) => categoryColors[cat] || categoryColors.Other;

const VersatileInterestGraph = ({ data, size = 350 }) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const coreRadius = 45;

  // Calculate bubble positions in a circle around the core
  const bubbles = useMemo(() => {
    if (!data) return [];
    return data.map((item, i) => {
      const angle = (i * (2 * Math.PI)) / data.length - Math.PI / 2;
      // Let's use a dynamic distance based on mastery (further out = more advanced)
      const orbitDistance = 100 + (item.mastery / 100) * 20;

      return {
        ...item,
        x: centerX + orbitDistance * Math.cos(angle),
        y: centerY + orbitDistance * Math.sin(angle),
        radius: 30 + (item.interest / 100) * 25, // Size = Interest
        color: getStyle(item.subject),
      };
    });
  }, [data, centerX, centerY]);

  if (!data || data.length === 0) return null;

  return (
    <div className="flex justify-center items-center py-8 select-none">
      <svg width={size} height={size} className="overflow-visible drop-shadow-2xl">
        <defs>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#312E81" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit Rings */}
        <circle cx={centerX} cy={centerY} r="100" className="fill-none stroke-surface-100" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={centerX} cy={centerY} r="130" className="fill-none stroke-surface-50" strokeWidth="1" strokeDasharray="8 8" />

        {/* Subject Bubbles */}
        {bubbles.map((b, i) => (
          <g key={i} className="cursor-pointer group">
            {/* Connection Line to Core */}
            <line
              x1={centerX}
              y1={centerY}
              x2={b.x}
              y2={b.y}
              className="stroke-surface-200 group-hover:stroke-brand-200 transition-colors"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            
            {/* Floating shadow/glow */}
            <circle
              cx={b.x}
              cy={b.y}
              r={b.radius + 5}
              fill={b.color.light}
              className="opacity-40"
            />

            {/* Main Bubble */}
            <circle
              cx={b.x}
              cy={b.y}
              r={b.radius}
              fill="white"
              stroke={b.color.main}
              strokeWidth="2"
              className="transition-all duration-500 group-hover:scale-110"
            />

            {/* Mastery Progress Ring */}
            <circle
              cx={b.x}
              cy={b.y}
              r={b.radius - 4}
              fill="none"
              stroke={b.color.main}
              strokeWidth="4"
              strokeDasharray={`${(b.mastery / 100) * (2 * Math.PI * (b.radius - 4))} 1000`}
              strokeLinecap="round"
              transform={`rotate(-90 ${b.x} ${b.y})`}
              className="opacity-80"
            />

            {/* Label inside bubble */}
            <text
              x={b.x}
              y={b.y}
              textAnchor="middle"
              className="fill-txt-primary font-black text-[9px] pointer-events-none"
            >
              {b.subject.substring(0, 10)}
            </text>
            <text
              x={b.x}
              y={b.y + 12}
              textAnchor="middle"
              className="fill-txt-tertiary font-bold text-[8px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {b.mastery}% Mastery
            </text>

            {/* Floating Tooltip-like Text */}
            <text
              x={b.x}
              y={b.y - b.radius - 8}
              textAnchor="middle"
              className="fill-brand-600 font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest"
            >
              Interests: {Math.round(b.interest)}%
            </text>
          </g>
        ))}

        {/* Center Core */}
        <g className="filter-glow">
          <circle
            cx={centerX}
            cy={centerY}
            r={coreRadius}
            fill="url(#coreGradient)"
            className="shadow-xl"
          />
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="fill-white font-black text-[10px] uppercase tracking-tighter"
          >
            Skill
          </text>
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="fill-brand-100 font-black text-[12px] uppercase tracking-widest"
          >
            Core
          </text>
        </g>
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4">
         <div className="flex items-center gap-1.5 no-wrap">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            <span className="text-[10px] font-bold text-txt-tertiary uppercase">Size = Interest</span>
         </div>
         <div className="flex items-center gap-1.5 no-wrap">
            <span className="w-2 h-2 rounded-full border border-brand-500"></span>
            <span className="text-[10px] font-bold text-txt-tertiary uppercase">Ring = Mastery</span>
         </div>
      </div>
    </div>
  );
};

export default VersatileInterestGraph;
