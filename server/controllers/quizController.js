const Quiz = require("../models/Quiz");
const User = require("../models/User");
const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const { addReward } = require("../utils/rewardService");
const axios = require("axios");
const Module = require("../models/Module");
const { sendCertificateEmail } = require("../utils/sendCertificate");

// ─── GET QUIZ (from DB cache or AI-generate) ─────────────────────────────────
exports.getQuizByModule = async (req, res) => {
  try {
    let quiz = await Quiz.findOne({ moduleId: req.params.moduleId });

    // ✅ Cached — return immediately
    if (quiz) {
      return res.json({ success: true, quiz });
    }

    // 🔍 Fetch module for content
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, error: "Module not found" });
    }

    let questions = [];

    try {
      const aiResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a quiz generator. Always respond with a valid JSON array only, no markdown, no explanation.",
            },
            {
              role: "user",
              content: `Generate exactly 10 multiple-choice quiz questions based on the following content.

Rules:
- Return ONLY a raw JSON array — no markdown, no explanation, no code fences
- Each item must have:
  "question": string
  "options": array of exactly 4 unique strings
  "correctAnswer": string that is IDENTICAL (character-for-character) to one of the 4 options
- The "correctAnswer" MUST be copied exactly from the options array — do NOT paraphrase
- Questions must be educational, specific, and relevant to the content

Content:
${module.content}`,
            },
          ],
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let raw = aiResponse.data.choices[0].message.content;
      // Strip any accidental markdown fences
      raw = raw.replace(/```json|```/g, "").trim();
      questions = JSON.parse(raw);

      // Validate structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid AI response structure");
      }

      // Slice to exactly 10
      questions = questions.slice(0, 10);

      // ✅ Normalize correctAnswer to exactly match one of the options
      // Fixes cases where AI paraphrases the answer slightly
      questions = questions.map((q) => {
        const exactMatch = (q.options || []).find(
          (opt) => opt.trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase()
        );
        if (exactMatch) {
          q.correctAnswer = exactMatch; // normalize to exact string
        }
        return q;
      });
    } catch (aiErr) {
      console.error("AI quiz generation failed, using fallback:", aiErr.message);
      // Fallback questions
      questions = [
        {
          question: `What is the main topic of "${module.title}"?`,
          options: ["Data Structures", "Web Development", "Machine Learning", "All of the above"],
          correctAnswer: "All of the above",
        },
        {
          question: "Which data structure uses LIFO order?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correctAnswer: "Stack",
        },
        {
          question: "What does an array index start with?",
          options: ["0", "1", "-1", "2"],
          correctAnswer: "0",
        },
        {
          question: "Which sorting algorithm has O(n²) worst case?",
          options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"],
          correctAnswer: "Bubble Sort",
        },
        {
          question: "What is a binary tree node?",
          options: ["Node with 2 children max", "Node with 1 child", "Leaf-only node", "Root node"],
          correctAnswer: "Node with 2 children max",
        },
        {
          question: "Which search is faster on a sorted array?",
          options: ["Linear Search", "Binary Search", "Jump Search", "Depth First"],
          correctAnswer: "Binary Search",
        },
        {
          question: "What does O(1) mean?",
          options: ["Constant time", "Linear time", "Logarithmic time", "Quadratic time"],
          correctAnswer: "Constant time",
        },
        {
          question: "Which data structure is used for BFS?",
          options: ["Stack", "Queue", "Heap", "Tree"],
          correctAnswer: "Queue",
        },
        {
          question: "What is recursion?",
          options: ["Function calling itself", "Loop iteration", "Array traversal", "Sorting method"],
          correctAnswer: "Function calling itself",
        },
        {
          question: "What is the time complexity of binary search?",
          options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
          correctAnswer: "O(log n)",
        },
      ];
    }

    // 💾 Cache quiz in DB
    quiz = await Quiz.create({ moduleId: req.params.moduleId, questions });

    return res.json({ success: true, quiz });
  } catch (err) {
    console.error("getQuizByModule error:", err.message);
    res.status(500).json({ success: false, error: "Quiz generation failed" });
  }
};

// ─── SUBMIT QUIZ ─────────────────────────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user.id;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: "quizId and answers array required" });
    }

    const quiz = await Quiz.findById(quizId).populate("moduleId");
    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    // ── Score calculation ──────────────────────────────────────────────────
    let score = 0;
    const results = quiz.questions.map((q, index) => {
      // Find correct option index (fallback -1 if AI generated a mismatched string)
      const correctIndex = q.options.findIndex(
        (opt) => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      );

      // Primary check: compare selected option TEXT against correctAnswer text
      // This is robust even when correctIndex is -1 due to AI text mismatches
      const selectedOptionText =
        answers[index] !== null && answers[index] !== undefined && q.options[answers[index]]
          ? q.options[answers[index]].trim().toLowerCase()
          : null;
      const correctText = q.correctAnswer.trim().toLowerCase();
      const isCorrect = selectedOptionText !== null && selectedOptionText === correctText;

      if (isCorrect) score++;
      return {
        question: q.question,
        selectedIndex: answers[index],
        correctIndex: correctIndex >= 0 ? correctIndex : null,
        isCorrect,
        correctAnswer: q.correctAnswer,
      };
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);

    // ── Rewards ────────────────────────────────────────────────────────────
    const reward = await addReward(userId, "quiz", percentage);

    // ── Update user progress ───────────────────────────────────────────────
    // Refetching updated user to ensure coin balance changes from addReward are not overwritten by this function's next save
    const user = await User.findById(userId);

    // Track quiz score history
    user.quizScores.push({
      quizId: quiz._id,
      moduleId: quiz.moduleId?._id || quiz.moduleId,
      score,
      percentage,
      xpEarned: reward.xpEarned,
      coinsEarned: reward.coinsEarned,
    });

    // Mark quiz as completed
    if (!user.completedQuizzes.includes(quiz._id)) {
      user.completedQuizzes.push(quiz._id);
    }

    // Mark module as completed if passed (>=50%)
    const moduleId = quiz.moduleId?._id || quiz.moduleId;
    if (percentage >= 50 && moduleId) {
      if (!user.completedModules.map(String).includes(String(moduleId))) {
        user.completedModules.push(moduleId);
      }

      // ── Check if entire course is completed ──────────────────────────────
      const module = await Module.findById(moduleId);
      if (module) {
        const course = await Course.findById(module.courseId).populate("modules");
        if (course) {
          const allModuleIds = course.modules.map((m) => String(m._id || m));
          const completedIds = user.completedModules.map(String);
          const allDone = allModuleIds.every((id) => completedIds.includes(id));

          if (allDone) {
            // Mark course completed
            if (!user.completedCourses.map(String).includes(String(course._id))) {
              user.completedCourses.push(course._id);
            }

            // Auto-issue certificate (idempotent)
            const existingCert = await Certificate.findOne({
              userId,
              courseId: course._id,
            });
            if (!existingCert) {
              const newCert = await Certificate.create({ userId, courseId: course._id });
              
              const populatedCourse = await Course.findById(course._id);
              sendCertificateEmail(user, populatedCourse, newCert.certificateId);
            }
          }
        }
      }
    }

    await user.save();

    return res.json({
      success: true,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      passed: percentage >= 50,
      results,
      reward,
    });
  } catch (err) {
    console.error("submitQuiz error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── CREATE QUIZ (manual) ─────────────────────────────────────────────────────
exports.createQuiz = async (req, res) => {
  try {
    const { moduleId, questions } = req.body;
    const quiz = await Quiz.create({ moduleId, questions });
    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── DELETE CACHED QUIZ (force-regenerate) ────────────────────────────────────
exports.deleteQuiz = async (req, res) => {
  try {
    const deleted = await Quiz.findOneAndDelete({ moduleId: req.params.moduleId });
    if (!deleted)
      return res.status(404).json({ success: false, error: "No cached quiz found for this module" });
    return res.json({
      success: true,
      message: "Quiz cache cleared. Next load will regenerate fresh questions with correct answers.",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};