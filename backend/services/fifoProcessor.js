const SavingsGoal = require("../models/SavingsGoal");
const User = require("../models/User");
const {checkGoalProgressAndNotify} = require("../utils/notificationService");
const { createNotificationHTML, sendEmail } = require("../utils/notificationService");

const processOldestGoal = async () => {
  try {    const nextGoal = await SavingsGoal.findOne({ status: 'pending' })
      .sort({ priority: -1, createdAt: 1 })  // Trie d'abord par priorité (décroissant), puis par date de création
      .populate('userId');    if (!nextGoal) return;

    const now = new Date();
    const isAchieved = nextGoal.currentAmount >= nextGoal.targetAmount;
    const isExpired = now > nextGoal.targetDate;    if (isAchieved || isExpired) {
      console.log(`🎯 Processing goal "${nextGoal.name}" (${nextGoal._id})`);
      console.log(`Status: ${isAchieved ? 'Achieved' : 'Expired'}`);
      console.log(`Current Amount: ${nextGoal.currentAmount}€ / Target: ${nextGoal.targetAmount}€`);
      
      await sendGoalCompletionNotification(nextGoal, isAchieved);
      
      // Mettre à jour le status au lieu de supprimer
      await SavingsGoal.findByIdAndUpdate(
        nextGoal._id,
        { 
          status: isAchieved ? 'completed' : 'expired',
          completedAt: new Date()
        }
      );
      
      console.log(`✅ Goal status updated to: ${isAchieved ? 'completed' : 'expired'}`);
    }
  } catch (error) {
    console.error("Error processing goal:", error);
  }
};

const sendGoalCompletionNotification = async (goal, isAchieved) => {
  try {
    const user = await User.findById(goal.userId);
    if (!user?.email) return;

    const subject = isAchieved 
      ? `🎉 Objectif "${goal.name}" atteint !`
      : `⚠️ Objectif "${goal.name}" expiré`;

    const message = isAchieved
      ? `Vous avez atteint votre objectif d'épargne "${goal.name}" (${goal.targetAmount}€).`
      : `Votre objectif "${goal.name}" n'a pas été atteint à temps.`;

    await sendEmail(
      user.email,
      subject,
      createNotificationHTML(
        isAchieved ? 'Félicitations !' : 'Objectif expiré',
        message
      )
    );

    console.log(`Notification FIFO envoyée pour: ${goal._id}`);

  } catch (error) {
    console.error("Erreur notification FIFO:", error);
    throw error;
  }
};

module.exports = { processOldestGoal };