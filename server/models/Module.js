const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Module content is required"],
    },
    videoUrl: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    xpReward: {
      type: Number,
      default: 50,
    },
    coinReward: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

// Sort modules by order by default
moduleSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model("Module", moduleSchema);