const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["registered", "participated", "completed", "disqualified"],
      default: "registered",
    },
    // Anti-cheat tracking
    tabSwitchCount: { type: Number, default: 0 },
    joinedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Ensure one registration per user per event
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
eventRegistrationSchema.index({ eventId: 1 });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
