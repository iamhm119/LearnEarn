const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Course = require("../models/Course");
const { sendCertificateEmail } = require("../utils/sendCertificate");

// POST /api/certificates/generate/:courseId — manually trigger cert generation
exports.generateCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Verify user has completed the course
    const user = await User.findById(userId).select("completedCourses completedModules");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const course = await Course.findById(courseId).populate("modules", "_id");
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    // Check all modules completed
    const allModuleIds = (course.modules || []).map((m) => String(m._id || m));
    const completedIds = (user.completedModules || []).map(String);
    const allDone = allModuleIds.every((id) => completedIds.includes(id));

    if (!allDone) {
      return res.status(400).json({
        success: false,
        error: "Complete all modules first to earn this certificate",
      });
    }

    // Idempotent — don't duplicate
    let isNew = false;
    let cert = await Certificate.findOne({ userId, courseId });
    if (!cert) {
      cert = await Certificate.create({ userId, courseId });
      isNew = true;

      // Also mark course completed on user
      if (!user.completedCourses.map(String).includes(courseId)) {
        user.completedCourses.push(courseId);
        await user.save();
      }
    }

    const populated = await Certificate.findById(cert._id)
      .populate("courseId", "title description category difficulty")
      .populate("userId", "name email");
      
    if (isNew) {
       // Send the certificate email asynchronously
       sendCertificateEmail(populated.userId, populated.courseId, populated.certificateId);
    }

    res.status(201).json({ success: true, certificate: populated });
  } catch (err) {
    console.error("generateCertificate error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/certificates/user — list all certificates for authenticated user
exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user.id })
      .populate("courseId", "title description category difficulty thumbnail")
      .sort({ issuedAt: -1 });

    res.json({ success: true, certificates });
  } catch (err) {
    console.error("getUserCertificates error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/certificates/:certificateId/email — send cert via email
exports.emailCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("courseId", "title description category difficulty")
      .populate("userId", "name email");

    if (!cert) return res.status(404).json({ success: false, error: "Certificate not found" });

    // Send the email
    await sendCertificateEmail(cert.userId, cert.courseId, cert.certificateId);
    
    res.json({ success: true, message: "Certificate sent to your email!" });
  } catch (err) {
    console.error("emailCertificate error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user.id })
      .populate("courseId", "title description category difficulty thumbnail")
      .sort({ issuedAt: -1 });

    res.json({ success: true, certificates });
  } catch (err) {
    console.error("getUserCertificates error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/certificates/:certificateId — verify by public ID
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("courseId", "title category difficulty")
      .populate("userId", "name");

    if (!cert) return res.status(404).json({ success: false, error: "Certificate not found" });

    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
