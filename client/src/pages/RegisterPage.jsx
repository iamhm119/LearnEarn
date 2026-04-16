import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap, Trophy, ScrollText } from "lucide-react";
import { register as registerAPI } from "../services/api";
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

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

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
    <div className="min-h-screen flex bg-surface-50 relative overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 dot-grid opacity-[0.03]" />

        <FloatingOrb className="bg-purple-400/10 w-[400px] h-[400px] -top-20 -right-20" delay={0} />
        <FloatingOrb className="bg-brand-400/8 w-[350px] h-[350px] bottom-20 left-10" delay={2} />
        <FloatingOrb className="bg-pink-300/6 w-[250px] h-[250px] top-1/3 left-1/2" delay={3} />

        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-2xl flex items-center justify-center shadow-glow">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-txt-primary tracking-tight">Learn<span className="text-brand-600">Earn</span></span>
          </div>
          <h1 className="text-5xl font-extrabold text-txt-primary leading-[1.15] mb-5 tracking-tight">
            Start your{" "}
            <span className="text-gradient-animated bg-[length:200%_auto]">journey</span>{" "}
            today
          </h1>
          <p className="text-txt-secondary text-lg leading-relaxed max-w-md">
            Join thousands of learners earning XP, coins, and certificates on their path to expertise.
          </p>
        </div>

        <div className="relative z-10 space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {[
            { icon: <Zap size={20} className="text-warning-500" />, title: "Earn XP & Level Up", desc: "Track your progress through Beginner → Advanced" },
            { icon: <Trophy size={20} className="text-brand-500" />, title: "Leaderboard Rankings", desc: "Compete with peers and showcase your rank" },
            { icon: <ScrollText size={20} className="text-success-500" />, title: "Verifiable Certificates", desc: "Share your achievements with a unique ID" },
          ].map((item) => (
            <div key={item.title} className="group flex items-center gap-4 bg-white/70 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-txt-primary">{item.title}</p>
                <p className="text-[13px] text-txt-secondary">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-purple-50/30" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-glow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-txt-primary tracking-tight">Learn<span className="text-brand-600">Earn</span></span>
          </div>

          <h2 className="text-3xl font-extrabold text-txt-primary mb-2 tracking-tight">Create account</h2>
          <p className="text-txt-secondary mb-8 font-medium">It's free and always will be.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.name} className="animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 60}ms` }}>
                <label className="text-sm text-txt-secondary font-semibold mb-2 block">{field.label}</label>
                <div className={`relative rounded-xl transition-all duration-300 ${focused === field.name ? 'ring-2 ring-brand-100 shadow-glow' : ''}`}>
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === field.name ? 'text-brand-500' : 'text-txt-tertiary'}`}>{field.icon}</span>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocused(field.name)}
                    onBlur={() => setFocused(null)}
                    placeholder={field.placeholder}
                    className="input-field pl-12 pr-12"
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
              className="btn-primary w-full flex items-center justify-center gap-2 !mt-6 py-3.5 text-[15px]">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-txt-secondary mt-8 text-sm font-medium animate-fade-in" style={{ animationDelay: '400ms' }}>
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
