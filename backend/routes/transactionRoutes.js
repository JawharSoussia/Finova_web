const express = require("express");
const router = express.Router();
const { addTransaction, getTransactions,getAllTransactions } = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");
const Transaction = require('../models/Transaction');

// Add auth middleware to all routes
router.use(authMiddleware);

// Transaction endpoints
router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/all",getAllTransactions);

// Recurring transaction stop endpoint
router.put("/:id/stop", async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.user.userId) // Explicit conversion
    });
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transaction.active = false;
    transaction.nextRun = null;
    await transaction.save();
    
    res.status(200).json({ message: "Recurring transaction stopped" });
  } catch (error) {
    console.error("Stop transaction error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get monthly sales (income) for the last 12 months
router.get('/sales/monthly', authMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        }).reverse();

        const sales = await Transaction.aggregate([
            { $match: { type: "income" } },
            {
                $group: {
                    _id: { year: { $year: "$dateTime" }, month: { $month: "$dateTime" } },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const salesData = months.map(({ year, month }) => {
            const found = sales.find(s => s._id.year === year && s._id.month === month + 1);
            return {
                name: new Date(year, month).toLocaleString('default', { month: 'short' }),
                total: found ? found.total : 0
            };
        });

        res.json(salesData);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sales data" });
    }
});

module.exports = router;
