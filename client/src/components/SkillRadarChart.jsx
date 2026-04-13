import React from "react";

const SkillRadarChart = ({ data, size = 300 }) => {
  if (!data || data.length === 0) return null;

  const padding = 60;
  const radius = (size - padding * 2) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const numPoints = data.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Calculate coordinates for a point given index and value (0-100)
  const getCoords = (index, value) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // ── Background Web (Polygons) ──────────────────────────────────────────────
  const webPolygons = [20, 40, 60, 80, 100].map((tick) => {
    return Array.from({ length: numPoints }).map((_, i) => {
      const { x, y } = getCoords(i, tick);
      return `${x},${y}`;
    }).join(" ");
  });

  // ── Main Data Shape ────────────────────────────────────────────────────────
  const dataPoints = data.map((d, i) => {
    const { x, y } = getCoords(i, d.score);
    return `${x},${y}`;
  }).join(" ");

  // ── Labels ─────────────────────────────────────────────────────────────────
  const labels = data.map((d, i) => {
    const { x, y } = getCoords(i, 115); // Place label slightly outside the 100% circle
    return { x, y, text: d.subject };
  });

  return (
    <div className="flex justify-center items-center py-4">
      <svg width={size} height={size} className="overflow-visible drop-shadow-xl">
        {/* Background Grids */}
        {webPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            className="fill-none stroke-surface-200"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {Array.from({ length: numPoints }).map((_, i) => {
          const { x, y } = getCoords(i, 100);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              className="stroke-surface-200"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Shape */}
        <polygon
          points={dataPoints}
          className="fill-brand-500/30 stroke-brand-500"
          strokeWidth="3"
        />
        
        {/* Data Points (Markers) */}
        {data.map((d, i) => {
          const { x, y } = getCoords(i, d.score);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              className="fill-white stroke-brand-600"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {labels.map((l, i) => {
          const textAnchor = l.x > centerX ? "start" : l.x < centerX ? "end" : "middle";
          return (
            <text
              key={i}
              x={l.x}
              y={l.y}
              dominantBaseline="middle"
              textAnchor={textAnchor}
              className="fill-txt-primary text-[11px] font-bold tracking-tight"
            >
              {l.text}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default SkillRadarChart;
