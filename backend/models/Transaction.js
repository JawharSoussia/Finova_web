const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense", "savings"], required: true },
  category: { type: String, required: true },
  dateTime: { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  interval: { type: String, enum: ["daily", "weekly", "monthly","yearly"] },
  nextRun: { type: Date },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model("Transaction", transactionSchema);
