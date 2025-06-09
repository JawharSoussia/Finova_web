const express = require("express");
const router = express.Router();
const multer = require("multer");
const { updateUserProfile, getUserProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const SavingsGoal = require("../models/SavingsGoal");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get user profile
router.get("/profile", authMiddleware, getUserProfile);

// Update user profile
router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePicture"),
  updateUserProfile
);

// Get user activity logs
router.get("/activity-logs", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.activityLogs || []);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// Update notification preferences
router.put("/notification-preferences", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { emailNotifications, pushNotifications, smsNotifications } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        notificationPreferences: {
          email: emailNotifications,
          push: pushNotifications,
          sms: smsNotifications
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser.notificationPreferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ error: "Failed to update notification preferences" });
  }
});

// Get activity logs for any user (admin only)
router.get("/:userId/activity-logs", authMiddleware, async (req, res) => {
  try {
    // Only allow admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.activityLogs || []);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// Get user transactions (admin only)
const mongoose = require("mongoose");
router.get("/:userId/transactions", authMiddleware, async (req, res) => {
  try {
     console.log(`Authenticated user ID: ${req.user.userId}`);
    console.log(`Authenticated user role: ${req.user.role}`);

    
    const { userId } = req.params;
    console.log(`Fetching transactions for user ID: ${userId}`);
    
    // FIX: Use new keyword to create ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);
    
    const transactions = await Transaction.find({ userId: objectId })
      .sort({ dateTime: -1 });
    
    console.log(`Found ${transactions.length} transactions for user ${userId}`);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Failed to fetch user transactions" });
  }
});

// Enhanced: Get all users (with filtering/search)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let { status, role, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user status (active/inactive)
router.put("/:userId/status", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    console.log(status)

    if (!['active', 'inactive','blocked'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
     const updateFields = { status };
    
    if (status === 'active') {
      updateFields.lastActive = Date.now();
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select("-password");
if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete user
router.delete("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// DELETE /api/users/profile - Delete user account
router.delete("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user to get their profile picture path
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's profile picture if it exists
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      const profilePicturePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(profilePicturePath)) {
        fs.unlinkSync(profilePicturePath);
      }
    }

    // Delete all user's transactions
    await Transaction.deleteMany({ userId });

    // Delete user's savings goals
    await SavingsGoal.deleteMany({ userId });

    // Delete user's notifications
    await Notification.deleteMany({ userId });

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
