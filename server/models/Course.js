const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be easy, medium, or hard",
      },
      default: "easy",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Programming", "Design", "Business", "Science", "Other"],
    },
    learningPath: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningPath",
      default: null,
    },
    tags: [{ type: String, trim: true }],
    estimatedHours: {
      type: Number,
      default: 2,
      min: 0,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    price: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ category: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ learningPath: 1 });
courseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Course", courseSchema);