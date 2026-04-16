import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Zap, Trophy, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import { PageLoader } from "../components/LoadingSpinner";
import { getQuiz, submitQuiz } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ── Sub-components ─────────────────────────────────────────────────────────
const ResultScreen = ({ result, onRetake, onNext, navigate }) => {
  const { score, totalQuestions, percentage, passed, reward, results } = result;
  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Score card */}
      <div className={`premium-card text-center mb-8 border-2 ${passed ? "border-success-200 bg-gradient-to-br from-success-50/50 to-white" : "border-danger-200 bg-gradient-to-br from-danger-50/50 to-white"}`}>
        <div className={`w-28 h-28 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-black shadow-lg
          ${passed ? "bg-gradient-to-br from-success-100 to-success-200 text-success-600" : "bg-gradient-to-br from-danger-100 to-danger-200 text-danger-600"}`}>
          {percentage}%
        </div>
        <h2 className={`text-3xl font-extrabold mb-2 ${passed ? "text-success-600" : "text-danger-600"}`}>
          {passed ? "Great Job! 🎉" : "Keep Practicing 💪"}
        </h2>
        <p className="text-txt-secondary text-base font-medium mb-6">
          You scored {score} out of {totalQuestions} correct
        </p>

        {/* Rewards */}
        {passed && reward && (
          <div className="flex justify-center gap-3 flex-wrap mb-6">
            <div className="flex items-center gap-1.5 bg-warning-50 border border-warning-200 text-warning-700 rounded-xl px-4 py-2 font-bold shadow-sm">
              <Zap size={16} /> +{reward.xpEarned} XP
            </div>
            <div className="flex items-center gap-1.5 bg-warning-50 border border-warning-200 text-warning-700 rounded-xl px-4 py-2 font-bold shadow-sm">
              🪙 +{reward.coinsEarned} Coins
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-xl px-4 py-2 font-bold shadow-sm">
              🔥 Streak {reward.streak}
            </div>
          </div>
        )}

        <div className="max-w-xs mx-auto mb-8">
          <ProgressBar percentage={percentage} color={passed ? "emerald" : "red"} label="Score" size="md" />
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={onRetake} className="btn-secondary">Try Again</button>
          {passed && <button onClick={onNext} className="btn-primary flex items-center gap-2 shadow-glow">
            Next Module <ArrowRight size={18} />
          </button>}
        </div>
      </div>

      {/* Question review */}
      <h3 className="text-xl font-bold text-txt-primary mb-4">Review Answers</h3>
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className={`card p-4 border transition-colors animate-fade-in-up ${r.isCorrect ? "border-success-200 bg-success-50/50" : "border-danger-200 bg-danger-50/50"}`}
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-4">
              {r.isCorrect ? (
                <div className="bg-success-100 p-1.5 rounded-full shadow-sm"><CheckCircle2 size={20} className="text-success-600 flex-shrink-0" /></div>
              ) : (
                <div className="bg-danger-100 p-1.5 rounded-full shadow-sm"><XCircle size={20} className="text-danger-600 flex-shrink-0" /></div>
              )}
              <div>
                <p className="font-bold text-txt-primary text-[15px] mb-1.5 leading-snug">Q{i + 1}. {r.question}</p>
                {!r.isCorrect && (
                  <p className="text-sm font-semibold text-success-600 flex items-center gap-1.5 bg-success-50 px-2 py-1 rounded inline-block mt-1">
                    ✓ {r.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main QuizPage ───────────────────────────────────────────────────────────
const QuizPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await getQuiz(moduleId);
        const fetchedQuiz = res.data.quiz;

        // 🔀 Shuffle questions and keep track of original index
        const shuffledQuestions = fetchedQuiz.questions
          .map((q, idx) => ({ ...q, originalQuestionIndex: idx }))
          .sort(() => Math.random() - 0.5);

        // 🔀 Shuffle options for each question
        shuffledQuestions.forEach((q) => {
          q.shuffledOptions = q.options
            .map((opt, idx) => ({ text: opt, originalOptionIndex: idx }))
            .sort(() => Math.random() - 0.5);
        });

        setQuiz({ ...fetchedQuiz, questions: shuffledQuestions });
        setAnswers(new Array(shuffledQuestions.length).fill(null));
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to load quiz");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [moduleId, navigate]);

  const selectAnswer = (optionIndex) => {
    const updated = [...answers];
    updated[current] = optionIndex;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter((a) => a === null).length;
    if (unanswered > 0) {
      toast.error(`Please answer all questions (${unanswered} remaining)`);
      return;
    }
    setSubmitting(true);

    try {
      // 🔄 Map shuffled answers back to original indices for the backend
      const originalAnswers = new Array(quiz.questions.length).fill(null);
      
      quiz.questions.forEach((q, shuffledIdx) => {
        const selectedShuffledIdx = answers[shuffledIdx];
        const originalQuestionIdx = q.originalQuestionIndex;
        const originalOptionIdx = q.shuffledOptions[selectedShuffledIdx].originalOptionIndex;
        
        originalAnswers[originalQuestionIdx] = originalOptionIdx;
      });

      const res = await submitQuiz({ quizId: quiz._id, answers: originalAnswers });
      setResult(res.data);
      if (res.data.reward) {
        updateUser({
          xp: res.data.reward.totalXp,
          coins: res.data.reward.totalCoins,
          level: res.data.reward.level,
          streak: res.data.reward.streak,
        });
      }
      if (res.data.passed) toast.success("Quiz passed! 🎉");
      else toast.error("Better luck next time! Keep practicing.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setCurrent(0);
  };

  if (loading) return <PageLoader />;
  if (!quiz) return null;

  const questions = quiz.questions;
  const progress = Math.round(((current + 1) / questions.length) * 100);
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="min-h-screen bg-surface-50 relative">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 relative z-10">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 mb-6 -ml-4">
          <ArrowLeft size={16} /> Back to Module
        </button>

        {result ? (
          <ResultScreen
            result={result}
            onRetake={handleRetake}
            onNext={() => navigate(-1)}
            navigate={navigate}
          />
        ) : (
          <>
            {/* Quiz header */}
            <div className="premium-card mb-6 animate-fade-in-up shadow-card border-surface-200/40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-txt-primary">Module Quiz</h1>
                  <p className="text-sm font-medium text-txt-secondary">{questions.length} questions — Score ≥50% to pass</p>
                </div>
                <div className="text-right bg-gradient-to-br from-surface-50 to-brand-50/30 px-4 py-2 rounded-xl border border-surface-200/60 shadow-sm">
                  <p className="text-[10px] font-bold text-txt-tertiary uppercase tracking-wider mb-0.5">Answered</p>
                  <p className="text-lg font-black text-brand-600 leading-none">{answeredCount}/{questions.length}</p>
                </div>
              </div>
              <ProgressBar percentage={progress} color="brand" label={`Question ${current + 1} of ${questions.length}`} size="sm" />
            </div>

            {/* Question */}
            <div className="card mb-6 animate-fade-in shadow-card" key={current}>
              <p className="text-[11px] text-brand-600 font-black uppercase tracking-wider mb-3">Question {current + 1}</p>
              <h2 className="text-[17px] font-bold text-txt-primary leading-relaxed mb-6">
                {questions[current].question}
              </h2>

              <div className="space-y-3">
                {questions[current].shuffledOptions.map((optionObj, optIdx) => {
                  const selected = answers[current] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectAnswer(optIdx)}
                      className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left group
                        ${selected
                          ? "border-brand-500 bg-brand-50/80 shadow-glow"
                          : "border-surface-200/80 bg-white hover:border-brand-300 hover:bg-brand-50/30"
                        }`}
                    >
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold mr-4 border transition-all shadow-sm
                        ${selected ? "bg-gradient-to-br from-brand-600 to-brand-500 text-white border-brand-700 ring-2 ring-brand-200" : "bg-surface-50 text-txt-secondary border-surface-200 group-hover:border-brand-300"}`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className={`font-semibold text-[14px] ${selected ? "text-brand-900" : "text-txt-primary"}`}>
                        {optionObj.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-card border border-surface-200/60">
              <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-ghost disabled:opacity-40">
                ← Previous
              </button>

              {/* Question dots */}
              <div className="flex gap-2 flex-wrap justify-center">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 border shadow-sm
                      ${i === current ? "bg-gradient-to-br from-brand-600 to-brand-500 text-white border-brand-700 scale-110 ring-2 ring-brand-200" : answers[i] !== null ? "bg-success-50 text-success-600 border-success-200" : "bg-white text-txt-secondary border-surface-200 hover:border-brand-300"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary px-6">
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredCount < questions.length}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 px-6 shadow-glow"
                >
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><Trophy size={18} /> Submit Quiz</>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage;