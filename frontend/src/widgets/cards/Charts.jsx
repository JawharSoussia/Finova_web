// 📌 Charts.jsx - Updated with Income Chart and English Translation
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useFinance } from "@/data/FinanceContext";

const COLORS = ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#c9cbcf"];

export default function Charts() {
  const { transactions } = useFinance();

  // Filter only expenses and incomes
  const expenses = transactions.filter((tx) => tx.type === "expense");
  const incomes = transactions.filter((tx) => tx.type === "income");

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  // Group incomes by category
  const incomesByCategory = incomes.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  // Transform data for Pie Charts
  const expenseData = Object.keys(expensesByCategory).map((key, index) => ({
    name: key,
    value: expensesByCategory[key],
    color: COLORS[index % COLORS.length],
  }));

  const incomeData = Object.keys(incomesByCategory).map((key, index) => ({
    name: key,
    value: incomesByCategory[key],
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Financial Overview</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Expenses by Category</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {expenseData.map((entry, index) => (
                    <Cell key={`expense-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No expenses recorded.</p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-500 mb-2">Income by Category</h3>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={incomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {incomeData.map((entry, index) => (
                    <Cell key={`income-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No income recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
