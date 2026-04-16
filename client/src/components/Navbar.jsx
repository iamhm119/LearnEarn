import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen, LayoutDashboard, Trophy, User,
  Zap, Flame, LogOut, Menu, X, GraduationCap, ShoppingCart, Radio,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => { logout(); navigate("/login"); };

  // Track scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { to: "/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { to: "/learning-paths", icon: <BookOpen size={16} />, label: "Paths" },
    { to: "/leaderboard", icon: <Trophy size={16} />, label: "Leaderboard" },
    { to: "/events", icon: <Radio size={16} />, label: "Events" },
    { to: "/store", icon: <ShoppingCart size={16} />, label: "Store" },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const xpToNextLevel = user?.level === "Beginner" ? 200 : user?.level === "Intermediate" ? 500 : 1000;
  const currentXp = user?.xp || 0;
  const xpProgress = Math.min((currentXp / xpToNextLevel) * 100, 100);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 backdrop-blur-2xl shadow-nav border-b border-surface-200/60'
        : 'bg-white/60 backdrop-blur-xl border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[58px]">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-txt-primary hidden sm:block tracking-tight">
              Learn<span className="text-brand-600">Earn</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${isActive(link.to)
                    ? "bg-brand-50/80 text-brand-700 shadow-sm border border-brand-100/50"
                    : "text-txt-secondary hover:text-txt-primary hover:bg-surface-100/80"}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Stats + Profile */}
          <div className="hidden md:flex items-center gap-2">
            {/* XP pill */}
            <div className="flex items-center gap-2 bg-surface-50/80 backdrop-blur-sm border border-surface-200/60 rounded-xl px-3 py-1.5">
              <Zap size={13} className="text-warning-500" />
              <div>
                <div className="text-[11px] text-txt-tertiary font-medium leading-none mb-1">{currentXp} XP</div>
                <div className="w-16 h-1.5 bg-surface-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-warning-400 to-warning-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1.5 bg-surface-50/80 backdrop-blur-sm border border-surface-200/60 rounded-xl px-2.5 py-1.5">
              <span className="text-sm">🪙</span>
              <span className="text-[13px] font-bold text-txt-primary">{user?.coins || 0}</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-surface-50/80 backdrop-blur-sm border border-surface-200/60 rounded-xl px-2.5 py-1.5">
              <Flame size={13} className="text-orange-500" />
              <span className="text-[13px] font-bold text-txt-primary">{user?.streak || 0}</span>
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200
                  ${profileOpen ? "bg-surface-100/80 shadow-sm" : "hover:bg-surface-100/80"}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white/80">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-[13px] text-txt-primary max-w-[80px] truncate font-medium">{user?.name}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-2xl border border-surface-200/60 rounded-2xl shadow-elevated overflow-hidden animate-scale-in z-50">
                  <div className="px-4 py-3 border-b border-surface-100 bg-surface-50/50">
                    <p className="text-sm font-bold text-txt-primary truncate">{user?.name}</p>
                    <p className="text-xs text-txt-tertiary truncate">{user?.email}</p>
                    <span className={`badge mt-1.5 ${user?.level === "Advanced" ? "badge-purple" : user?.level === "Intermediate" ? "badge-blue" : "badge-green"}`}>
                      {user?.level || "Beginner"}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-txt-secondary hover:bg-surface-50 hover:text-brand-600 transition-colors"
                  >
                    <User size={15} /> Profile & Analytics
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 w-full transition-colors"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-surface-100/80 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-100/60 py-3 animate-fade-in bg-white/90 backdrop-blur-2xl rounded-b-2xl">
            <div className="flex items-center gap-3 mb-3 px-2 pb-3 border-b border-surface-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center font-bold text-white text-sm shadow-sm ring-2 ring-white/80">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-txt-primary">{user?.name}</p>
                <span className="badge badge-blue">{user?.level || "Beginner"}</span>
              </div>
              <div className="ml-auto flex items-center gap-2 text-sm">
                <span className="text-txt-secondary">🪙 {user?.coins || 0}</span>
                <span className="text-txt-secondary">🔥 {user?.streak || 0}</span>
              </div>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-colors
                  ${isActive(link.to) ? "bg-brand-50/80 text-brand-700" : "text-txt-secondary hover:text-txt-primary hover:bg-surface-50"}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <div className="border-t border-surface-100 mt-2 pt-2">
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-surface-50 rounded-xl">
                <User size={16} /> Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-danger-500 hover:bg-danger-50 rounded-xl w-full">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
