const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");
const { getAllCourses, getCourseById, createCourse } = require("../controllers/courseController");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
};

router.get("/", optionalAuth, getAllCourses);
router.get("/:id", optionalAuth, getCourseById);
router.post("/", auth, createCourse);

module.exports = router;