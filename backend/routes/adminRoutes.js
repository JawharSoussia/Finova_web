const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Get total users
router.get("/users/count", authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ error: "Failed to fetch total users" });
  }
});

// Get active sessions (dummy implementation)
router.get("/sessions/active", authMiddleware, async (req, res) => {
  try {
    // Replace with actual session tracking logic
    const activeSessions = Math.floor(Math.random() * 100); // Example: Random number
    res.status(200).json({ activeSessions });
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});

// Get monthly revenue
router.get("/revenue/monthly", authMiddleware, async (req, res) => {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          type: "income",
          dateTime: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({ monthlyRevenue: monthlyRevenue[0]?.totalRevenue || 0 });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({ error: "Failed to fetch monthly revenue" });
  }
});
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    const transactions = await Transaction.find().populate("userId", "name email");
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching all transactions for admin:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = router;
