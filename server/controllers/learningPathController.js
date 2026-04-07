const LearningPath = require("../models/LearningPath");
const Course = require("../models/Course");
const User = require("../models/User");
const Module = require("../models/Module");

// GET /api/learning-paths — list all published paths
exports.getAllPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find({ isPublished: true })
      .populate({
        path: "courses",
        select: "title difficulty thumbnail estimatedHours modules",
        populate: { path: "modules", select: "_id" },
      })
      .sort({ createdAt: -1 });

    // Attach enrollment status if user is authenticated
    let enrolledIds = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select("enrolledPaths");
      enrolledIds = (user?.enrolledPaths || []).map(String);
    }

    const result = paths.map((p) => ({
      ...p.toObject(),
      totalCourses: p.courses?.length || 0,
      totalModules: p.courses?.reduce((sum, c) => sum + (c.modules?.length || 0), 0) || 0,
      isEnrolled: enrolledIds.includes(String(p._id)),
    }));

    res.json({ success: true, paths: result });
  } catch (err) {
    console.error("getAllPaths error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/learning-paths/:id — single path details
exports.getPathById = async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id).populate({
      path: "courses",
      select: "title description difficulty thumbnail estimatedHours modules category",
      populate: {
        path: "modules",
        select: "title description order xpReward coinReward",
        options: { sort: { order: 1 } },
      },
    });

    if (!path) {
      return res.status(404).json({ success: false, error: "Learning path not found" });
    }

    // Progress calculation for authenticated user
    let progress = null;
    if (req.user) {
      const user = await User.findById(req.user.id).select("completedModules enrolledPaths");
      const completedIds = (user?.completedModules || []).map(String);
      const enrolledIds = (user?.enrolledPaths || []).map(String);

      const allModules = (path.courses || []).flatMap(
        (c) => (c.modules || []).map((m) => String(m._id || m))
      );

      const completedCount = allModules.filter((id) => completedIds.includes(id)).length;
      const totalCount = allModules.length;

      progress = {
        isEnrolled: enrolledIds.includes(String(path._id)),
        completedModules: completedCount,
        totalModules: totalCount,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      };
    }

    res.json({ success: true, path, progress });
  } catch (err) {
    console.error("getPathById error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/learning-paths/:id/enroll — enroll authenticated user
exports.enrollInPath = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const path = await LearningPath.findById(req.params.id);
    if (!path) return res.status(404).json({ success: false, error: "Path not found" });

    const alreadyEnrolled = user.enrolledPaths.map(String).includes(String(path._id));
    if (alreadyEnrolled) {
      return res.json({ success: true, message: "Already enrolled", alreadyEnrolled: true });
    }

    user.enrolledPaths.push(path._id);
    await user.save();

    res.json({ success: true, message: "Enrolled successfully", alreadyEnrolled: false });
  } catch (err) {
    console.error("enrollInPath error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/learning-paths/:id/progress — detailed progress for user
exports.getPathProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("completedModules completedCourses enrolledPaths");
    const path = await LearningPath.findById(req.params.id).populate({
      path: "courses",
      select: "title modules",
      populate: { path: "modules", select: "_id title order" },
    });

    if (!path) return res.status(404).json({ success: false, error: "Path not found" });

    const completedModuleIds = (user?.completedModules || []).map(String);
    const completedCourseIds = (user?.completedCourses || []).map(String);

    const coursesProgress = (path.courses || []).map((course) => {
      const modules = (course.modules || []).map((m) => ({
        _id: m._id,
        title: m.title,
        order: m.order,
        isCompleted: completedModuleIds.includes(String(m._id)),
        isLocked: m.order > 0 && !completedModuleIds.includes(
          String((course.modules[m.order - 1] || {})._id)
        ),
      }));

      return {
        _id: course._id,
        title: course.title,
        isCompleted: completedCourseIds.includes(String(course._id)),
        modules,
        completedModules: modules.filter((m) => m.isCompleted).length,
        totalModules: modules.length,
      };
    });

    const totalModules = coursesProgress.reduce((s, c) => s + c.totalModules, 0);
    const completedModules = coursesProgress.reduce((s, c) => s + c.completedModules, 0);

    res.json({
      success: true,
      isEnrolled: (user?.enrolledPaths || []).map(String).includes(String(path._id)),
      percentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      completedModules,
      totalModules,
      coursesProgress,
    });
  } catch (err) {
    console.error("getPathProgress error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/learning-paths — create new path (admin)
exports.createPath = async (req, res) => {
  try {
    const path = await LearningPath.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, path });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
