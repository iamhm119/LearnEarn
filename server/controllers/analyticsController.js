const User = require("../models/User");
const Certificate = require("../models/Certificate");
const Course = require("../models/Course");

// GET /api/analytics — full stats for authenticated user
exports.getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("completedCourses", "title thumbnail category")
      .populate("completedModules", "title")
      .populate("enrolledPaths", "title thumbnail");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Average score from quizScores history
    const scores = user.quizScores || [];
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length)
        : 0;

    // Certificates
    const certificates = await Certificate.find({ userId: user._id })
      .populate("courseId", "title thumbnail category difficulty")
      .sort({ issuedAt: -1 });

    const analytics = {
      // Profile
      name: user.name,
      email: user.email,
      role: user.role,
      joinedAt: user.createdAt,

      // Gamification
      coins: user.coins,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges,

      // Learning stats
      totalEnrolledPaths: user.enrolledPaths?.length || 0,
      totalCoursesCompleted: user.completedCourses?.length || 0,
      totalModulesCompleted: user.completedModules?.length || 0,
      totalQuizzesAttempted: scores.length,
      avgScore,

      // Lists
      enrolledPaths: user.enrolledPaths,
      completedCourses: user.completedCourses,
      certificates,
      recentScores: scores.slice(-10).reverse(), // last 10
    };

    res.json({ success: true, analytics });
  } catch (err) {
    console.error("getUserAnalytics error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};