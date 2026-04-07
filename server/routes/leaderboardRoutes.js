const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getLeaderboard } = require("../controllers/leaderboardController");

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

router.get("/", optionalAuth, getLeaderboard);

module.exports = router;
