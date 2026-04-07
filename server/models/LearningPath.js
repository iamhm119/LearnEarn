const mongoose = require("mongoose");

const learningPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Learning path title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Programming", "Design", "Business", "Science", "Other"],
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [{ type: String, trim: true }],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

learningPathSchema.index({ category: 1 });
learningPathSchema.index({ difficulty: 1 });
learningPathSchema.index({ createdAt: -1 });

module.exports = mongoose.model("LearningPath", learningPathSchema);
