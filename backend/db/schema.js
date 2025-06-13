const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect("mongodb://127.0.0.1:27017/ps2");

// Define the Question schema
const questionSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createTime: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: String, required: true } // *
});

// Define the User schema
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  sessionQuestions: {
    type: [{ sessionId: String, question: String }],
    validate: [arrayLimitValidator, '{PATH} exceeds the limit of 5'],
  },
  sessionData: {
    type: Map,
    of: [questionSchema],
    validate: [mapLimitValidator, '{PATH} exceeds the limit of 5'],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Custom validation function for array length limit (sessionQuestions)
function arrayLimitValidator(val) {
  return val.length <= 10;
}

// Custom validation futnction for map size limit (sessionData)
function mapLimitValidator(val) {
  return val.size <= 10;
}

// Middleware to manage sessionData and sessionQuestions
userSchema.pre("save", function (next) {
  // Ensure sessionData and sessionQuestions are arrays and maps respectively
  this.sessionQuestions = Array.isArray(this.sessionQuestions) ? this.sessionQuestions : [];
  this.sessionData = this.sessionData instanceof Map ? this.sessionData : new Map();

  // Manage sessionData
  if (this.sessionData.size >= 10) {
    // Remove oldest session
    const oldestSessionKey = Array.from(this.sessionData.keys())[0];
    this.sessionData.delete(oldestSessionKey);
  }

  // Manage sessionQuestions
  if (this.sessionQuestions.length >= 10) {
    // Remove oldest session question
    this.sessionQuestions.shift();
  }

  next();
});

// Create models from the schemas
const User = mongoose.model("User", userSchema);
const Question = mongoose.model("Question", questionSchema);

module.exports = { User, Question };
