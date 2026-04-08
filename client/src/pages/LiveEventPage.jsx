import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, XCircle, Zap, Trophy, Clock,
  Users, ChevronRight, ChevronLeft,
  Radio, Shield, Star, MessageSquare, ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import EventTimer from "../components/EventTimer";
import EventLeaderboardSidebar from "../components/EventLeaderboardSidebar";
import { PageLoader } from "../components/LoadingSpinner";
import {
  getEvent,
  submitEventAnswer,
  registerForEvent,
  getEventFeedback,
} from "../services/api";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const difficultyColors = {
  easy: "bg-success-50 text-success-700 border-success-200",
  medium: "bg-warning-50 text-warning-700 border-warning-200",
  hard: "bg-danger-50 text-danger-700 border-danger-200",
};

const LiveEventPage = () => {
  const { id } = useParams();
  useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState(new Set());
  const [results, setResults] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [eventEnded, setEventEnded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [tabWarningShown, setTabWarningShown] = useState(false);

  // Socket.IO for real-time
  const {
    connected,
    leaderboard: socketLeaderboard,
    activeParticipants,
    timerData,
    tabWarning,
    disqualified,
    emitSubmission,
    emitTabSwitch,
  } = useSocket(id);

  // Use socket leaderboard or fallback to API leaderboard
  const [apiLeaderboard, setApiLeaderboard] = useState([]);
  const leaderboard =
    socketLeaderboard.length > 0 ? socketLeaderboard : apiLeaderboard;

  // Fetch event data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEvent(id);
        setEvent(res.data.event);
        setRegistration(res.data.registration);
        setApiLeaderboard(res.data.leaderboard || []);

        // Restore submitted questions
        if (res.data.submissions) {
          setSubmittedQuestions(new Set(res.data.submissions));
        }

        // Check if event ended
        const now = new Date();
        const endTime = new Date(res.data.event.endTime);
        if (now > endTime || res.data.event.status === "ended") {
          setEventEnded(true);
        }
      } catch (err) {
        toast.error("Failed to load event");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Anti-cheat: detect tab switching
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !eventEnded && registration) {
        emitTabSwitch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [eventEnded, registration, emitTabSwitch]);

  // Show tab switch warning
  useEffect(() => {
    if (tabWarning && !tabWarningShown) {
      toast.error(
        `⚠️ Tab switch detected! ${tabWarning.remaining} remaining before disqualification.`,
        { duration: 5000 }
      );
      setTabWarningShown(true);
      setTimeout(() => setTabWarningShown(false), 6000);
    }
  }, [tabWarning, tabWarningShown]);

  // Disqualification
  useEffect(() => {
    if (disqualified) {
      toast.error("You have been disqualified for excessive tab switching.", {
        duration: 10000,
      });
    }
  }, [disqualified]);

  // Reset question start time when navigating questions
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedOption(null);
  }, [currentQ]);

  // Handle answer submission
  const handleSubmit = async () => {
    if (selectedOption === null || submitting) return;

    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);

    try {
      const res = await submitEventAnswer(id, {
        questionIndex: currentQ,
        selectedAnswer: selectedOption,
        timeTaken,
      });

      const sub = res.data.submission;
      setResults((prev) => ({
        ...prev,
        [currentQ]: {
          isCorrect: sub.isCorrect,
          correctIndex: sub.correctIndex,
          score: sub.score,
        },
      }));

      setSubmittedQuestions((prev) => new Set([...prev, currentQ]));

      // Notify socket for real-time leaderboard update
      emitSubmission({ questionIndex: currentQ });

      if (sub.isCorrect) {
        toast.success(`+${sub.score} points! 🎯`, { duration: 2000 });
      } else {
        toast.error("Incorrect answer", { duration: 2000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle register
  const handleRegister = async () => {
    try {
      const res = await registerForEvent(id);
      setRegistration(res.data.registration);
      toast.success("Registered! 🎉");
      // Reload event
      const eventRes = await getEvent(id);
      setEvent(eventRes.data.event);
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setEventEnded(true);
    toast("⏰ Time's up! Event has ended.", { icon: "🏁", duration: 5000 });
  }, []);

  // Get AI feedback
  const handleGetFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await getEventFeedback(id);
      setFeedback(res.data.feedback);
    } catch {
      toast.error("Failed to get feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!event) return null;

  const questions = event.questions || [];
  const currentQuestion = questions[currentQ];
  const isUpcoming = new Date() < new Date(event.startTime);
  const totalScore = Object.values(results).reduce(
    (sum, r) => sum + (r.score || 0),
    0
  );
  const correctCount = Object.values(results).filter((r) => r.isCorrect).length;

  // ── UPCOMING STATE ──────────────────────────────────────────────────────
  if (isUpcoming) {
    const timeToStart = new Date(event.startTime) - new Date();
    const hours = Math.floor(timeToStart / (1000 * 60 * 60));
    const mins = Math.floor((timeToStart % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <button
            onClick={() => navigate("/events")}
            className="btn-ghost flex items-center gap-2 mb-8 -ml-4"
          >
            <ArrowLeft size={16} /> Back to Events
          </button>

          <div className="premium-card text-center py-16 animate-slide-up shadow-elevated bg-white">
            <div className="w-24 h-24 bg-gradient-to-br from-warning-400 to-warning-500 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-warning-500/30 animate-float">
              <Clock size={40} className="text-white drop-shadow-sm" />
            </div>
            <h1 className="text-3xl font-black text-txt-primary mb-3">
              {event.title}
            </h1>
            <p className="text-txt-secondary mb-8 max-w-lg mx-auto font-medium">
              {event.description}
            </p>
            <div className="inline-flex items-center gap-2 bg-warning-50 text-warning-700 px-6 py-3 rounded-2xl border border-warning-200 text-lg font-bold shadow-sm">
              <Clock size={20} />
              Starts in {hours > 0 ? `${hours}h ` : ""}
              {mins}m
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {event.skills?.map((skill) => (
                <span
                  key={skill}
                  className="badge bg-surface-100 text-txt-secondary border-surface-200"
                >
                  {skill}
                </span>
              ))}
            </div>
            {!registration && (
              <button
                onClick={handleRegister}
                className="btn-primary mt-8 px-10 py-3.5 text-base shadow-elevated"
              >
                Register Now
              </button>
            )}
            {registration && (
              <p className="mt-8 text-success-600 font-bold bg-success-50 px-6 py-3 rounded-2xl border border-success-200 inline-block">
                ✅ You're registered! Come back when the event starts.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ENDED STATE ─────────────────────────────────────────────────────────
  if (eventEnded || event.status === "ended") {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <button
            onClick={() => navigate("/events")}
            className="btn-ghost flex items-center gap-2 mb-8 -ml-4"
          >
            <ArrowLeft size={16} /> Back to Events
          </button>

          <div className="text-center mb-10 animate-slide-up">
            <div className="w-20 h-20 bg-surface-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-surface-200">
              <Trophy size={36} className="text-txt-tertiary" />
            </div>
            <h1 className="text-4xl font-black text-txt-primary mb-3 tracking-tight">
              {event.title}
            </h1>
            <p className="text-txt-secondary font-semibold">
              Event has ended • {event.company}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Score summary */}
              {submittedQuestions.size > 0 && (
                <div className="premium-card animate-fade-in bg-white shadow-sm">
                  <h3 className="section-title flex items-center gap-2 mb-5">
                    <Star size={18} className="text-warning-500" /> Your Performance
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center bg-surface-50 rounded-2xl p-4 border border-surface-100">
                      <p className="text-3xl font-black text-txt-primary">
                        {totalScore}
                      </p>
                      <p className="text-[10px] text-txt-tertiary font-bold uppercase tracking-wider mt-1">
                        Points
                      </p>
                    </div>
                    <div className="text-center bg-success-50 rounded-2xl p-4 border border-success-100">
                      <p className="text-3xl font-black text-success-600">
                        {correctCount}/{questions.length}
                      </p>
                      <p className="text-[10px] text-txt-tertiary font-bold uppercase tracking-wider mt-1">
                        Correct
                      </p>
                    </div>
                    <div className="text-center bg-warning-50 rounded-2xl p-4 border border-warning-100">
                      <p className="text-3xl font-black text-warning-600">
                        {Math.round((correctCount / Math.max(questions.length, 1)) * 100)}%
                      </p>
                      <p className="text-[10px] text-txt-tertiary font-bold uppercase tracking-wider mt-1">
                        Accuracy
                      </p>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  {!feedback ? (
                    <button
                      onClick={handleGetFeedback}
                      disabled={feedbackLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      {feedbackLoading ? "Generating AI Feedback..." : "Get AI Performance Feedback"}
                    </button>
                  ) : (
                    <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 mt-4 shadow-sm">
                      <h4 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <MessageSquare size={16} />
                        AI Feedback
                      </h4>
                      <div className="text-sm text-brand-900 font-medium whitespace-pre-wrap leading-relaxed">
                        {feedback}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Results for each question */}
              <div className="card shadow-sm">
                <h3 className="section-title">Question Review</h3>
                <div className="space-y-3">
                  {questions.map((q, i) => {
                    const result = results[i];
                    const wasSubmitted = submittedQuestions.has(i);
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all shadow-sm
                          ${
                            wasSubmitted
                              ? result?.isCorrect
                                ? "bg-success-50 border-success-200"
                                : "bg-danger-50 border-danger-200"
                              : "bg-surface-50 border-surface-200"
                          }`}
                      >
                        <span className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-xs font-bold text-txt-secondary shadow-sm">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-[13px] font-semibold text-txt-primary truncate">
                          {q.question}
                        </p>
                        {wasSubmitted ? (
                          result?.isCorrect ? (
                            <CheckCircle2 size={20} className="text-success-500 flex-shrink-0" strokeWidth={3}/>
                          ) : (
                            <XCircle size={20} className="text-danger-500 flex-shrink-0" strokeWidth={3}/>
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-txt-tertiary uppercase bg-surface-100 px-2 py-1 rounded">Skipped</span>
                        )}
                        {q.points && (
                          <span
                            className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border uppercase tracking-wider ${
                              difficultyColors[q.difficulty] || "bg-surface-100 text-txt-secondary border-surface-200"
                            }`}
                          >
                            {q.points} pts
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Final Leaderboard */}
            <div>
              <EventLeaderboardSidebar
                leaderboard={leaderboard}
                connected={false}
                activeParticipants={0}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIVE STATE ──────────────────────────────────────────────────────────
  if (!registration) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 text-center">
          <div className="premium-card py-16 animate-slide-up shadow-elevated bg-white">
            <div className="w-20 h-20 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-danger-100">
              <Radio size={40} className="text-danger-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-txt-primary mb-3">This event is live!</h2>
            <p className="text-txt-secondary font-medium mb-8">Register now to start competing.</p>
            <button onClick={handleRegister} className="btn-primary text-base px-10 py-3.5 shadow-md">
              Register & Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (disqualified) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 text-center">
          <div className="premium-card py-16 animate-slide-up shadow-elevated bg-white border-danger-200">
            <Shield size={56} className="text-danger-500 mx-auto mb-5" />
            <h2 className="text-3xl font-black text-danger-600 mb-3">Disqualified</h2>
            <p className="text-danger-700 font-medium mb-8 bg-danger-50 mx-auto inline-block px-4 py-2 rounded-lg">
              You were disqualified due to excessive tab switching.
            </p>
            <div>
              <Link to="/events" className="btn-secondary inline-flex items-center gap-2">
                Back to Events <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      {/* Top bar: Timer + Event info */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/events")} className="btn-ghost p-2 -ml-2">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 bg-danger-500 rounded-full animate-pulse shadow-sm shadow-danger-500/50" />
                <h2 className="font-bold text-txt-primary text-[15px] leading-none">
                  {event.title}
                </h2>
              </div>
              <p className="text-[11px] font-bold text-txt-tertiary uppercase tracking-wider">{event.company} • {questions.length} Qs</p>
            </div>
          </div>

          <EventTimer endTime={event.endTime} timerData={timerData} onTimeUp={handleTimeUp} />

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-200 shadow-inner">
              <Users size={14} className="text-txt-tertiary" />
              <span className="font-bold text-txt-secondary">{activeParticipants}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-warning-50 px-3 py-1.5 rounded-lg border border-warning-200 shadow-inner hidden sm:flex">
              <Zap size={14} className="text-warning-600" />
              <span className="font-black text-warning-700">{totalScore} pts</span>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`p-2 rounded-xl transition-all shadow-sm ${showLeaderboard ? "bg-brand-600 text-white" : "bg-white text-txt-secondary border border-surface-200 hover:border-brand-300"}`}
            >
              <Trophy size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12">
        <div className="flex gap-6 relative">
          {/* Questions area */}
          <div className={`flex-1 transition-all duration-300 ${showLeaderboard ? "lg:mr-80" : ""}`}>
            {/* Question navigation */}
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-2xl border border-surface-200 shadow-sm">
              {questions.map((_, i) => {
                const isSubmitted = submittedQuestions.has(i);
                const result = results[i];
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 border shadow-sm
                      ${currentQ === i 
                          ? "bg-brand-600 text-white border-brand-700 shadow-md scale-105" 
                          : isSubmitted 
                          ? result?.isCorrect ? "bg-success-100 text-success-700 border-success-200" : "bg-danger-100 text-danger-700 border-danger-200" 
                          : "bg-white text-txt-secondary border-surface-200 hover:border-brand-300 hover:bg-brand-50"
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Current question */}
            {currentQuestion && (
              <div className="card shadow-sm animate-fade-in p-6 sm:p-8">
                {/* Question header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-black text-sm shadow-inner">
                      {currentQ + 1}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${difficultyColors[currentQuestion.difficulty] || "bg-surface-100 text-txt-secondary border-surface-200"}`}>
                      {currentQuestion.difficulty}
                    </span>
                    <span className="text-[11px] font-bold text-warning-600 bg-warning-50 px-2 py-1 rounded-md flex items-center gap-1 border border-warning-100">
                      <Zap size={12} /> {currentQuestion.points} pts
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-txt-tertiary bg-surface-100 px-3 py-1.5 rounded-lg border border-surface-200 shadow-inner">
                    {currentQ + 1} / {questions.length}
                  </span>
                </div>

                {/* Question text */}
                <h2 className="text-[19px] font-bold text-txt-primary mb-8 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-3 mb-10">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSubmitted = submittedQuestions.has(currentQ);
                    const result = results[currentQ];
                    const isSelected = selectedOption === optIdx;
                    const isCorrectOption = result?.correctIndex === optIdx;
                    const isWrongSelection = isSubmitted && !result?.isCorrect && result?.correctIndex !== optIdx && selectedOption === optIdx;

                    let optionStyle = "bg-white border-surface-200 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer text-txt-primary";

                    if (isSubmitted) {
                      if (isCorrectOption) optionStyle = "bg-success-50 border-success-400 text-success-900 shadow-sm";
                      else if (isWrongSelection) optionStyle = "bg-danger-50 border-danger-400 text-danger-900 shadow-sm";
                      else optionStyle = "bg-surface-50 border-surface-200 opacity-60 text-txt-secondary";
                    } else if (isSelected) {
                      optionStyle = "bg-brand-50 border-brand-500 text-brand-900 shadow-sm ring-2 ring-brand-100";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => !isSubmitted && setSelectedOption(optIdx)}
                        disabled={isSubmitted}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${optionStyle}`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 border shadow-sm
                            ${isSubmitted && isCorrectOption ? "bg-success-500 text-white border-success-600"
                            : isSubmitted && isWrongSelection ? "bg-danger-500 text-white border-danger-600"
                            : isSelected ? "bg-brand-600 text-white border-brand-700" 
                            : "bg-surface-50 text-txt-secondary border-surface-200"}`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className={`text-[15px] font-semibold flex-1 ${isSubmitted && isWrongSelection ? "line-through opacity-80" : ""}`}>
                          {option}
                        </span>
                        {isSubmitted && isCorrectOption && <CheckCircle2 size={22} className="text-success-500 flex-shrink-0" strokeWidth={3}/>}
                        {isSubmitted && isWrongSelection && <XCircle size={22} className="text-danger-500 flex-shrink-0" strokeWidth={3}/>}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-50 p-3 rounded-2xl border border-surface-200">
                  <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn-ghost disabled:opacity-40">
                    <ChevronLeft size={18} /> Prev
                  </button>
                  <div className="flex items-center gap-3">
                    {!submittedQuestions.has(currentQ) && (
                      <button
                        onClick={handleSubmit}
                        disabled={selectedOption === null || submitting}
                        className="btn-primary flex items-center gap-2 px-8 py-2.5 shadow-elevated justify-center"
                      >
                        {submitting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>...</> : <>Submit <CheckCircle2 size={18} /></>}
                      </button>
                    )}
                  </div>
                  <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))} disabled={currentQ === questions.length - 1} className="btn-ghost disabled:opacity-40">
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Progress summary */}
            <div className="mt-6 card p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-txt-tertiary font-medium">Answered <span className="font-bold text-txt-primary ml-1">{submittedQuestions.size}/{questions.length}</span></span>
                <span className="text-txt-tertiary font-medium">Score <span className="font-bold text-warning-600 ml-1">{totalScore}</span></span>
                <span className="text-txt-tertiary font-medium">Correct <span className="font-bold text-success-600 ml-1">{correctCount}</span></span>
              </div>
              <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden shadow-inner border border-surface-200">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${(submittedQuestions.size / Math.max(questions.length, 1)) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Leaderboard sidebar */}
          {showLeaderboard && (
            <div className="hidden lg:block fixed right-4 xl:right-auto xl:left-[calc(50%+20rem)] top-32 bottom-4 w-72 animate-slide-up bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
              <EventLeaderboardSidebar leaderboard={leaderboard} connected={connected} activeParticipants={activeParticipants} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveEventPage;
