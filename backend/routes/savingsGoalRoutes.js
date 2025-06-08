const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const SavingsGoal = require("../models/SavingsGoal");
const Transaction = require("../models/Transaction");

const calculateCurrentSavings = async (userId) => {
  try {
    const transactions = await Transaction.find({ userId });

    const stats = transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      acc[transaction.type] += amount;
      return acc;
    }, {
      income: 0,
      expense: 0,
      savings: 0
    });

    return stats.savings > 0 ? stats.savings : stats.income - stats.expense;
  } catch (error) {
    console.error("Error calculating savings:", error);
    throw new Error("Error calculating current savings");
  }
};

// Créer un objectif
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, targetAmount, targetDate, priority } = req.body;
    const userId = req.user.userId;

    if (typeof priority !== 'number' || priority < 1) {
      return res.status(400).json({ error: 'Priority must be a positive integer' });
    }

    // Increment priorities of existing goals with priority >= new one
    await SavingsGoal.updateMany(
      { userId, priority: { $gte: priority } },
      { $inc: { priority: 1 } }
    );

    const currentAmount = await calculateCurrentSavings(userId);

    const savingsGoal = new SavingsGoal({
      userId,
      name,
      targetAmount,
      currentAmount,
      targetDate,
      priority
    });

    const savedGoal = await savingsGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error("Error creating savings goal:", error);
    res.status(500).json({ error: error.message || "Failed to create savings goal" });
  }
});

// Récupérer l'épargne actuelle
router.get("/current-savings", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentSavings = await calculateCurrentSavings(userId);
    res.status(200).json({ currentSavings });
  } catch (error) {
    console.error("Error getting current savings:", error);
    res.status(500).json({ error: error.message || "Failed to get current savings" });
  }
});

// Récupérer tous les objectifs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const goals = await SavingsGoal.find({ 
      userId, 
      status: 'pending'  // Ne récupère que les objectifs en cours
    });

    const currentSavings = await calculateCurrentSavings(userId);

    // For each goal, set currentAmount to the latest currentSavings
    const goalsWithLiveData = goals.map(goal => {
      const obj = goal.toObject();
      obj.currentAmount = currentSavings;
      return obj;
    });

    res.status(200).json(goalsWithLiveData);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    res.status(500).json({ error: "Failed to fetch savings goals" });
  }
});

// Vérifier l'objectif le plus ancien
router.get('/check-oldest', authMiddleware, async (req, res) => { // Correction ici: authMiddleware
  try {
    const oldestGoal = await SavingsGoal.findOne({ userId: req.user.userId })
      .sort({ createdAt: 1 });

    if (!oldestGoal) {
      return res.json({ processed: false });
    }

    const now = new Date();
    const isAchieved = oldestGoal.currentAmount >= oldestGoal.targetAmount;
    const isExpired = now > oldestGoal.targetDate;

    if (isAchieved || isExpired) {
      await SavingsGoal.findByIdAndDelete(oldestGoal._id);
      return res.json({
        processed: true,
        status: isAchieved ? 'achieved' : 'expired',
        processedGoal: oldestGoal
      });
    }

    res.json({ processed: false });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Supprimer un objectif
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!goal) {
      return res.status(404).json({ error: "Objectif non trouvé" });
    }

    // Mark as deleted instead of removing
    await SavingsGoal.findByIdAndUpdate(req.params.id, { status: 'deleted' });
    res.status(200).json({ message: "Objectif marqué comme supprimé" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
module.exports = router;