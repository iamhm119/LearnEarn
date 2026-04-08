import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="bg-blob blob-blue -top-20 -left-20" />
        <div className="bg-blob blob-purple -bottom-20 -right-20" />
      </div>

      <div className="premium-card w-full max-w-md p-8 sm:p-10 z-10 animate-slide-up shadow-elevated bg-white border border-surface-200">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-brand-100">
            <Lock size={32} className="text-brand-600" />
          </div>
          <h1 className="text-3xl font-black text-txt-primary mb-3">
            New Password
          </h1>
          <p className="text-txt-secondary font-medium">
            Enter your new secure password below to regain access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-txt-secondary mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-txt-secondary mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
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
                Resetting...
              </>
            ) : (
              "Confirm Reset"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
