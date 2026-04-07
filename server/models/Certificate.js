const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    certificateId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate certificates for same user & course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
