import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Clock, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import { PageLoader } from "../components/LoadingSpinner";
import { getLearningPaths, enrollInPath } from "../services/api";
import toast from "react-hot-toast";

const difficultyColors = {
  beginner:     "badge-green",
  intermediate: "badge-blue",
  advanced:     "badge-purple",
};

const categoryColors = {
  Programming: "badge-blue",
  Design:      "badge-purple",
  Business:    "badge-yellow",
  Science:     "badge-green",
  Other:       "badge-red",
};

const LearningPathsPage = () => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await getLearningPaths();
        setPaths(res.data.paths || []);
      } catch {
        toast.error("Failed to load learning paths");
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, []);

  const handleEnroll = async (e, pathId) => {
    e.preventDefault();
    e.stopPropagation();
    setEnrolling(pathId);
    try {
      await enrollInPath(pathId);
      setPaths((prev) => prev.map((p) => p._id === pathId ? { ...p, isEnrolled: true } : p));
      toast.success("Enrolled successfully!");
    } catch (err) {
      if (err.response?.status === 401) toast.error("Please login to enroll");
      else toast.error("Enrollment failed");
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = paths.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.difficulty === filter ||
      (filter === "enrolled" && p.isEnrolled);
    return matchSearch && matchFilter;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-10 text-center animate-slide-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-txt-primary mb-3 tracking-tight">
            Learning <span className="text-brand-600">Paths</span>
          </h1>
          <p className="text-txt-secondary text-base max-w-2xl mx-auto">
            Choose a structured track and master skills step by step with our AI-curated curriculum.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center bg-white p-3 rounded-2xl border border-surface-200 shadow-sm animate-fade-in">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What do you want to learn today?"
              className="w-full bg-surface-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm text-txt-primary placeholder:text-txt-tertiary focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-all font-medium"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {["all", "beginner", "intermediate", "advanced", "enrolled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold capitalize transition-all duration-200
                  ${filter === f 
                    ? "bg-txt-primary text-white shadow-sm" 
                    : "bg-surface-50 text-txt-secondary hover:bg-surface-100 hover:text-txt-primary"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Paths grid */}
        {filtered.length === 0 ? (
          <div className="card-flat text-center py-16">
            <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-txt-tertiary" />
            </div>
            <p className="text-txt-secondary font-medium text-base">No learning paths found</p>
            <p className="text-txt-tertiary text-sm mt-1">
              {search ? "Try a different search term" : "Check back soon for new content"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((path, idx) => (
              <Link
                key={path._id}
                to={`/learning-paths/${path._id}`}
                className="card group animate-slide-up opacity-0 flex flex-col"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {path.category === "Programming" ? "💻" : path.category === "Science" ? "🔬" : path.category === "Design" ? "🎨" : "📚"}
                  </div>
                  {path.isEnrolled && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-success-50 text-success-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-success-100">
                      <CheckCircle2 size={12} strokeWidth={2.5} /> Enrolled
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-txt-primary mb-2 group-hover:text-brand-600 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-sm text-txt-secondary leading-relaxed mb-5 line-clamp-2">
                    {path.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    <span className={`badge ${difficultyColors[path.difficulty]}`}>{path.difficulty}</span>
                    <span className={`badge ${categoryColors[path.category]}`}>{path.category}</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs font-semibold text-txt-tertiary border-t border-surface-100 pt-4 mb-4">
                  <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-brand-500" /> {path.totalCourses}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-purple-500" /> {path.estimatedHours}h</span>
                  <span className="ml-auto bg-surface-50 px-2 py-1 rounded-md text-txt-secondary">{path.totalModules} mods</span>
                </div>

                {/* CTA */}
                {path.isEnrolled ? (
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex-1 mr-4">
                      <ProgressBar percentage={0} color="brand" showLabel={false} size="sm" />
                    </div>
                    <span className="text-brand-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Continue <ChevronRight size={16} />
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleEnroll(e, path._id)}
                    disabled={enrolling === path._id}
                    className="w-full bg-txt-primary text-white font-semibold py-2.5 rounded-xl hover:bg-brand-600 transition-colors mt-auto flex items-center justify-center gap-2 text-sm"
                  >
                    {enrolling === path._id ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enrolling...</>
                    ) : (
                      <>Enroll Now <ArrowRight size={16} /></>
                    )}
                  </button>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathsPage;
