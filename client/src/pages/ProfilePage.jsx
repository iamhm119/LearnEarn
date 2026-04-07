import React, { useEffect, useState } from "react";
import { User, Trophy, CheckCircle2, Download, TrendingUp, Mail, Radio, Wand2, Crown } from "lucide-react";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import LevelBadge from "../components/LevelBadge";
import { PageLoader } from "../components/LoadingSpinner";
import { getAnalytics, getUserEventHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

// Avatar helpers (mirrored here to avoid circular import)
const getAvatarStyle = (avatarId) => {
  if (avatarId === 'avatar-ninja') return { border: '3px solid #6366F1', boxShadow: '0 0 0 5px rgba(99,102,241,0.18)' };
  if (avatarId === 'avatar-king')  return { border: '3px solid #EAB308', boxShadow: '0 0 0 5px rgba(234,179,8,0.22)' };
  return {};
};

const getAvatarEmoji = (avatarId) => {
  if (avatarId === 'avatar-ninja') return '🥷';
  if (avatarId === 'avatar-king')  return '👑';
  return null;
};

const THEME_LABELS = {
  'theme-dark': 'Dark Mode',
  'theme-neon': 'Neon Cyber',
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, eventsRes] = await Promise.all([
          getAnalytics(),
          getUserEventHistory().catch(() => ({ data: { events: [] } })),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setEventHistory(eventsRes.data.events || []);
      } catch {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleDownloadCert = (cert) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate — ${cert.courseId?.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
          body { font-family: Inter, sans-serif; background: #fff; margin: 0; padding: 40px; }
          .cert { max-width: 800px; margin: 0 auto; border: 3px solid #4F46E5; border-radius: 16px; padding: 60px; text-align: center; background: linear-gradient(135deg, #EEF2FF 0%, #ECFDF5 100%); }
          .logo { font-size: 28px; font-weight: 900; color: #4F46E5; margin-bottom: 8px; }
          .subtitle { color: #6B7280; font-size: 14px; margin-bottom: 40px; }
          .awarded { font-size: 14px; color: #6B7280; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px; }
          .name { font-size: 42px; font-weight: 900; color: #111827; margin-bottom: 24px; }
          .course { font-size: 18px; color: #4338CA; font-weight: 700; margin-bottom: 8px; }
          .desc { font-size: 14px; color: #6B7280; margin-bottom: 40px; }
          .meta { display: flex; justify-content: space-around; border-top: 1px solid #E5E7EB; padding-top: 24px; }
          .meta-item { font-size: 12px; color: #6B7280; }
          .meta-value { font-weight: 700; color: #111827; font-size: 14px; }
          .badge { display: inline-block; background: #4F46E5; color: #fff; padding: 8px 20px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 32px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="logo">🎓 LearnEarn</div>
          <div class="subtitle">Empowering Professional Growth and Excellence</div>
          <div class="badge">Certificate of Completion</div>
          <div class="awarded">This certifies that</div>
          <div class="name">${analytics?.name || user?.name}</div>
          <div class="course">has successfully completed</div>
          <div class="course">${cert.courseId?.title}</div>
          <div class="desc">${cert.courseId?.category || ""} · ${cert.courseId?.difficulty || ""}</div>
          <div class="meta">
            <div class="meta-item">
              <div class="meta-value">${new Date(cert.issuedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</div>
              <div>Issue Date</div>
            </div>
            <div class="meta-item">
              <div class="meta-value">${cert.certificateId}</div>
              <div>Certificate ID</div>
            </div>
          </div>
        </div>
        <script>
          setTimeout(() => {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const handleEmailCert = async (certId) => {
    const toastId = toast.loading("Sending certificate to your email...");
    try {
      const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${backendUrl}/certificates/${certId}/email`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(data.message || "Certificate sent!", { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send email", { id: toastId });
    }
  };

  if (loading) return <PageLoader />;

  const xpToNext = user?.level === "Advanced" ? 1000 : user?.level === "Intermediate" ? 500 : 200;
  const xpPct = Math.min(Math.round(((analytics?.xp || 0) / xpToNext) * 100), 100);
  const certs = analytics?.certificates || [];
  const scores = analytics?.recentScores || [];

  const tabs = [
    { id: "overview", label: "Overview", icon: <User size={16} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={16} /> },
    { id: "events", label: `Events (${eventHistory.length})`, icon: <Radio size={16} /> },
    { id: "certificates", label: `Certificates (${certs.length})`, icon: <Trophy size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-surface-50 relative">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Profile header */}
        <div className="card mb-6 animate-slide-up bg-white p-8 border-surface-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar with active frame */}
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
              <div
                className="w-24 h-24 rounded-full bg-brand-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                style={getAvatarStyle(user?.activeAvatar)}
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>
              {getAvatarEmoji(user?.activeAvatar) && (
                <span
                  className="absolute -top-2 -right-2 text-2xl"
                  title={user?.activeAvatar === 'avatar-ninja' ? 'Ninja Avatar equipped' : 'Royal Crown equipped'}
                >
                  {getAvatarEmoji(user?.activeAvatar)}
                </span>
              )}
            </div>

            <div className="flex-1 mt-2">
              <h1 className="text-2xl font-bold text-txt-primary mb-1">{user?.name}</h1>
              <p className="text-txt-secondary text-sm mb-3 font-medium">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <LevelBadge level={analytics?.level || "Beginner"} />
                <span className="text-xs text-txt-tertiary bg-surface-100 px-2 py-1 rounded-md font-medium">Joined {new Date(analytics?.joinedAt).toLocaleDateString()}</span>
                {user?.activeTheme && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-full">
                    <Wand2 size={11} />
                    {THEME_LABELS[user.activeTheme] || user.activeTheme}
                  </span>
                )}
                {user?.activeAvatar && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full">
                    <Crown size={11} />
                    {user.activeAvatar === 'avatar-ninja' ? 'Ninja Avatar' : 'Royal Crown'}
                  </span>
                )}
              </div>
            </div>

            <div className="sm:text-right mt-4 sm:mt-0 bg-surface-50 p-4 rounded-xl border border-surface-200 w-full sm:w-auto flex flex-col items-center sm:items-end">
              <p className="text-3xl font-bold text-warning-500 mb-1">{analytics?.xp || 0}</p>
              <p className="text-[10px] text-txt-secondary font-bold uppercase tracking-wider mb-2">Total XP</p>
              <div className="w-full sm:w-32">
                <ProgressBar percentage={xpPct} color="amber" showLabel={false} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-surface-100 p-1.5 rounded-xl mb-8 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold flex-1 justify-center transition-all whitespace-nowrap
                ${activeTab === tab.id ? "bg-white text-brand-600 shadow-sm" : "text-txt-secondary hover:text-txt-primary hover:bg-white/50"}`}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {[
              { icon: "⚡", label: "Total XP", value: analytics?.xp || 0, color: "bg-warning-50 text-warning-600" },
              { icon: "🪙", label: "Coins", value: analytics?.coins || 0, color: "bg-warning-50 text-warning-500" },
              { icon: "🔥", label: "Streak", value: `${analytics?.streak || 0}`, color: "bg-orange-50 text-orange-500" },
              { icon: "📚", label: "Paths", value: analytics?.totalEnrolledPaths || 0, color: "bg-brand-50 text-brand-600" },
              { icon: "🎓", label: "Courses", value: analytics?.totalCoursesCompleted || 0, color: "bg-success-50 text-success-600" },
              { icon: "✅", label: "Modules", value: analytics?.totalModulesCompleted || 0, color: "bg-success-50 text-success-500" },
              { icon: "📝", label: "Quizzes", value: analytics?.totalQuizzesAttempted || 0, color: "bg-purple-50 text-purple-600" },
              { icon: "📊", label: "Avg Score", value: `${analytics?.avgScore || 0}%`, color: "bg-brand-50 text-brand-500" },
            ].map((item) => (
              <div key={item.label} className="card-flat flex flex-col p-5 hover:scale-[1.02] transition-transform">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 ${item.color}`}>{item.icon}</div>
                <p className="text-xl font-bold text-txt-primary leading-tight mb-1">{item.value}</p>
                <p className="text-xs font-semibold text-txt-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid sm:grid-cols-2 gap-6 animate-fade-in">
            <div className="card">
              <h3 className="section-title">Quiz Scores</h3>
              {scores.length === 0 ? (
                <p className="text-txt-tertiary text-sm text-center py-8 bg-surface-50 rounded-xl border border-dashed border-surface-200">No attempts yet</p>
              ) : (
                <div className="space-y-3.5">
                  {scores.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-txt-tertiary w-5 text-right whitespace-nowrap">#{i + 1}</span>
                      <div className="flex-1">
                        <ProgressBar
                          percentage={s.percentage}
                          color={s.percentage >= 80 ? "emerald" : s.percentage >= 50 ? "amber" : "red"}
                          showLabel={false}
                          size="sm"
                        />
                      </div>
                      <span className={`text-xs font-bold w-10 text-right ${s.percentage >= 50 ? "text-success-600" : "text-danger-600"}`}>
                        {s.percentage}%
                      </span>
                      <span className="text-[10px] font-bold text-warning-500 w-12 text-right bg-warning-50 px-1.5 py-0.5 rounded">+{s.xpEarned} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="section-title">Completed Courses</h3>
              {analytics?.completedCourses?.length === 0 ? (
                <p className="text-txt-tertiary text-sm text-center py-8 bg-surface-50 rounded-xl border border-dashed border-surface-200">No courses finished</p>
              ) : (
                <div className="space-y-2">
                  {analytics?.completedCourses?.map((course) => (
                    <div key={course._id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-success-500" />
                        <span className="text-sm font-semibold text-txt-primary">{course.title}</span>
                      </div>
                      <span className="text-[10px] bg-surface-100 text-txt-secondary px-2 py-1 rounded font-bold">{course.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="animate-fade-in">
            {eventHistory.length === 0 ? (
              <div className="card-flat text-center py-16">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-surface-200 flex items-center justify-center mx-auto mb-4">
                  <Radio size={24} className="text-txt-tertiary" />
                </div>
                <p className="text-txt-primary font-bold text-lg mb-1">No events yet</p>
                <p className="text-txt-secondary text-sm">Join a live competition to see your history.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventHistory.map((reg) => {
                  const ev = reg.eventId;
                  const lb = reg.leaderboard;
                  if (!ev) return null;
                  return (
                    <div key={reg._id} className="card p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        lb?.isSelected
                          ? "bg-warning-50 text-warning-600 border border-warning-200"
                          : "bg-surface-100 text-txt-secondary border border-surface-200"
                      }`}>
                        {lb?.isSelected ? <Trophy size={20} /> : <Radio size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-txt-primary truncate">{ev.title}</p>
                        <p className="text-[11px] font-medium text-txt-tertiary uppercase tracking-wider">{ev.company} • {ev.status}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {lb ? (
                          <>
                            <p className="text-base font-bold text-warning-600">{lb.totalScore} pts</p>
                            <p className="text-[10px] text-txt-tertiary font-bold uppercase tracking-wider mt-0.5">Rank #{lb.rank || "—"}</p>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-txt-secondary bg-surface-100 px-2 py-1 rounded">Registered</span>
                        )}
                      </div>
                      {lb?.isSelected && (
                        <span className="hidden sm:inline-flex items-center gap-1 bg-warning-50 text-warning-700 border border-warning-200 text-xs font-bold px-2 py-1 rounded-md ml-2">
                          🏆 Selected
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <div className="animate-fade-in">
            {certs.length === 0 ? (
              <div className="card-flat text-center py-16">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-surface-200 flex items-center justify-center mx-auto mb-4">
                  <Trophy size={24} className="text-txt-tertiary" />
                </div>
                <p className="text-txt-primary font-bold text-lg mb-1">No certificates</p>
                <p className="text-txt-secondary text-sm">Finish courses to earn your certificates.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {certs.map((cert) => (
                  <div key={cert._id} className="card border-brand-200 bg-brand-50/20">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-400 to-warning-500 flex items-center justify-center shadow-sm">
                        <Trophy size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-txt-primary text-sm line-clamp-2 leading-snug">{cert.courseId?.title}</p>
                        <p className="text-[10px] font-semibold text-txt-tertiary uppercase tracking-wider mt-1">{cert.courseId?.category} • {cert.courseId?.difficulty}</p>
                      </div>
                    </div>
                    <div className="text-xs text-txt-secondary mb-5 bg-surface-50 p-3 rounded-lg border border-surface-200">
                      <div className="flex justify-between border-b border-surface-200 pb-2 mb-2">
                        <span className="text-txt-tertiary">Issued</span>
                        <span className="font-semibold text-txt-primary">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-txt-tertiary">ID</span>
                        <span className="font-mono font-medium text-[10px] text-txt-secondary truncate w-32 text-right" title={cert.certificateId}>{cert.certificateId}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadCert(cert)}
                        className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-none"
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        onClick={() => handleEmailCert(cert.certificateId)}
                        className="btn-secondary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 border-surface-200"
                      >
                        <Mail size={14} /> Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
