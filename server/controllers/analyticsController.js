const User = require("../models/User");
const Certificate = require("../models/Certificate");
const Course = require("../models/Course");

// GET /api/analytics — full stats for authenticated user
exports.getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("completedCourses", "title thumbnail category")
      .populate("completedModules", "title")
      .populate("enrolledPaths", "title thumbnail")
      .populate({
        path: "quizScores.moduleId",
        select: "title courseId",
        populate: {
          path: "courseId",
          select: "category",
        },
      });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // ── Average score analysis ──
    const scores = user.quizScores || [];
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length)
        : 0;

    // ── Skill & Interest breakdown (by course category) ──
    const categoryStats = {};
    
    // Track Interest (Modules completed)
    user.completedModules.forEach(mod => {
        // We need to know which category this module belongs to.
        // If the population worked, we can check it.
        // Actually, let's look at completedModules in the user model populate.
    });

    // Let's use quizScores as the primary source for categories for now, 
    // but also factor in completedCourses for interest.
    
    scores.forEach((s) => {
      const category = s.moduleId?.courseId?.category || "Other";
      if (!categoryStats[category]) {
        categoryStats[category] = { totalScore: 0, quizCount: 0, modulesCompleted: 0 };
      }
      categoryStats[category].totalScore += s.percentage;
      categoryStats[category].quizCount += 1;
    });

    // Add module completion counts to categories
    // This requires us to have course category info on completedModules.
    // For simplicity, let's assume interest is proportional to Quiz attempts for now,
    // or better, I will populate the completedCourses to get their categories.
    user.completedCourses.forEach(course => {
        const cat = course.category || "Other";
        if (!categoryStats[cat]) categoryStats[cat] = { totalScore: 0, quizCount: 0, modulesCompleted: 0 };
        categoryStats[cat].modulesCompleted += 5; // Weighted interest
    });

    const skillBreakdown = Object.keys(categoryStats).map((cat) => ({
      subject: cat,
      mastery: categoryStats[cat].quizCount > 0 
        ? Math.round(categoryStats[cat].totalScore / categoryStats[cat].quizCount) 
        : 0,
      interest: Math.min(100, (categoryStats[cat].quizCount * 10) + (categoryStats[cat].modulesCompleted * 2)), 
      fullMark: 100,
    }));

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
      skillBreakdown, // Added skill breakdown

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