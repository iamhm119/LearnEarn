import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, BookOpen, CheckCircle2, Flame, ArrowRight, TrendingUp, Radio, Clock, Award } from "lucide-react";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import LevelBadge from "../components/LevelBadge";
import { PageLoader } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getAnalytics, getLearningPaths, getEvents } from "../services/api";
import toast from "react-hot-toast";
import VersatileInterestGraph from "../components/VersatileInterestGraph";

const StatCard = ({ icon, label, value, sub, color = "blue" }) => {
  const colors = {
    blue:    "bg-brand-50  text-brand-600",
    amber:   "bg-warning-50 text-warning-600",
    emerald: "bg-success-50 text-success-600",
    purple:  "bg-purple-50  text-purple-600",
    orange:  "bg-orange-50  text-orange-600",
  };
  return (
    <div className="stat-card animate-fade-in">
      <div className={`stat-icon ${colors[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-txt-primary tracking-tight">{value}</p>
        <p className="text-xs text-txt-secondary font-medium">{label}</p>
        {sub && <p className="text-[11px] text-txt-tertiary mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [paths, setPaths] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, pathsRes, eventsRes] = await Promise.all([getAnalytics(), getLearningPaths(), getEvents()]);
        setAnalytics(analyticsRes.data.analytics);
        setPaths(pathsRes.data.paths?.filter((p) => p.isEnrolled) || []);
        setUpcomingEvents(
          (eventsRes.data.events || [])
            .filter((e) => e.status === "live" || e.status === "upcoming")
            .slice(0, 3)
        );
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  const xpToNext = user?.level === "Advanced" ? 1000 : user?.level === "Intermediate" ? 500 : 200;
  const xpPct = Math.min(Math.round(((user?.xp || 0) / xpToNext) * 100), 100);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        {/* Hero greeting */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-txt-primary tracking-tight">
              Welcome back, <span className="text-brand-600">{user?.name?.split(" ")[0]}</span>
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LevelBadge level={user?.level || "Beginner"} />
            <span className="text-txt-tertiary text-sm">
              {xpToNext - (user?.xp || 0)} XP to {user?.level === "Beginner" ? "Intermediate" : user?.level === "Intermediate" ? "Advanced" : "Max Level"}
            </span>
          </div>
          <div className="mt-3 max-w-xs">
            <ProgressBar percentage={xpPct} color="amber" label={`${user?.xp || 0} / ${xpToNext} XP`} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <StatCard icon={<Zap size={20} />} label="XP Earned" value={analytics?.xp || 0} color="amber" />
          <StatCard icon="🪙" label="Coins" value={analytics?.coins || 0} color="amber" />
          <StatCard icon={<Flame size={20} />} label="Day Streak" value={`${analytics?.streak || 0}🔥`} color="orange" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Modules Done" value={analytics?.totalModulesCompleted || 0} color="emerald" />
          <StatCard icon={<Award size={20} />} label="Certificates" value={analytics?.certificates?.length || 0} color="purple" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Enrolled Learning Paths */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">My Learning Paths</h2>
              <Link to="/learning-paths" className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1 transition-colors">
                Browse all <ArrowRight size={14} />
              </Link>
            </div>

            {paths.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={24} className="text-txt-tertiary" />
                </div>
                <p className="text-txt-secondary font-medium mb-1">No paths enrolled yet</p>
                <p className="text-txt-tertiary text-sm mb-4">Start your learning journey today</p>
                <Link to="/learning-paths" className="btn-primary inline-flex items-center gap-2 text-sm">
                  Explore Paths <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {paths.map((path) => (
                  <div key={path._id} className="card-glow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-txt-primary">{path.title}</p>
                        <p className="text-sm text-txt-tertiary">{path.totalCourses} courses · {path.totalModules} modules</p>
                      </div>
                      <span className={`badge ${path.difficulty === "advanced" ? "badge-purple" : path.difficulty === "intermediate" ? "badge-blue" : "badge-green"}`}>
                        {path.difficulty}
                      </span>
                    </div>
                    <ProgressBar percentage={0} color="brand" label="Progress" />
                    <div className="flex gap-3 mt-4">
                      <Link to={`/learning-paths/${path._id}`} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                        Continue <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats sidebar */}
          <div className="space-y-4">
            <h2 className="section-title">Quick Stats</h2>
            <div className="card space-y-1">
              {[
                { label: "Paths Enrolled", value: analytics?.totalEnrolledPaths || 0, icon: "📚" },
                { label: "Courses Completed", value: analytics?.totalCoursesCompleted || 0, icon: "🎓" },
                { label: "Quizzes Taken", value: analytics?.totalQuizzesAttempted || 0, icon: "📝" },
                { label: "Avg. Score", value: `${analytics?.avgScore || 0}%`, icon: "📊" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-surface-100 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm text-txt-secondary">{item.label}</span>
                  </div>
                  <span className="font-semibold text-txt-primary">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Skill & Interest Breakdown */}
            <div className="card text-center overflow-hidden relative">
              <p className="section-title text-xs mb-1 flex items-center gap-2 justify-center">
                <TrendingUp size={14} className="text-brand-500" /> Versatile Skill Graph
              </p>
              {analytics?.skillBreakdown?.length > 0 ? (
                <VersatileInterestGraph data={analytics.skillBreakdown} size={280} />
              ) : (
                <div className="py-12 px-6">
                  <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp size={20} className="text-brand-600" />
                  </div>
                  <p className="text-xs text-txt-tertiary">Progress through courses to reveal your unique interest and mastery profile.</p>
                </div>
              )}
            </div>

            {/* Recent scores */}
            {analytics?.recentScores?.length > 0 && (
              <div className="card">
                <p className="section-title text-xs mb-3 flex items-center gap-2">
                  <TrendingUp size={14} className="text-brand-500" /> Recent Scores
                </p>
                <div className="space-y-2.5">
                  {analytics.recentScores.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-txt-tertiary font-medium">Quiz #{i + 1}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <ProgressBar
                            percentage={s.percentage}
                            color={s.percentage >= 80 ? "emerald" : s.percentage >= 50 ? "amber" : "red"}
                            showLabel={false}
                            size="sm"
                          />
                        </div>
                        <span className={`text-xs font-semibold ${s.percentage >= 50 ? "text-success-600" : "text-danger-600"}`}>
                          {s.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Live Events */}
            {upcomingEvents.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-title text-xs mb-0 flex items-center gap-2">
                    <Radio size={14} className="text-danger-500" /> Live Events
                  </p>
                  <Link to="/events" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-50 transition-colors border border-surface-100"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        event.status === "live"
                          ? "bg-danger-50 text-danger-600"
                          : "bg-warning-50 text-warning-600"
                      }`}>
                        {event.status === "live" ? <Radio size={15} /> : <Clock size={15} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-txt-primary truncate">{event.title}</p>
                        <p className="text-[11px] text-txt-tertiary">{event.company}</p>
                      </div>
                      {event.status === "live" && (
                        <span className="text-[10px] font-semibold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full border border-danger-100 animate-pulse">
                          LIVE
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;