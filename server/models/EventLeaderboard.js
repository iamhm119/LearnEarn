const mongoose = require("mongoose");

const eventLeaderboardSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalTimeTaken: {
      type: Number, // total seconds
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    // Post-event selection
    isSelected: {
      type: Boolean,
      default: false,
    },
    // XP/Coins awarded
    xpAwarded: { type: Number, default: 0 },
    coinsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One leaderboard entry per user per event
eventLeaderboardSchema.index({ eventId: 1, userId: 1 }, { unique: true });
// Quick lookup for ranked list
eventLeaderboardSchema.index({ eventId: 1, totalScore: -1, totalTimeTaken: 1 });

module.exports = mongoose.model("EventLeaderboard", eventLeaderboardSchema);
