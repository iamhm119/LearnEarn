import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { register as registerAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields"); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match"); return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters"); return;
    }
    setLoading(true);
    try {
      const res = await registerAPI(form);
      login(res.data.user, res.data.token);
      toast.success("Account created! Welcome to LearnEarn 🎉");
      navigate("/learning-paths");
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", type: "text", label: "Full Name", placeholder: "John Doe", icon: <User size={18} /> },
    { name: "email", type: "email", label: "Email", placeholder: "you@example.com", icon: <Mail size={18} /> },
    { name: "password", type: showPass ? "text" : "password", label: "Password", placeholder: "Min. 8 characters", icon: <Lock size={18} />, toggle: true },
    { name: "confirmPassword", type: showPass ? "text" : "password", label: "Confirm Password", placeholder: "Repeat password", icon: <Lock size={18} /> },
  ];

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-surface-50 p-12 relative overflow-hidden border-r border-surface-200">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="bg-blob blob-purple -top-20 -right-20" />
        <div className="bg-blob blob-blue -bottom-20 -left-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-txt-primary">LearnEarn</span>
          </div>
          <h1 className="text-4xl font-bold text-txt-primary leading-tight mb-4">
            Start your <span className="text-gradient">journey</span> today
          </h1>
          <p className="text-txt-secondary text-lg leading-relaxed max-w-sm">
            Join thousands of learners earning XP, coins, and certificates on their path to expertise.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: "⚡", title: "Earn XP & Level Up", desc: "Track your progress through Beginner → Advanced" },
            { icon: "🏆", title: "Leaderboard Rankings", desc: "Compete with peers and showcase your rank" },
            { icon: "📜", title: "Verifiable Certificates", desc: "Share your achievements with a unique ID" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 bg-white/60 border border-surface-200 p-4 rounded-2xl shadow-sm backdrop-blur-sm">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-txt-primary">{item.title}</p>
                <p className="text-[13px] text-txt-secondary">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-txt-primary">LearnEarn</span>
          </div>

          <h2 className="text-3xl font-bold text-txt-primary mb-2">Create account</h2>
          <p className="text-txt-secondary mb-8 font-medium">It's free and always will be.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm text-txt-secondary font-semibold mb-2 block">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-tertiary">{field.icon}</span>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="input-field pl-11 pr-11"
                    autoComplete={field.name === "name" ? "name" : field.name === "email" ? "email" : "new-password"}
                  />
                  {field.toggle && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-tertiary hover:text-txt-secondary transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !mt-6">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-txt-secondary mt-8 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
