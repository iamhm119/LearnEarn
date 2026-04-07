const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String
});

const quizSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module"
  },
  questions: [questionSchema]
});

module.exports = mongoose.model("Quiz", quizSchema);