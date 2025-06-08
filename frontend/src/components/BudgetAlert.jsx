import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";

export default function BudgetAlerts() {
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBudgetAlerts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/budgets", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        const alerts = response.data.filter((budget) => budget.spent > budget.limit).map((budget) => ({
          category: budget.category,
          exceededBy: budget.spent - budget.limit,
          period: budget.period,
        }));
        setBudgetAlerts(alerts);
      } catch (error) {
        console.error("Error fetching budget alerts:", error);
      }
      setIsLoading(false);
    };

    fetchBudgetAlerts();
  }, []);

  return (
    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <h3 className="flex items-center text-red-800 font-semibold mb-2">
        <FaExclamationTriangle className="mr-2" />
        Budget Alerts
      </h3>

      {isLoading ? (
        <div className="text-gray-600 text-sm">Loading budget alerts...</div>
      ) : budgetAlerts.length > 0 ? (
        budgetAlerts.map((alert, index) => (
          <div key={index} className="text-red-700 text-sm mb-2">
            {alert.category} budget exceeded by €{alert.exceededBy.toFixed(2)} ({alert.period} basis)
          </div>
        ))
      ) : (
        <div className="text-green-700 text-sm">
          All budgets are within limits 👍
        </div>
      )}
    </div>
  );
}