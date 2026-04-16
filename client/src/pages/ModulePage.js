import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Zap, PlayCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { PageLoader } from "../components/LoadingSpinner";
import { getModule } from "../services/api";
import toast from "react-hot-toast";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await getModule(moduleId);
        setModule(res.data.module);
        setIsCompleted(res.data.isCompleted);
      } catch (err) {
        if (err.response?.status === 403) {
          toast.error("Complete the previous module first! 🔒");
        } else {
          toast.error("Failed to load module");
        }
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [moduleId, navigate]);

  if (loading) return <PageLoader />;
  if (!module) return null;

  // Format content as paragraphs
  const contentParagraphs = module.content?.split("\n").filter((p) => p.trim()) || [];

  return (
    <div className="min-h-screen bg-surface-50 relative">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2 mb-6 -ml-4"
        >
          <ArrowLeft size={16} /> Back to Course
        </button>

        {/* Header */}
        <div className="animate-fade-in-up premium-card p-6 md:p-8 mb-8 border-surface-200/40">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-brand-600 via-purple-500 to-brand-400 rounded-t-3xl opacity-[0.06]" />
          <div className="flex items-center gap-2.5 mb-4 flex-wrap relative z-10">
            <span className="badge badge-blue">
              <BookOpen size={12} /> Module {module.order + 1}
            </span>
            <span className="badge badge-yellow">
              <Zap size={12} /> +{module.xpReward} XP
            </span>
            {isCompleted && (
              <span className="badge badge-green">
                <CheckCircle2 size={12} /> Completed
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-txt-primary mb-3 leading-tight tracking-tight relative z-10">{module.title}</h1>
          {module.description && (
            <p className="text-txt-secondary text-base leading-relaxed relative z-10">{module.description}</p>
          )}
        </div>

        {/* Video placeholder */}
        {module.videoUrl ? (
          <div className="mb-8 rounded-[24px] overflow-hidden border border-surface-200/60 shadow-card bg-white">
            <iframe
              src={module.videoUrl}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={module.title}
            />
          </div>
        ) : (
          <div className="mb-8 rounded-[24px] aspect-video bg-gradient-to-br from-surface-100 to-surface-50 border border-surface-200/60 flex items-center justify-center shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center mx-auto mb-3">
                <BookOpen size={28} className="text-brand-500" />
              </div>
              <p className="text-txt-secondary text-sm font-semibold">Reading material below</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="card animate-fade-in p-6 md:p-8 mb-8" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-bold text-txt-primary mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-gradient-to-b from-brand-500 to-purple-500 rounded-full block shadow-sm" />
            Module Content
          </h2>
          <div className="space-y-4 text-txt-secondary leading-relaxed text-[15px]">
            {contentParagraphs.map((para, i) => {
              const isHeading = para.length < 80 && !para.includes(":") && i > 0 &&
                (para === para.toUpperCase() || para.startsWith("Key") || para.startsWith("Common") || para.startsWith("Introduction"));
              return isHeading ? (
                <h3 key={i} className="text-lg font-bold text-txt-primary mt-8 mb-3">{para}</h3>
              ) : (
                <p key={i}>{para}</p>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center animate-fade-in-up bg-gradient-to-br from-brand-50/50 to-purple-50/30 border-brand-100/50" style={{ animationDelay: "200ms" }}>
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25 animate-float">
              <PlayCircle size={32} className="text-white drop-shadow-md" />
            </div>
            {isCompleted ? (
              <>
                <h3 className="text-xl font-extrabold text-success-600 mb-2">Module Already Completed ✅</h3>
                <p className="text-txt-secondary text-base mb-6">Retake the quiz to refresh your knowledge.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-extrabold text-txt-primary mb-2">Ready to test your knowledge?</h3>
                <p className="text-txt-secondary text-base mb-6">
                  Take the AI-generated quiz to earn <strong className="text-warning-600">+{module.xpReward} XP</strong>
                </p>
              </>
            )}
          </div>
          <Link to={`/quiz/${module._id}`} className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 shadow-glow">
            <PlayCircle size={20} />
            {isCompleted ? "Retake Quiz" : "Start Quiz"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;