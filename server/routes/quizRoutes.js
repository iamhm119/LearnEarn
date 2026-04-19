const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getQuizByModule,
  createQuiz,
  submitQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

// ⚠️ Static routes MUST come before dynamic /:param routes to avoid conflicts
router.post("/submit", auth, submitQuiz);        // POST   /quiz/submit
router.post("/", auth, createQuiz);              // POST   /quiz
router.get("/:moduleId", auth, getQuizByModule); // GET    /quiz/:moduleId
router.delete("/:moduleId", auth, deleteQuiz);   // DELETE /quiz/:moduleId  (admin: clear stale cache)

module.exports = router;