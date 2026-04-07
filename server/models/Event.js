const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  points: { type: Number, default: 10 },
  timeLimit: { type: Number, default: 60 }, // seconds per question
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: 2000,
    },
    company: {
      type: String,
      default: "LearnEarn Platform",
      trim: true,
    },
    skills: [{ type: String, trim: true }],
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    duration: {
      type: Number,
      required: true,
      default: 30, // minutes
      min: 5,
      max: 180,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rewards: {
      xp: { type: Number, default: 100 },
      coins: { type: Number, default: 50 },
      internshipSlots: { type: Number, default: 0 },
    },
    questions: [questionSchema],
    maxParticipants: { type: Number, default: 500 },
    participantCount: { type: Number, default: 0 },
    // Top N users to be "selected" for internship
    topNSelected: { type: Number, default: 3 },
    // Anti-cheat settings
    maxSubmissionsPerQuestion: { type: Number, default: 1 },
    tabSwitchLimit: { type: Number, default: 3 },
    // Cover image / color
    coverGradient: {
      type: String,
      default: "from-brand-500 to-purple-600",
    },
  },
  { timestamps: true }
);

eventSchema.index({ startTime: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual: check if event is currently live
eventSchema.virtual("isLive").get(function () {
  const now = new Date();
  const endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  return now >= this.startTime && now <= endTime;
});

// Virtual: check if event has ended
eventSchema.virtual("hasEnded").get(function () {
  const now = new Date();
  const endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  return now > endTime;
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
