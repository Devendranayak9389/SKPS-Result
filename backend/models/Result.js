const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  rollNo: String,
  regNo: String,
  name: String,
  fatherName: String,
  dob: String,
  class: String,
  totalQuestions: Number,
  correct: Number,
  wrong: Number,
  totalMarks: Number,
  examName: {
    type: String,
    default: "Shri Krishan Pratiyogita Samiti"
  }
});

module.exports = mongoose.model("Result", resultSchema);
