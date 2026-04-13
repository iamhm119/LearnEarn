import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap, Clock, Users, ArrowRight, Calendar,
  Flame, Tag, Award, ArrowLeft, Radio, CheckCircle2
} from "lucide-react";
import Navbar from "../components/Navbar";
import { PageLoader } from "../components/LoadingSpinner";
import { getEvents, registerForEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const statusConfig = {
  live: {
    label: "LIVE NOW",
    bg: "bg-danger-50 border-danger-200",
    text: "text-danger-600",
    badge: "bg-danger-50 flexitems-center gap-1.5 text-danger-600 border border-danger-200 shadow-sm",
  },
  upcoming: {
    label: "Upcoming",
    bg: "bg-warning-50 border-warning-200",
    text: "text-warning-600",
    badge: "bg-warning-50 flex items-center gap-1 text-warning-700 border border-warning-200 shadow-sm",
  },
  ended: {
    label: "Ended",
    bg: "bg-surface-50 border-surface-200",
    text: "text-txt-tertiary",
    badge: "bg-surface-100 flex items-center gap-1 text-txt-secondary border border-surface-200",
  },
};

const gradientMap = {
  "from-blue-500 to-cyan-500": "from-brand-500 to-cyan-500",
  "from-emerald-500 to-teal-600": "from-success-500 to-teal-600",
  "from-purple-500 to-pink-600": "from-purple-500 to-pink-500",
  "from-brand-500 to-purple-600": "from-brand-500 to-purple-600",
  "from-orange-500 to-red-500": "from-orange-500 to-danger-500",
  "from-sky-500 to-indigo-600": "from-sky-500 to-indigo-600",
  "from-orange-500 to-red-600": "from-orange-500 to-danger-600",
};

const EventsPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data.events || []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      await registerForEvent(eventId);
      toast.success("Successfully registered! 🎉");
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setRegistering(null);
    }
  };

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((e) => e.status === filter);

  const liveCount = events.filter((e) => e.status === "live").length;
  const upcomingCount = events.filter((e) => e.status === "upcoming").length;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (startTime) => {
    const diff = new Date(startTime) - new Date();
    if (diff <= 0) return "Starting now";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="bg-blob blob-purple -top-24 -right-24" />
      <div className="bg-blob blob-blue top-1/2 -left-24" />
      
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost flex items-center gap-2 -ml-4"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        <div className="text-center mb-12 animate-slide-up">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/20 animate-float">
            <Radio size={32} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-txt-primary mb-3 tracking-tight">
            Live <span className="text-brand-600">Events</span>
          </h1>
          <p className="text-txt-secondary text-base max-w-2xl mx-auto">
            Compete in real-time coding challenges hosted by top companies.
            Win internships, XP, and coins!
          </p>

          {/* Live indicator */}
          {liveCount > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 bg-danger-50 text-danger-600 px-4 py-2 rounded-full border border-danger-100 animate-pulse-soft shadow-sm">
              <span className="w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
              <span className="font-semibold text-xs tracking-wide uppercase">
                {liveCount} live right now
              </span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { key: "all", label: `All (${events.length})` },
            { key: "live", label: `Live (${liveCount})` },
            { key: "upcoming", label: `Upcoming (${upcomingCount})` },
            {
              key: "ended",
              label: `Ended (${events.filter((e) => e.status === "ended").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200
                ${
                  filter === tab.key
                    ? "bg-txt-primary text-white shadow-sm"
                    : "bg-surface-50 text-txt-secondary hover:bg-surface-100 border border-surface-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Event cards */}
        {filteredEvents.length === 0 ? (
          <div className="card-flat text-center py-16 animate-fade-in">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-surface-200 flex items-center justify-center mx-auto mb-4">
              <Radio size={24} className="text-txt-tertiary" />
            </div>
            <p className="text-txt-primary font-bold text-lg mb-1">
              No {filter === "all" ? "" : filter} events
            </p>
            <p className="text-txt-secondary text-sm">
              Check back soon for new competitions!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, idx) => {
              const cfg = statusConfig[event.status] || statusConfig.upcoming;
              const gradient = gradientMap[event.coverGradient] || "from-brand-500 to-purple-600";
              const isRegistered = !!event.registrationStatus;

              return (
                <div
                  key={event._id}
                  className="card group flex flex-col p-5 animate-slide-up hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Card Header w/ Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner`}>
                         <Award className="text-white/90" size={18} />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-txt-tertiary uppercase tracking-wider">Company</p>
                         <p className="text-sm font-bold text-txt-primary leading-none">{event.company}</p>
                       </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                       {event.status === "live" && <span className="w-1.5 h-1.5 bg-danger-500 rounded-full animate-pulse inline-block mr-1" />}
                       {cfg.label}
                    </div>
                  </div>

                  {/* Card body */}
                  <h3 className="text-lg font-bold text-txt-primary mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-[13px] text-txt-secondary mb-5 line-clamp-2 leading-relaxed flex-grow">
                    {event.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {event.skills?.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-100 text-txt-secondary text-[11px] font-semibold"
                      >
                        <Tag size={10} />
                        {skill}
                      </span>
                    ))}
                    {event.skills?.length > 3 && (
                      <span className="text-[11px] font-semibold text-txt-tertiary bg-surface-50 border border-surface-200 px-2 py-1 rounded">
                        +{event.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Event details items */}
                  <div className="bg-surface-50 rounded-xl border border-surface-200 p-3 grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] font-semibold text-txt-secondary mb-5">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-txt-tertiary"/>
                      <span className="truncate" title={formatDate(event.startTime)}>{formatDate(event.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-txt-tertiary"/>
                      <span>{event.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-txt-tertiary"/>
                      <span>
                        {event.participantCount || 0}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-warning-600">
                      <Zap size={13} />
                      <span>{event.rewards?.xp} XP • {event.rewards?.coins} <span className="font-normal text-[10px]">🪙</span></span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-2 border-t border-surface-100">
                    {event.status === "live" && isRegistered ? (
                      <Link
                        to={`/events/${event._id}`}
                        className="btn-primary w-full text-sm flex items-center justify-center gap-2 py-2.5"
                      >
                        <Flame size={16} />
                        Join Live Now
                        <ArrowRight size={14} />
                      </Link>
                    ) : event.status === "live" && !isRegistered ? (
                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={registering === event._id}
                        className="btn-primary w-full text-sm flex items-center justify-center gap-2 py-2.5 bg-danger-600 hover:bg-danger-700"
                      >
                        {registering === event._id ? (
                          <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Registering...</>
                        ) : (
                          <>
                            Register & Join <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    ) : event.status === "upcoming" ? (
                      isRegistered ? (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-success-600 bg-success-50 border border-success-100 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 size={14} strokeWidth={3} /> Registered
                          </span>
                          <span className="text-[10px] font-bold text-txt-secondary bg-surface-100 px-2 py-1.5 rounded-lg">
                            in {getTimeRemaining(event.startTime)}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(event._id)}
                          disabled={registering === event._id}
                          className="btn-secondary w-full text-sm flex items-center justify-center gap-2 py-2.5"
                        >
                          {registering === event._id ? (
                            <><span className="w-3.5 h-3.5 border-2 border-brand-500/40 border-t-brand-600 rounded-full animate-spin" /> Registering...</>
                          ) : (
                            <>
                              Register Now <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      )
                    ) : (
                      <Link
                        to={`/events/${event._id}`}
                        className="btn-ghost w-full bg-surface-50 text-center text-[13px] font-semibold flex items-center justify-center gap-2 py-2.5 text-txt-secondary"
                      >
                        View Results <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
