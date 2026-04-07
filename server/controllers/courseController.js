const Course = require("../models/Course");
const Module = require("../models/Module");
const User = require("../models/User");

// GET /api/courses — list all published courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, difficulty, learningPath } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (learningPath) filter.learningPath = learningPath;

    const courses = await Course.find(filter)
      .populate("instructor", "name")
      .populate("modules", "_id title order")
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/courses/:id — single course with modules & progress
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
      });

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    // Compute completion progress + lock status for authenticated user
    let userProgress = null;
    if (req.user) {
      const user = await User.findById(req.user.id).select("completedModules");
      const completedIds = (user?.completedModules || []).map(String);

      const modulesWithStatus = (course.modules || []).map((m, index) => {
        const isCompleted = completedIds.includes(String(m._id));
        // First module always unlocked; rest need previous to be completed
        const prevModuleId = index > 0 ? String(course.modules[index - 1]._id) : null;
        const isLocked = index > 0 && !completedIds.includes(prevModuleId);

        return {
          ...m.toObject(),
          isCompleted,
          isLocked,
        };
      });

      const completedCount = modulesWithStatus.filter((m) => m.isCompleted).length;

      userProgress = {
        completedModules: completedCount,
        totalModules: modulesWithStatus.length,
        percentage:
          modulesWithStatus.length > 0
            ? Math.round((completedCount / modulesWithStatus.length) * 100)
            : 0,
        modules: modulesWithStatus,
      };
    }

    res.json({ success: true, course, userProgress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/courses — create new course
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user.id });
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};