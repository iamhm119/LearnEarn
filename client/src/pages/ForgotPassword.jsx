import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Mail, CheckCircle2, ArrowRight, GraduationCap } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/auth/forgotpassword`, { email });
      if (data.success) {
        toast.success(data.message || "Password reset email sent!");
        setSent(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
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

        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border ${
            sent ? "bg-success-50 border-success-200" : "bg-brand-50 border-brand-100"
          }`}>
            {sent ? <CheckCircle2 size={32} className="text-success-500" /> : <Mail size={32} className="text-brand-600" />}
          </div>
          <h1 className="text-2xl font-extrabold text-txt-primary mb-2 tracking-tight">
            {sent ? "Check Your Email" : "Reset Password"}
          </h1>
          <p className="text-txt-secondary font-medium text-sm">
            {sent ? "We've sent a link to recover your account to your email address." : "Enter your email to receive a password reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-txt-secondary mb-2">
                Email Address
              </label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused ? 'ring-2 ring-brand-100 shadow-glow' : ''}`}>
                <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-brand-500' : 'text-txt-tertiary'}`} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="input-field w-full pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2 py-3.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>Send Reset Link <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-surface-50/80 border border-surface-200/60 rounded-2xl p-4 mb-6">
              <strong className="text-txt-primary font-bold block">{email}</strong>
            </div>
            <button
              onClick={() => setSent(false)}
              className="text-brand-600 hover:text-brand-700 text-sm font-bold transition-colors"
            >
              Try another email?
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm font-medium text-txt-secondary">
          Remember your password?{" "}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
