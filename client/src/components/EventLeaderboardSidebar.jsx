import React from "react";
import { Trophy, Zap, Clock, Wifi, WifiOff } from "lucide-react";
import LevelBadge from "./LevelBadge";
import { useAuth } from "../context/AuthContext";

const rankIcons = {
  1: { icon: "🥇", color: "text-amber-500 bg-amber-50 border-amber-200" },
  2: { icon: "🥈", color: "text-slate-400 bg-slate-50 border-slate-200" },
  3: { icon: "🥉", color: "text-orange-500 bg-orange-50 border-orange-200" },
};

/**
 * Live event leaderboard sidebar component.
 * Reuses the same styling/pattern as the global LeaderBoard page.
 */
const EventLeaderboardSidebar = ({
  leaderboard = [],
  connected = false,
  activeParticipants = 0,
  compact = false,
}) => {
  const { user } = useAuth();

  return (
    <div className="premium-card !p-0 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Leaderboard
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                <Wifi size={10} />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                <WifiOff size={10} />
                Offline
              </span>
            )}
          </div>
        </div>
        {activeParticipants > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            👥 {activeParticipants} active now
          </p>
        )}
      </div>

      {/* Leaderboard list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No scores yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Be the first to answer!
            </p>
          </div>
        ) : (
          leaderboard.map((entry) => {
            const isMe =
              String(entry.userId) === String(user?._id || "");
            const rankStyle = rankIcons[entry.rank];

            return (
              <div
                key={entry.userId || entry.rank}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                  ${isMe
                    ? "bg-brand-50 border border-brand-200 shadow-sm"
                    : "hover:bg-slate-50"
                  }
                  ${compact ? "py-2" : ""}`}
              >
                {/* Rank */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 border shadow-sm
                    ${rankStyle
                      ? rankStyle.color
                      : "bg-white text-slate-400 border-slate-100"
                    }`}
                >
                  {rankStyle ? rankStyle.icon : `#${entry.rank}`}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-sm">
                  {entry.userInitial || entry.userName?.[0]?.toUpperCase() || "?"}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${
                      isMe ? "text-brand-600" : "text-slate-900"
                    }`}
                  >
                    {entry.userName}
                    {isMe && (
                      <span className="text-[9px] bg-brand-200 text-brand-700 px-1.5 py-0.5 rounded ml-1">
                        YOU
                      </span>
                    )}
                  </p>
                  {!compact && (
                    <p className="text-[10px] text-slate-400">
                      {entry.correctAnswers}/{entry.questionsAnswered} correct
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-slate-900">
                    {entry.totalScore}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                    pts
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventLeaderboardSidebar;
