import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Clock, Lock, CheckCircle2,
  ChevronRight, PlayCircle, BarChart2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import { PageLoader } from "../components/LoadingSpinner";
import { getCourse } from "../services/api";
import toast from "react-hot-toast";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourse(courseId);
        setCourse(res.data.course);
        setProgress(res.data.userProgress);
      } catch (err) {
        toast.error("Failed to load course");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  if (loading) return <PageLoader />;
  if (!course) return null;

  const difficultyColor = { easy: "badge-green", medium: "badge-yellow", hard: "badge-red" };
  const modules = progress?.modules || course.modules || [];

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2 mb-6 -ml-4"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Course header */}
        <div className="premium-card mb-8 animate-slide-up border-transparent shadow-elevated bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`badge ${difficultyColor[course.difficulty]}`}>{course.difficulty}</span>
                <span className="badge badge-blue">{course.category}</span>
                {course.tags?.map((tag) => (
                  <span key={tag} className="badge bg-surface-100 text-txt-secondary border-surface-200">#{tag}</span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-txt-primary mb-2">{course.title}</h1>
              <p className="text-txt-secondary text-[15px] leading-relaxed mb-1">{course.description}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 text-[13px] font-semibold text-txt-tertiary border-t border-surface-100 pt-4 mb-5">
            <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-brand-500" /> {modules.length} modules</span>
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-purple-500" /> ~{course.estimatedHours}h</span>
            <span className="flex items-center gap-1.5"><BarChart2 size={14} className="text-brand-500" /> {course.difficulty} level</span>
          </div>

          {/* Progress */}
          {progress && (
            <div className="max-w-md">
              <ProgressBar
                percentage={progress.percentage}
                color="brand"
                label={`${progress.completedModules} / ${progress.totalModules} modules completed`}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Module list */}
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="section-title">Course Modules</h2>
          <div className="space-y-3">
            {modules.map((module, index) => {
              const isLocked = module.isLocked;
              const isCompleted = module.isCompleted;

              return (
                <div
                  key={module._id}
                  className={`card p-4 transition-all duration-200 ${
                    isLocked
                      ? "opacity-60 cursor-not-allowed bg-surface-50 border-surface-100 shadow-none"
                      : "hover:border-brand-300 hover:shadow-card-hover cursor-pointer"
                  }`}
                  onClick={() => {
                    if (isLocked) { toast.error("Complete the previous module first! 🔒"); return; }
                    navigate(`/modules/${module._id}`);
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Step number / Status icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base shadow-sm border
                      ${isCompleted ? "bg-success-50 text-success-600 border-success-200" 
                      : isLocked ? "bg-white text-txt-tertiary border-surface-200" 
                      : "bg-white text-brand-600 border-brand-200"}`}>
                      {isCompleted ? <CheckCircle2 size={20} strokeWidth={3} /> : isLocked ? <Lock size={18} /> : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-bold ${isLocked ? "text-txt-secondary" : "text-txt-primary"}`}>
                        {module.title}
                      </p>
                      {module.description && (
                        <p className="text-sm text-txt-tertiary mt-0.5 truncate">{module.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {module.xpReward && (
                        <span className="text-[11px] bg-warning-50 text-warning-600 border border-warning-200 font-bold px-2 py-1 rounded hidden sm:inline-block">+{module.xpReward} XP</span>
                      )}
                      {isCompleted ? (
                        <span className="badge badge-green text-[10px]">DONE</span>
                      ) : isLocked ? (
                        <span className="badge bg-surface-100 text-txt-tertiary border-surface-200 text-[10px]">LOCKED</span>
                      ) : (
                        <ChevronRight size={20} className="text-txt-tertiary" />
                      )}
                    </div>
                  </div>

                  {/* Unlock hint */}
                  {isLocked && (
                    <p className="text-[11px] font-semibold text-txt-tertiary mt-3 ml-15 pl-1.5 border-l-2 border-surface-200">
                      🔒 Complete Module {index} to unlock
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Continue button */}
          {progress && (
            <div className="mt-8 flex justify-center">
              {(() => {
                const nextModule = modules.find((m) => !m.isCompleted && !m.isLocked);
                if (!nextModule) return (
                  <div className="text-center bg-success-50 border border-success-200 p-6 rounded-2xl w-full max-w-sm">
                    <CheckCircle2 size={32} className="text-success-500 mx-auto mb-3" />
                    <p className="text-success-700 font-bold">All modules completed! Course finished.</p>
                  </div>
                );
                return (
                  <Link
                    to={`/modules/${nextModule._id}`}
                    className="btn-primary flex items-center gap-2 px-8 py-3.5 shadow-elevated"
                  >
                    <PlayCircle size={20} />
                    Continue Learning
                  </Link>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;