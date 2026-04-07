import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { login as loginAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex bg-surface-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-surface-50 p-12 relative overflow-hidden border-r border-surface-200">
        <div className="absolute inset-0 bg-hero-gradient" />
        {/* Decorative circles */}
        <div className="bg-blob blob-blue -top-20 -left-20" />
        <div className="bg-blob blob-purple -bottom-20 -right-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-txt-primary">LearnEarn</span>
          </div>
          <h1 className="text-4xl font-bold text-txt-primary leading-tight mb-4">
            Learn. Earn. <span className="text-gradient">Level Up.</span>
          </h1>
          <p className="text-txt-secondary text-lg leading-relaxed max-w-sm">
            Master in-demand skills through AI-powered courses, earn XP & coins, and get certified.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: "🎯", label: "Guided Skill Paths" },
            { icon: "🤖", label: "AI-Powered Quizzes" },
            { icon: "🏆", label: "Real Certificates" },
          ].map((item) => (
            <div key={item.label} className="bg-white/60 border border-surface-200 p-4 text-center rounded-2xl shadow-sm backdrop-blur-sm">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs text-txt-secondary font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-txt-primary">LearnEarn</span>
          </div>

          <h2 className="text-3xl font-bold text-txt-primary mb-2">Welcome back</h2>
          <p className="text-txt-secondary mb-8 font-medium">Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-txt-secondary font-semibold mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-tertiary" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-txt-secondary font-semibold mb-2 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-tertiary" />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="input-field pl-11 pr-11"
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
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-txt-secondary mt-8 text-sm font-medium">
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