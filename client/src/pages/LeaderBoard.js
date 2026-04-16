import React, { useEffect, useState } from "react";
import { Crown, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LevelBadge from "../components/LevelBadge";
import { PageLoader } from "../components/LoadingSpinner";
import { getLeaderboard } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const rankIcons = {
  1: { icon: "🥇", color: "text-warning-600 bg-warning-50 border-warning-200" },
  2: { icon: "🥈", color: "text-surface-600 bg-surface-100 border-surface-300" },
  3: { icon: "🥉", color: "text-orange-600 bg-orange-50 border-orange-200" },
};

const LeaderboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ leaderboard: [], userRank: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard();
        setData(res.data);
      } catch {
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <PageLoader />;

  const { leaderboard, userRank } = data;
  const isInTop10 = leaderboard.some((u) => String(u._id) === String(user?._id || ""));

  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 dot-grid opacity-[0.02] pointer-events-none" />

      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 -ml-4">
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        <div className="text-center mb-12 animate-fade-in-up">
          <div className="relative inline-block mb-5">
            <div className="w-18 h-18 bg-gradient-to-br from-warning-400 to-warning-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-warning-500/25 animate-float">
              <Crown size={36} className="text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-txt-primary mb-2 tracking-tight">
            The <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-txt-secondary text-sm font-medium">Recognizing the most dedicated learners in our community</p>
        </div>

        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12 px-2">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
              const heights = ["h-28", "h-36", "h-24"];
              const rankDisplay = [2, 1, 3];
              const podColors = [
                "bg-surface-100/80 border-surface-200",
                "bg-gradient-to-t from-warning-50 to-warning-100/80 border-warning-200",
                "bg-orange-50/80 border-orange-200"
              ];
              const tColors = [
                "text-surface-600",
                "text-warning-600",
                "text-orange-600"
              ];
              const avatarGradients = [
                "from-surface-400 to-surface-500",
                "from-warning-400 to-warning-600",
                "from-orange-400 to-orange-500"
              ];
              return (
                <div key={entry._id} className="flex flex-col items-center flex-1 animate-fade-in-up" style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}>
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradients[i]} p-0.5 mb-2 group hover:scale-110 transition-all duration-300 shadow-md ${i === 1 ? 'ring-2 ring-warning-300' : ''}`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-base text-txt-primary">
                      {entry.name?.[0]?.toUpperCase()}
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-txt-primary mb-0.5 text-center truncate w-full px-1">{entry.name}</p>
                  <p className="text-[11px] font-bold text-brand-600 mb-3">{entry.xp} XP</p>
                  <div className={`${heights[i]} w-full rounded-t-2xl ${podColors[i]} border-t border-x flex flex-col items-center justify-start pt-3 backdrop-blur-sm`}>
                    <span className="text-2xl mb-1">{rankIcons[rankDisplay[i]].icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${tColors[i]}`}>{rankDisplay[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="card space-y-1 mb-8 animate-fade-in p-2">
          {leaderboard.map((entry, idx) => {
            const isMe = String(entry._id) === String(user?._id || "");
            const rankStyle = rankIcons[entry.rank];
            return (
              <div
                key={entry._id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 animate-fade-in-up
                  ${isMe ? "bg-brand-50/80 border border-brand-100 shadow-sm" : "hover:bg-surface-50/80 border border-transparent"}`}
                style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 border
                  ${rankStyle ? rankStyle.color : "bg-surface-50 text-txt-secondary border-surface-200"}`}>
                  {rankStyle ? rankStyle.icon : entry.rank}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center font-bold text-[13px] text-white flex-shrink-0 shadow-sm">
                  {entry.name?.slice(0, 2).toUpperCase()}
                </div>

                {/* Name & level */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-bold truncate ${isMe ? "text-brand-700" : "text-txt-primary"}`}>
                      {entry.name} {isMe && <span className="text-[9px] bg-brand-200 text-brand-800 px-1.5 py-0.5 rounded ml-1 uppercase font-extrabold">You</span>}
                    </p>
                  </div>
                  <LevelBadge level={entry.level || "Beginner"} showIcon={false} />
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 text-sm">
                  <div className="text-right">
                    <p className="text-txt-primary font-bold">{entry.xp.toLocaleString()}</p>
                    <p className="text-[10px] text-txt-tertiary font-medium uppercase tracking-wider">XP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-txt-primary font-bold">{entry.coins}</p>
                    <p className="text-[10px] text-txt-tertiary font-medium uppercase tracking-wider">Coins</p>
                  </div>
                  <div className="text-right">
                    <p className="text-txt-primary font-bold">{entry.streak}🔥</p>
                    <p className="text-[10px] text-txt-tertiary font-medium uppercase tracking-wider">Streak</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* User rank if not in top 10 */}
        {!isInTop10 && userRank && (
          <div className="card bg-surface-50/80 border-surface-200 animate-slide-up backdrop-blur-sm">
            <p className="text-[11px] font-bold text-txt-secondary mb-3 uppercase tracking-wider">Your Rank</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] text-txt-tertiary leading-none">#</span>
                <span className="text-sm font-extrabold text-txt-primary leading-none">{userRank.rank}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center font-bold text-[13px] text-white shadow-sm">
                {userRank.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-txt-primary mb-0.5">{userRank.name}</p>
                <LevelBadge level={userRank.level || "Beginner"} showIcon={false} />
              </div>
              <div className="flex gap-5 text-right">
                <div>
                   <p className="text-txt-primary font-bold text-sm">{userRank.xp.toLocaleString()}</p>
                   <p className="text-[10px] text-txt-tertiary font-medium uppercase tracking-wider">XP</p>
                </div>
                <div>
                  <p className="text-txt-primary font-bold text-sm">{userRank.coins}</p>
                  <p className="text-[10px] text-txt-tertiary font-medium uppercase tracking-wider">Coins</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
