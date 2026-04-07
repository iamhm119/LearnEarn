import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BookOpen, CheckCircle2, ChevronRight, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import { PageLoader } from "../components/LoadingSpinner";
import { getLearningPath, enrollInPath } from "../services/api";
import toast from "react-hot-toast";

const LearningPathDetailPage = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLearningPath(pathId);
        setPath(res.data.path);
        setProgress(res.data.progress);
      } catch {
        toast.error("Failed to load learning path");
        navigate("/learning-paths");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pathId, navigate]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollInPath(pathId);
      setProgress((p) => ({ ...p, isEnrolled: true }));
      toast.success("🎉 Enrolled!");
    } catch {
      toast.error("Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!path) return null;

  const diffColor = { beginner: "badge-green", intermediate: "badge-blue", advanced: "badge-purple" };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 mb-6 -ml-4">
          <ArrowLeft size={16} /> Paths
        </button>

        {/* Hero */}
        <div className="premium-card mb-8 animate-slide-up border-transparent shadow-elevated bg-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-surface-50 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-sm border border-surface-100">
              {path.category === "Programming" ? "💻" : path.category === "Science" ? "🔬" : "📚"}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`badge ${diffColor[path.difficulty]}`}>{path.difficulty}</span>
                <span className="badge badge-blue">{path.category}</span>
                {path.tags?.slice(0, 3).map((t) => (
                  <span key={t} className="badge bg-surface-100 text-txt-secondary border-surface-200">#{t}</span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-txt-primary mb-2">{path.title}</h1>
              <p className="text-txt-secondary text-sm leading-relaxed mb-4">{path.description}</p>

              <div className="flex flex-wrap gap-5 text-[13px] font-semibold text-txt-tertiary mb-4">
                <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-brand-500" /> {path.courses?.length || 0} courses</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-purple-500" /> {path.estimatedHours}h estimated</span>
                {progress && <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success-500" /> {progress.completedModules}/{progress.totalModules} modules</span>}
              </div>

              {progress?.isEnrolled && (
                <div className="max-w-sm mb-4">
                  <ProgressBar percentage={progress.percentage} color="brand" label={`Overall Progress — ${progress.percentage}%`} size="sm" />
                </div>
              )}
            </div>

            {!progress?.isEnrolled && (
              <button 
                onClick={handleEnroll} 
                disabled={enrolling} 
                className="btn-primary flex-shrink-0 md:self-start w-full md:w-auto"
              >
                {enrolling ? "Enrolling..." : "Enroll Now — Free"}
              </button>
            )}
          </div>
        </div>

        {/* Courses */}
        <h2 className="section-title">Course Curriculum</h2>
        <div className="space-y-4">
          {path.courses?.map((course, ci) => (
            <div key={course._id} className="card animate-fade-in" style={{ animationDelay: `${ci * 50}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center font-bold text-lg flex-shrink-0 text-txt-tertiary shadow-sm">
                  {ci + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-txt-primary">{course.title}</h3>
                    <div className="flex items-center gap-3 text-xs font-semibold text-txt-secondary">
                      <span className="bg-surface-100 px-2.5 py-1 rounded-md border border-surface-200">{course.modules?.length || 0} modules</span>
                      <span className="flex items-center gap-1 text-purple-600"><Clock size={12}/>~{course.estimatedHours}h</span>
                    </div>
                  </div>
                  <p className="text-sm text-txt-secondary mb-4 line-clamp-2">{course.description}</p>

                  {/* Modules preview */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
                    {course.modules?.slice(0, 3).map((mod, mi) => (
                      <div key={mod._id} className="flex items-center gap-2 text-[11px] font-semibold text-txt-secondary bg-surface-50 border border-surface-100 rounded-lg px-2.5 py-2">
                        <span className="w-4 h-4 rounded-md bg-white border border-surface-200 shadow-sm flex items-center justify-center text-txt-tertiary flex-shrink-0">{mi + 1}</span>
                        <span className="truncate">{mod.title}</span>
                      </div>
                    ))}
                    {course.modules?.length > 3 && (
                      <div className="flex items-center text-[11px] font-semibold text-txt-tertiary px-2">
                        +{course.modules.length - 3} more
                      </div>
                    )}
                  </div>

                  {progress?.isEnrolled && (
                    <Link to={`/courses/${course._id}`} className="btn-secondary text-[13px] px-4 py-2 flex items-center justify-center md:justify-start gap-1.5 w-full md:w-fit mt-2">
                      Open Course <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {progress?.isEnrolled && (
          <div className="mt-10 text-center animate-fade-in">
            <Link to={`/courses/${path.courses?.[0]?._id}`} className="btn-primary inline-flex items-center gap-2">
              <BookOpen size={18} /> Start Learning <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathDetailPage;
