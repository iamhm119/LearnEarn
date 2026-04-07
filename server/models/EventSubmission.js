const mongoose = require("mongoose");

const eventSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    selectedAnswer: {
      type: Number, // index of selected option
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // seconds
      default: 0,
    },
  },
  { timestamps: true }
);

// One submission per user per question per event
eventSubmissionSchema.index(
  { userId: 1, eventId: 1, questionIndex: 1 },
  { unique: true }
);
eventSubmissionSchema.index({ eventId: 1, userId: 1 });

module.exports = mongoose.model("EventSubmission", eventSubmissionSchema);
