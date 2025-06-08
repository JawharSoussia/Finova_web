const Transaction = require("../models/Transaction");
const cron = require('node-cron');
const mongoose = require('mongoose'); // Added for ObjectId conversion

const addTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, dateTime, isRecurring, interval } = req.body;

    // Enhanced user validation
    if (!req.user?.userId) {
      console.error("User ID missing in request");
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    console.log("Adding transaction for user ID:", req.user.userId, "Type:", typeof req.user.userId);

    // Explicit ObjectId conversion
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const transactionData = {
      description,
      amount,
      type,
      category,
      dateTime,
      userId, // Now using ObjectId
      isRecurring: isRecurring || false,
      ...(isRecurring && {
        interval,
        nextRun: calculateNextRun(dateTime, interval),
        active: true
      })
    };

    console.log("Transaction data:", transactionData);

    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();
    
    console.log("Transaction saved successfully:", savedTransaction._id);
    res.status(201).json({ 
      message: "Transaction added successfully", 
      transaction: savedTransaction 
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ 
      error: "Failed to add transaction", 
      details: error.message 
    });
  }
};
const getAllTransactions = async (req, res) => {
  try {
    console.log("Admin fetching all transactions");
    const transactions = await Transaction.find().populate('userId', 'username email');
    
    console.log(`Found ${transactions.length} transactions across all users`);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    res.status(500).json({ 
      message: "Failed to fetch all transactions", 
      details: error.message 
    });
  }
};
const getTransactions = async (req, res) => {
  try {
    // Validate user
    if (!req.user?.userId) {
      console.error("User ID missing in request");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Convert to ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    console.log("Fetching transactions for user ID:", userId);

    const transactions = await Transaction.find({ userId });
    console.log(`Found ${transactions.length} transactions`);
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Transaction fetch error:", error);
    res.status(500).json({ 
      message: "Failed to fetch transactions", 
      details: error.message 
    });
  }
};

// Helper function remains the same
const calculateNextRun = (dateTime, interval) => {
  const date = new Date(dateTime);
  switch (interval) {
    case 'daily': date.setDate(date.getDate() + 1); break;
    case 'weekly': date.setDate(date.getDate() + 7); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
    default: return undefined;
  }
  return date;
};

// Cron job remains the same
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      active: true,
      nextRun: { $lt: tomorrow }
    });

    console.log(`Processing ${recurringTransactions.length} recurring transactions`);

    for (const transaction of recurringTransactions) {
      const newTransaction = new Transaction({
        ...transaction.toObject(),
        _id: new mongoose.Types.ObjectId(),
        isRecurring: false,
        dateTime: transaction.nextRun
      });

      await newTransaction.save();
      transaction.nextRun = calculateNextRun(transaction.nextRun, transaction.interval);
      await transaction.save();
    }
  } catch (error) {
    console.error('Recurring transaction error:', error);
  }
});

module.exports = { addTransaction, getTransactions,getAllTransactions };