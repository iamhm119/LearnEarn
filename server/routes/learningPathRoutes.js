const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");
const {
  getAllPaths,
  getPathById,
  enrollInPath,
  getPathProgress,
  createPath,
} = require("../controllers/learningPathController");

// Optional auth — attaches req.user if token present but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      // ignore invalid tokens
    }
  }
  next();
};

router.get("/", optionalAuth, getAllPaths);
router.get("/:id", optionalAuth, getPathById);
router.post("/:id/enroll", auth, enrollInPath);
router.get("/:id/progress", auth, getPathProgress);
router.post("/", auth, createPath);

module.exports = router;
