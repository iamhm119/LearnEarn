import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="bg-blob blob-purple -top-20 -left-20" />
        <div className="bg-blob blob-blue -bottom-20 -right-20" />
      </div>

      <div className="premium-card w-full max-w-md p-8 sm:p-10 z-10 animate-slide-up shadow-elevated bg-white border border-surface-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-brand-100">
            {sent ? <CheckCircle2 size={32} className="text-success-500" /> : <Mail size={32} className="text-brand-600" />}
          </div>
          <h1 className="text-3xl font-black text-txt-primary mb-3">
            {sent ? "Check Your Email" : "Reset Password"}
          </h1>
          <p className="text-txt-secondary font-medium">
            {sent ? "We've sent a link to recover your account to your email address." : "Enter your email to receive a password reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-txt-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>Send Reset Link <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4 mb-6 shadow-inner">
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
