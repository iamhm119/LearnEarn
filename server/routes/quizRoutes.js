const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getQuizByModule,
  createQuiz,
  submitQuiz
} = require("../controllers/quizController");

// 🔹 Routes
router.get("/:moduleId", auth, getQuizByModule);
router.post("/", auth, createQuiz);
router.post("/submit", auth, submitQuiz);

module.exports = router;