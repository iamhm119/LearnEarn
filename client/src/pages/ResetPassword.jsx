import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Lock, ArrowRight, GraduationCap } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { resettoken } = useParams();
  const navigate = useNavigate();
  useAuth(); // If they auto login, or just use navigate

  const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put(`${backendUrl}/auth/resetpassword/${resettoken}`, {
        password,
        confirmPassword,
      });

      if (data.success) {
        toast.success("Password updated successfully!");
        
        if (data.token) {
           localStorage.setItem("token", data.token);
           navigate("/dashboard");
           window.location.reload();
        } else {
           navigate("/login");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 dot-grid opacity-[0.02] pointer-events-none" />

      <div className="premium-card w-full max-w-md p-8 sm:p-10 z-10 animate-fade-in-up shadow-elevated bg-white/90 backdrop-blur-md border border-surface-200/60">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-glow">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg text-txt-primary tracking-tight">Learn<span className="text-brand-600">Earn</span></span>
        </div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100">
            <Lock size={32} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-txt-primary mb-2 tracking-tight">
            New Password
          </h1>
          <p className="text-txt-secondary font-medium text-sm">
            Enter your new secure password below to regain access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-txt-secondary mb-2">
              New Password
            </label>
            <div className={`relative rounded-xl transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-brand-100 shadow-glow' : ''}`}>
              <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'password' ? 'text-brand-500' : 'text-txt-tertiary'}`} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                className="input-field w-full pl-12"
                placeholder="Min. 8 characters"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-txt-secondary mb-2">
              Confirm New Password
            </label>
            <div className={`relative rounded-xl transition-all duration-300 ${focused === 'confirm' ? 'ring-2 ring-brand-100 shadow-glow' : ''}`}>
              <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'confirm' ? 'text-brand-500' : 'text-txt-tertiary'}`} />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
                className="input-field w-full pl-12"
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 !mt-6"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resetting...
              </>
            ) : (
              <>Confirm Reset <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-txt-secondary">
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
