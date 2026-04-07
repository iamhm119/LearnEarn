const Module = require("../models/Module");
const Course = require("../models/Course");
const User = require("../models/User");

// GET /api/modules/:id — single module
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate("courseId", "title modules");

    if (!module) {
      return res.status(404).json({ success: false, error: "Module not found" });
    }

    // Lock check — is this module accessible for the user?
    let isLocked = false;
    let isCompleted = false;
    if (req.user && module.courseId) {
      const user = await User.findById(req.user.id).select("completedModules");
      const completedIds = (user?.completedModules || []).map(String);
      isCompleted = completedIds.includes(String(module._id));

      const courseModules = module.courseId.modules || [];
      const index = courseModules.map(String).indexOf(String(module._id));
      if (index > 0) {
        const prevId = String(courseModules[index - 1]);
        isLocked = !completedIds.includes(prevId);
      }
    }

    if (isLocked) {
      return res.status(403).json({
        success: false,
        error: "Complete the previous module first to unlock this one",
        isLocked: true,
      });
    }

    res.json({ success: true, module, isCompleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/modules/course/:courseId — all modules for a course
exports.getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });

    let completedIds = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select("completedModules");
      completedIds = (user?.completedModules || []).map(String);
    }

    const result = modules.map((m, index) => {
      const isCompleted = completedIds.includes(String(m._id));
      const prevId = index > 0 ? String(modules[index - 1]._id) : null;
      const isLocked = index > 0 && !completedIds.includes(prevId);

      return { ...m.toObject(), isCompleted, isLocked };
    });

    res.json({ success: true, modules: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/modules — create module and attach to course
exports.createModule = async (req, res) => {
  try {
    const { courseId, title, content, description, videoUrl, order, xpReward, coinReward } = req.body;

    const module = await Module.create({
      courseId, title, content, description, videoUrl,
      order: order ?? 0, xpReward: xpReward ?? 50, coinReward: coinReward ?? 10,
    });

    // Attach to course
    await Course.findByIdAndUpdate(courseId, { $push: { modules: module._id } });

    res.status(201).json({ success: true, module });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};