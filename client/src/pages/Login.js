import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { login as loginAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const FloatingOrb = ({ className, delay = 0 }) => (
  <div
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={{
      animation: `float ${6 + delay}s ease-in-out infinite ${delay}s, morph 8s ease-in-out infinite ${delay}s`,
      filter: 'blur(60px)',
    }}
  />
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await loginAPI(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 relative overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Animated mesh background */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 dot-grid opacity-[0.03]" />

        {/* Floating orbs */}
        <FloatingOrb className="bg-brand-400/10 w-[400px] h-[400px] -top-20 -left-20" delay={0} />
        <FloatingOrb className="bg-purple-400/8 w-[350px] h-[350px] bottom-20 right-10" delay={2} />
        <FloatingOrb className="bg-pink-300/6 w-[250px] h-[250px] top-1/2 left-1/3" delay={4} />

        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-2xl flex items-center justify-center shadow-glow">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-txt-primary tracking-tight">Learn<span className="text-brand-600">Earn</span></span>
          </div>
          <h1 className="text-5xl font-extrabold text-txt-primary leading-[1.15] mb-5 tracking-tight">
            Learn. Earn.{" "}
            <span className="text-gradient-animated bg-[length:200%_auto]">Level Up.</span>
          </h1>
          <p className="text-txt-secondary text-lg leading-relaxed max-w-md">
            Master in-demand skills through AI-powered courses, earn XP & coins, and get certified — all in one platform.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {[
            { icon: <Sparkles size={20} className="text-brand-500" />, label: "Guided Skill Paths", desc: "Structured learning" },
            { icon: <Zap size={20} className="text-warning-500" />, label: "AI-Powered Quizzes", desc: "Smart assessments" },
            { icon: <Shield size={20} className="text-success-500" />, label: "Real Certificates", desc: "Verified credentials" },
          ].map((item) => (
            <div
              key={item.label}
              className="group bg-white/70 backdrop-blur-md border border-white/40 p-5 text-center rounded-2xl shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <p className="text-sm text-txt-primary font-bold mb-0.5">{item.label}</p>
              <p className="text-[11px] text-txt-tertiary font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-brand-50/30" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-glow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-txt-primary tracking-tight">Learn<span className="text-brand-600">Earn</span></span>
          </div>

          <h2 className="text-3xl font-extrabold text-txt-primary mb-2 tracking-tight">Welcome back</h2>
          <p className="text-txt-secondary mb-8 font-medium">Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <label className="text-sm text-txt-secondary font-semibold mb-2 block">Email</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'email' ? 'ring-2 ring-brand-100 shadow-glow' : ''}`}>
                <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'email' ? 'text-brand-500' : 'text-txt-tertiary'}`} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  className="input-field pl-12"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <label className="text-sm text-txt-secondary font-semibold mb-2 block">Password</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-brand-100 shadow-glow' : ''}`}>
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'password' ? 'text-brand-500' : 'text-txt-tertiary'}`} />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Your password"
                  className="input-field pl-12 pr-12"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-tertiary hover:text-txt-secondary transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 transition-colors font-semibold">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-[15px] animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-txt-secondary mt-8 text-sm font-medium animate-fade-in" style={{ animationDelay: '300ms' }}>
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;