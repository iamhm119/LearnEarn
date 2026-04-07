import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RewardStore from "./pages/RewardStore";

// Pages
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardPage from "./pages/DashBoard";
import LearningPathsPage from "./pages/LearningPathsPage";
import LearningPathDetailPage from "./pages/LearningPathDetailPage";
import CoursePage from "./pages/CoursePage";
import ModulePage from "./pages/ModulePage";
import QuizPage from "./pages/QuizPage";
import LeaderboardPage from "./pages/LeaderBoard";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import LiveEventPage from "./pages/LiveEventPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#1e293b" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
          <Route path="/store" element={<RewardStore />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/learning-paths" element={<ProtectedRoute><LearningPathsPage /></ProtectedRoute>} />
          <Route path="/learning-paths/:pathId" element={<ProtectedRoute><LearningPathDetailPage /></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
          <Route path="/modules/:moduleId" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
          <Route path="/quiz/:moduleId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><LiveEventPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;