const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");
const { getModulesByCourse, getModuleById, createModule } = require("../controllers/moduleController");

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

router.get("/course/:courseId", optionalAuth, getModulesByCourse);
router.get("/:id", optionalAuth, getModuleById);
router.post("/", auth, createModule);

module.exports = router;