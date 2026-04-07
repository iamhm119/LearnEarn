const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");
const {
  getEvents,
  getEvent,
  createEvent,
  registerForEvent,
  submitAnswer,
  reportTabSwitch,
  getEventLeaderboard,
  finalizeEvent,
  getEventFeedback,
  getUserEvents,
} = require("../controllers/eventController");

// Optional auth middleware (for listing events with registration status)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
};

// Public (with optional auth for enrichment)
router.get("/", optionalAuth, getEvents);

// Protected — must be before /:id to avoid 'user' matching as an ID
router.get("/user/history", auth, getUserEvents);

// Public single event + leaderboard
router.get("/:id", optionalAuth, getEvent);
router.get("/:id/leaderboard", getEventLeaderboard);

// Protected
router.post("/", auth, createEvent);
router.post("/:id/register", auth, registerForEvent);
router.post("/:id/submit", auth, submitAnswer);
router.post("/:eventId/tab-switch", auth, reportTabSwitch);
router.post("/:id/finalize", auth, finalizeEvent);
router.get("/:id/feedback", auth, getEventFeedback);

module.exports = router;

