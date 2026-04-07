import React, { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * Countdown timer for live events.
 * Syncs with server time via Socket.IO timerData.
 */
const EventTimer = ({ endTime, timerData, onTimeUp }) => {
  const [remaining, setRemaining] = useState(null);
  const intervalRef = useRef(null);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    // Calculate remaining from endTime or timerData
    const calcRemaining = () => {
      let end;
      if (timerData?.endTime) {
        end = timerData.endTime;
      } else if (endTime) {
        end = new Date(endTime).getTime();
      }

      if (!end) return null;
      return Math.max(0, Math.floor((end - Date.now()) / 1000));
    };

    const initial = calcRemaining();
    setRemaining(initial);

    intervalRef.current = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);

      if (r <= 0 && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        clearInterval(intervalRef.current);
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [endTime, timerData, onTimeUp]);

  if (remaining === null) return null;

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const isUrgent = remaining <= 60;
  const isWarning = remaining <= 300 && remaining > 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-mono transition-all duration-500
        ${
          isUrgent
            ? "bg-red-50 border-2 border-red-300 animate-pulse-soft"
            : isWarning
            ? "bg-amber-50 border border-amber-200"
            : "bg-white border border-slate-200"
        }`}
    >
      {isUrgent ? (
        <AlertTriangle size={18} className="text-red-500 animate-pulse" />
      ) : (
        <Clock
          size={18}
          className={isWarning ? "text-amber-500" : "text-brand-500"}
        />
      )}

      <div className="flex items-center gap-1">
        {hours > 0 && (
          <>
            <span
              className={`text-2xl font-black ${
                isUrgent
                  ? "text-red-600"
                  : isWarning
                  ? "text-amber-700"
                  : "text-slate-900"
              }`}
            >
              {pad(hours)}
            </span>
            <span className="text-slate-400 text-lg font-bold">:</span>
          </>
        )}
        <span
          className={`text-2xl font-black ${
            isUrgent
              ? "text-red-600"
              : isWarning
              ? "text-amber-700"
              : "text-slate-900"
          }`}
        >
          {pad(minutes)}
        </span>
        <span className="text-slate-400 text-lg font-bold">:</span>
        <span
          className={`text-2xl font-black ${
            isUrgent
              ? "text-red-600"
              : isWarning
              ? "text-amber-700"
              : "text-slate-900"
          }`}
        >
          {pad(seconds)}
        </span>
      </div>

      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          isUrgent
            ? "text-red-500"
            : isWarning
            ? "text-amber-600"
            : "text-slate-400"
        }`}
      >
        {isUrgent
          ? "Hurry!"
          : isWarning
          ? "Ending soon"
          : "Remaining"}
      </span>
    </div>
  );
};

export default EventTimer;
