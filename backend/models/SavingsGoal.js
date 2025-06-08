const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  notified30Days: {
    type: Boolean,
    default: false
  },
  closedNotified: {
    type: Boolean,
    default: false
  },
  lastNotification: Date,
  priority: { type: Number, required: true }
});


module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);