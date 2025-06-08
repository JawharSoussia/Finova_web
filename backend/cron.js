const cron = require("node-cron");
const { checkGoalProgressAndNotify } = require("./utils/notificationService");
const { processOldestGoal } = require("./services/fifoProcessor");

// Exécuter toutes les 6 heures
cron.schedule('0 */6 * * *', async () => {
  console.log('Running FIFO goal processing...');
  await processOldestGoal();
  checkGoalProgressAndNotify();
  console.log("Running goal progress check and notification task...");

});
// // Schedule the task to run every day at a specific time (e.g., 8:00 AM)
// cron.schedule("0 8 * * *", () => {
//   
// });

console.log("Scheduled goal progress check and notification task.");

const stopRecurringTransaction = async (id) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/transactions/${id}/stop`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    console.log("Recurring transaction stopped:", response.data);
    // Optionally refresh the transaction list or show a success message
  } catch (error) {
    console.error("Error stopping recurring transaction:", error);
    // Handle error (e.g., show an error message)
  }
};
