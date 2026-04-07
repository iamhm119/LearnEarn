const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    // ── Gamification ──────────────────────────────
    coins: { type: Number, default: 0, min: 0 },
    xp: { type: Number, default: 0, min: 0 },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    streak: { type: Number, default: 0, min: 0 },
    lastStreakDate: { type: Date, default: null },
    badges: [
      {
        type: String,
        enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
      },
    ],
    ownedItems: [{ type: String }],
    purchases: [
      {
        itemId: String,
        title: String,
        cost: Number,
        category: String,
        purchasedAt: { type: Date, default: Date.now },
      },
    ],
    activeTheme: { type: String, default: null },
    activeAvatar: { type: String, default: null },
    hints: { type: Number, default: 0 },

    // ── Progress tracking ──────────────────────────
    enrolledPaths: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LearningPath",
      },
    ],
    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    completedModules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
    completedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    // Store per-quiz score history for analytics
    quizScores: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
        score: Number,
        percentage: Number,
        xpEarned: Number,
        coinsEarned: Number,
        attemptedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Events ─────────────────────────────────────
    eventsParticipated: [
      {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        rank: Number,
        score: Number,
        isSelected: { type: Boolean, default: false },
        participatedAt: { type: Date, default: Date.now },
      },
    ],
    eventBadges: [
      {
        type: String,
        enum: ["EVENT_PARTICIPANT", "EVENT_WINNER", "TOP_3", "TOP_10"],
      },
    ],

    // ── Account ────────────────────────────────────
    lastActiveDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Generate and hash password token
const crypto = require("crypto");
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.index({ xp: -1 });
userSchema.index({ coins: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);