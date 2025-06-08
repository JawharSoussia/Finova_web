const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { getGroqRecommendation } = require("../services/geminiService");

// GET /api/recommendations
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Calculate user savings (monthly/yearly)
    const transactions = await Transaction.find({ userId });
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    const monthlySavings = transactions
      .filter(tx => tx.type === "savings" && new Date(tx.dateTime).getFullYear() === thisYear && new Date(tx.dateTime).getMonth() === thisMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const yearlySavings = transactions
      .filter(tx => tx.type === "savings" && new Date(tx.dateTime).getFullYear() === thisYear)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Get user's spending patterns
    const spendingByCategory = transactions
      .filter(tx => tx.type === "expense")
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});

    // Compose prompt for Groq
    const prompt = `As a financial advisor, analyze this user's financial situation and provide recommendations:

Monthly Savings: $${monthlySavings.toFixed(2)}
Yearly Savings: $${yearlySavings.toFixed(2)}
Spending by Category: ${JSON.stringify(spendingByCategory)}

Please provide 2-4 detailed recommendations in the following JSON format:
[
  {
    "title": "Recommendation Title",
    "detail": "Detailed explanation of the recommendation",
    "actionItems": ["Specific action 1", "Specific action 2"]
  }
]

Focus on:
1. Savings optimization
2. Spending patterns and potential improvements
3. Investment opportunities
4. Financial goal setting

Make sure each recommendation is practical and actionable.`;

    // Get recommendations from Groq
    const cards = await getGroqRecommendation(prompt);

    res.json({ cards });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

module.exports = router;