const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const EventSubmission = require("../models/EventSubmission");
const EventLeaderboard = require("../models/EventLeaderboard");
const User = require("../models/User");
const { addReward, computeLevel } = require("../utils/rewardService");
const sendEventRegistrationEmail = require("../utils/sendEventRegistration");
const axios = require("axios");

// ─── GET ALL EVENTS ──────────────────────────────────────────────────────────
exports.getEvents = async (req, res) => {
  try {
    const now = new Date();

    // Auto-update statuses
    await Event.updateMany(
      { status: "upcoming", startTime: { $lte: now } },
      { $set: { status: "live" } }
    );

    const events = await Event.find()
      .select("-questions")
      .sort({ startTime: -1 })
      .lean();

    // Check end times and mark ended
    const updatedEvents = events.map((e) => {
      const endTime = new Date(
        new Date(e.startTime).getTime() + e.duration * 60000
      );
      if (now > endTime && e.status !== "ended") {
        Event.updateOne({ _id: e._id }, { $set: { status: "ended" } }).exec();
        e.status = "ended";
      }
      return e;
    });

    // If user is authenticated, check registrations
    let registrations = {};
    if (req.user) {
      const regs = await EventRegistration.find({ userId: req.user.id }).lean();
      regs.forEach((r) => {
        registrations[r.eventId.toString()] = r.status;
      });
    }

    const enriched = updatedEvents.map((e) => ({
      ...e,
      registrationStatus: registrations[e._id.toString()] || null,
      endTime: new Date(
        new Date(e.startTime).getTime() + e.duration * 60000
      ).toISOString(),
    }));

    res.json({ success: true, events: enriched });
  } catch (err) {
    console.error("getEvents error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET SINGLE EVENT ────────────────────────────────────────────────────────
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res
        .status(404)
        .json({ success: false, error: "Event not found" });
    }

    const now = new Date();
    const endTime = new Date(
      new Date(event.startTime).getTime() + event.duration * 60000
    );

    // Only send questions if event is live and user is registered
    let questions = [];
    let registration = null;

    if (req.user) {
      registration = await EventRegistration.findOne({
        userId: req.user.id,
        eventId: event._id,
      }).lean();

      if (
        registration &&
        now >= new Date(event.startTime) &&
        now <= endTime
      ) {
        // Send questions without correct answers (anti-cheat)
        questions = event.questions.map((q, i) => ({
          index: i,
          question: q.question,
          options: q.options,
          difficulty: q.difficulty,
          points: q.points,
          timeLimit: q.timeLimit,
        }));
      }
    }

    // Get user's submissions for this event
    let submissions = [];
    if (req.user) {
      submissions = await EventSubmission.find({
        userId: req.user.id,
        eventId: event._id,
      }).lean();
    }

    // Get leaderboard
    const leaderboard = await EventLeaderboard.find({ eventId: event._id })
      .sort({ totalScore: -1, totalTimeTaken: 1 })
      .limit(50)
      .populate("userId", "name email level")
      .lean();

    const rankedLeaderboard = leaderboard.map((entry, i) => ({
      ...entry,
      rank: i + 1,
      userName: entry.userId?.name || "Unknown",
      userLevel: entry.userId?.level || "Beginner",
    }));

    // Participant count
    const participantCount = await EventRegistration.countDocuments({
      eventId: event._id,
    });

    res.json({
      success: true,
      event: {
        ...event,
        questions,
        endTime: endTime.toISOString(),
        participantCount,
      },
      registration,
      submissions: submissions.map((s) => s.questionIndex),
      leaderboard: rankedLeaderboard,
    });
  } catch (err) {
    console.error("getEvent error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── REGISTER FOR EVENT ──────────────────────────────────────────────────────
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, error: "Event not found" });
    }

    // Check if already registered
    const existing = await EventRegistration.findOne({
      userId: req.user.id,
      eventId: event._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Already registered" });
    }

    // Check capacity
    const count = await EventRegistration.countDocuments({
      eventId: event._id,
    });
    if (count >= event.maxParticipants) {
      return res
        .status(400)
        .json({ success: false, error: "Event is full" });
    }

    const registration = await EventRegistration.create({
      userId: req.user.id,
      eventId: event._id,
    });

    event.participantCount = count + 1;
    await event.save();

    // Create leaderboard entry
    await EventLeaderboard.create({
      eventId: event._id,
      userId: req.user.id,
    });

    // Send registration confirmation email (non-blocking)
    const user = await User.findById(req.user.id).select("name email");
    if (user) {
      sendEventRegistrationEmail(user, event).catch((e) =>
        console.error("Email send failed:", e.message)
      );
    }

    res.status(201).json({ success: true, registration });
  } catch (err) {
    console.error("registerForEvent error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── SUBMIT ANSWER ───────────────────────────────────────────────────────────
exports.submitAnswer = async (req, res) => {
  try {
    const { questionIndex, selectedAnswer, timeTaken } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, error: "Event not found" });
    }

    // Verify event is live
    const now = new Date();
    const endTime = new Date(event.startTime.getTime() + event.duration * 60000);
    if (now < event.startTime || now > endTime) {
      return res
        .status(400)
        .json({ success: false, error: "Event is not currently live" });
    }

    // Verify registration
    const registration = await EventRegistration.findOne({
      userId,
      eventId,
    });
    if (!registration) {
      return res
        .status(400)
        .json({ success: false, error: "Not registered for this event" });
    }

    // Check if already submitted this question
    const existingSub = await EventSubmission.findOne({
      userId,
      eventId,
      questionIndex,
    });
    if (existingSub) {
      return res
        .status(400)
        .json({ success: false, error: "Already answered this question" });
    }

    // Validate question
    const question = event.questions[questionIndex];
    if (!question) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid question index" });
    }

    // Grade answer
    const correctIndex = question.options.findIndex(
      (opt) =>
        opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
    );
    const isCorrect = selectedAnswer === correctIndex;
    const score = isCorrect ? question.points : 0;

    // Save submission
    const submission = await EventSubmission.create({
      userId,
      eventId,
      questionIndex,
      selectedAnswer,
      isCorrect,
      score,
      timeTaken: timeTaken || 0,
    });

    // Update leaderboard
    const leaderboardEntry = await EventLeaderboard.findOneAndUpdate(
      { eventId, userId },
      {
        $inc: {
          totalScore: score,
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
          totalTimeTaken: timeTaken || 0,
        },
      },
      { new: true, upsert: true }
    );

    // Mark registration as participated
    if (registration.status === "registered") {
      registration.status = "participated";
      registration.joinedAt = registration.joinedAt || new Date();
      await registration.save();
    }

    res.json({
      success: true,
      submission: {
        questionIndex,
        isCorrect,
        score,
        correctIndex,
      },
      leaderboardEntry,
    });
  } catch (err) {
    console.error("submitAnswer error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── REPORT TAB SWITCH (anti-cheat) ─────────────────────────────────────────
exports.reportTabSwitch = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const registration = await EventRegistration.findOne({ userId, eventId });
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, error: "Registration not found" });
    }

    registration.tabSwitchCount += 1;
    await registration.save();

    // Check if exceeded limit
    const event = await Event.findById(eventId);
    if (
      event &&
      registration.tabSwitchCount >= event.tabSwitchLimit
    ) {
      registration.status = "disqualified";
      await registration.save();
      return res.json({
        success: true,
        disqualified: true,
        tabSwitchCount: registration.tabSwitchCount,
        message: "You have been disqualified for excessive tab switching",
      });
    }

    res.json({
      success: true,
      disqualified: false,
      tabSwitchCount: registration.tabSwitchCount,
      remaining: event.tabSwitchLimit - registration.tabSwitchCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET EVENT LEADERBOARD ───────────────────────────────────────────────────
exports.getEventLeaderboard = async (req, res) => {
  try {
    const eventId = req.params.id;

    const leaderboard = await EventLeaderboard.find({ eventId })
      .sort({ totalScore: -1, totalTimeTaken: 1 })
      .populate("userId", "name email level")
      .lean();

    const ranked = leaderboard.map((entry, i) => ({
      ...entry,
      rank: i + 1,
      userName: entry.userId?.name || "Unknown",
      userLevel: entry.userId?.level || "Beginner",
      userInitial: entry.userId?.name?.[0]?.toUpperCase() || "?",
    }));

    res.json({ success: true, leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── FINALIZE EVENT (end event, award rewards, select top N) ─────────────────
exports.finalizeEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, error: "Event not found" });
    }

    if (event.status === "ended") {
      // Check if already finalized (has selections)
      const hasSelections = await EventLeaderboard.findOne({
        eventId: event._id,
        isSelected: true,
      });
      if (hasSelections) {
        return res.json({
          success: true,
          message: "Event already finalized",
        });
      }
    }

    event.status = "ended";
    await event.save();

    // Get ranked leaderboard
    const leaderboard = await EventLeaderboard.find({ eventId: event._id })
      .sort({ totalScore: -1, totalTimeTaken: 1 })
      .lean();

    // Award rewards and mark top N as selected
    for (let i = 0; i < leaderboard.length; i++) {
      const entry = leaderboard[i];
      const rank = i + 1;

      // Calculate rewards based on rank
      let xpMultiplier = 1;
      let coinsMultiplier = 1;
      if (rank <= 3) {
        xpMultiplier = 3;
        coinsMultiplier = 3;
      } else if (rank <= 10) {
        xpMultiplier = 2;
        coinsMultiplier = 2;
      }

      const xpToAward = Math.round(event.rewards.xp * xpMultiplier);
      const coinsToAward = Math.round(event.rewards.coins * coinsMultiplier);
      const isSelected = rank <= event.topNSelected && event.rewards.internshipSlots > 0;

      // Update leaderboard entry
      await EventLeaderboard.updateOne(
        { _id: entry._id },
        {
          $set: {
            rank,
            isSelected,
            xpAwarded: xpToAward,
            coinsAwarded: coinsToAward,
          },
        }
      );

      // Award XP and coins to user
      const user = await User.findById(entry.userId);
      if (user) {
        user.xp = (user.xp || 0) + xpToAward;
        user.coins = (user.coins || 0) + coinsToAward;
        user.level = computeLevel(user.xp);

        // Add "EVENT_WINNER" badge for top selected
        if (isSelected && !user.badges.includes("EXPERT")) {
          user.badges.push("EXPERT");
        }

        await user.save();
      }

      // Update registration status
      await EventRegistration.updateOne(
        { userId: entry.userId, eventId: event._id },
        { $set: { status: "completed", completedAt: new Date() } }
      );
    }

    res.json({
      success: true,
      message: "Event finalized, rewards distributed",
      topSelected: leaderboard.slice(0, event.topNSelected).length,
    });
  } catch (err) {
    console.error("finalizeEvent error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── CREATE EVENT (Admin) ────────────────────────────────────────────────────
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      skills,
      startTime,
      duration,
      rewards,
      maxParticipants,
      topNSelected,
      coverGradient,
    } = req.body;

    // Generate questions using Groq AI
    let questions = [];
    try {
      const skillsText = skills?.join(", ") || "programming";
      const aiResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a coding quiz generator for hiring events. Always respond with a valid JSON array only, no markdown, no explanation.",
            },
            {
              role: "user",
              content: `Generate exactly 10 multiple-choice coding/technical questions for a live hiring competition. 
Skills to test: ${skillsText}

Rules:
- Return ONLY a JSON array
- Each item has: "question" (string), "options" (array of 4 strings), "correctAnswer" (string matching one of the options), "difficulty" (easy/medium/hard), "points" (10 for easy, 20 for medium, 30 for hard), "timeLimit" (30 for easy, 60 for medium, 90 for hard)
- Mix difficulties: 3 easy, 4 medium, 3 hard
- Questions must test real coding knowledge
- Do NOT include markdown code fences`,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let raw = aiResponse.data.choices[0].message.content;
      raw = raw.replace(/```json|```/g, "").trim();
      questions = JSON.parse(raw);
      if (!Array.isArray(questions)) throw new Error("Invalid AI response");
      questions = questions.slice(0, 10);
    } catch (aiErr) {
      console.error("AI question generation failed, using defaults:", aiErr.message);
      questions = generateFallbackQuestions(skills);
    }

    const event = await Event.create({
      title,
      description,
      company: company || "LearnEarn Platform",
      skills: skills || [],
      startTime: new Date(startTime),
      duration: duration || 30,
      createdBy: req.user.id,
      rewards: rewards || { xp: 100, coins: 50, internshipSlots: 0 },
      questions,
      maxParticipants: maxParticipants || 500,
      topNSelected: topNSelected || 3,
      coverGradient: coverGradient || "from-brand-500 to-purple-600",
    });

    res.status(201).json({ success: true, event: { ...event.toObject(), questions: undefined } });
  } catch (err) {
    console.error("createEvent error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET AI FEEDBACK AFTER EVENT ─────────────────────────────────────────────
exports.getEventFeedback = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const submissions = await EventSubmission.find({ userId, eventId }).lean();
    if (submissions.length === 0) {
      return res.json({
        success: true,
        feedback: "You didn't submit any answers for this event.",
      });
    }

    const leaderboardEntry = await EventLeaderboard.findOne({
      eventId,
      userId,
    }).lean();

    // Build performance summary for AI
    const correctCount = submissions.filter((s) => s.isCorrect).length;
    const totalQuestions = event.questions.length;
    const answeredQuestions = submissions.map((s) => ({
      question: event.questions[s.questionIndex]?.question || "Unknown",
      difficulty: event.questions[s.questionIndex]?.difficulty || "unknown",
      correct: s.isCorrect,
      timeTaken: s.timeTaken,
    }));

    try {
      const aiResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a career mentor giving constructive feedback after a coding competition. Be encouraging but specific about improvement areas. Use bullet points. Keep response under 200 words.",
            },
            {
              role: "user",
              content: `Here's a student's performance in a hiring event titled "${event.title}" with skills tested: ${event.skills.join(", ")}

Score: ${correctCount}/${totalQuestions} correct
Rank: #${leaderboardEntry?.rank || "N/A"}
Total Score: ${leaderboardEntry?.totalScore || 0} points

Question-by-question:
${answeredQuestions.map((q) => `- ${q.question} (${q.difficulty}) — ${q.correct ? "✅ Correct" : "❌ Wrong"} (${q.timeTaken}s)`).join("\n")}

Give personalized feedback on:
1. Strengths
2. Areas to improve
3. Recommended next steps`,
            },
          ],
          temperature: 0.6,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const feedback = aiResponse.data.choices[0].message.content;
      res.json({ success: true, feedback });
    } catch (aiErr) {
      console.error("AI feedback failed:", aiErr.message);
      res.json({
        success: true,
        feedback: `You answered ${correctCount} out of ${totalQuestions} questions correctly. ${
          correctCount >= totalQuestions * 0.8
            ? "Great job! You performed really well."
            : correctCount >= totalQuestions * 0.5
            ? "Good effort! Review the topics you missed and try again."
            : "Keep practicing! Focus on the fundamental concepts."
        }`,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET USER EVENT HISTORY ──────────────────────────────────────────────────
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await EventRegistration.find({ userId })
      .populate({
        path: "eventId",
        select: "title company skills startTime duration status rewards coverGradient",
      })
      .sort({ createdAt: -1 })
      .lean();

    const eventIds = registrations.map((r) => r.eventId?._id).filter(Boolean);
    const leaderboardEntries = await EventLeaderboard.find({
      userId,
      eventId: { $in: eventIds },
    }).lean();

    const lbMap = {};
    leaderboardEntries.forEach((e) => {
      lbMap[e.eventId.toString()] = e;
    });

    const enriched = registrations
      .filter((r) => r.eventId)
      .map((r) => ({
        ...r,
        leaderboard: lbMap[r.eventId._id.toString()] || null,
      }));

    res.json({ success: true, events: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── FALLBACK QUESTION GENERATOR ─────────────────────────────────────────────
function generateFallbackQuestions(skills = []) {
  return [
    {
      question: "What is the time complexity of accessing an element in an array by index?",
      options: ["O(n)", "O(1)", "O(log n)", "O(n²)"],
      correctAnswer: "O(1)",
      difficulty: "easy",
      points: 10,
      timeLimit: 30,
    },
    {
      question: "Which data structure follows FIFO (First In, First Out) principle?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      correctAnswer: "Queue",
      difficulty: "easy",
      points: 10,
      timeLimit: 30,
    },
    {
      question: "What does SQL stand for?",
      options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Loop"],
      correctAnswer: "Structured Query Language",
      difficulty: "easy",
      points: 10,
      timeLimit: 30,
    },
    {
      question: "What is the purpose of the 'this' keyword in JavaScript?",
      options: ["Refers to the current function", "Refers to the execution context", "Creates a new variable", "Imports modules"],
      correctAnswer: "Refers to the execution context",
      difficulty: "medium",
      points: 20,
      timeLimit: 60,
    },
    {
      question: "Which HTTP method is idempotent?",
      options: ["POST", "PUT", "PATCH", "DELETE"],
      correctAnswer: "PUT",
      difficulty: "medium",
      points: 20,
      timeLimit: 60,
    },
    {
      question: "What is a closure in JavaScript?",
      options: [
        "A function with access to its outer scope",
        "A self-executing function",
        "A class constructor",
        "An async function",
      ],
      correctAnswer: "A function with access to its outer scope",
      difficulty: "medium",
      points: 20,
      timeLimit: 60,
    },
    {
      question: "Which sorting algorithm has O(n log n) average case complexity?",
      options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
      correctAnswer: "Merge Sort",
      difficulty: "medium",
      points: 20,
      timeLimit: 60,
    },
    {
      question: "What is the difference between == and === in JavaScript?",
      options: [
        "No difference",
        "=== checks type and value, == only value",
        "== is for strings, === for numbers",
        "=== is deprecated",
      ],
      correctAnswer: "=== checks type and value, == only value",
      difficulty: "hard",
      points: 30,
      timeLimit: 90,
    },
    {
      question: "What is memoization in dynamic programming?",
      options: [
        "Storing results of subproblems to avoid recomputation",
        "Using memo pads for debugging",
        "A sorting technique",
        "Memory allocation strategy",
      ],
      correctAnswer: "Storing results of subproblems to avoid recomputation",
      difficulty: "hard",
      points: 30,
      timeLimit: 90,
    },
    {
      question: "What is the CAP theorem in distributed systems?",
      options: [
        "Consistency, Availability, Partition tolerance — pick 2",
        "Caching, API, Performance",
        "Create, Alter, Perform",
        "Continuous Application Processing",
      ],
      correctAnswer: "Consistency, Availability, Partition tolerance — pick 2",
      difficulty: "hard",
      points: 30,
      timeLimit: 90,
    },
  ];
}
