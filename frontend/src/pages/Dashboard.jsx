import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Home, Target, ArrowUp, ArrowDown, FileText, TrendingUp } from "lucide-react";
import { useFinance } from "@/data/FinanceContext";
import axios from "axios";
import { Progress } from "@material-tailwind/react";
import clsx from "clsx";

export default function Dashboard() {
  const { transactions } = useFinance();
  const [salesData, setSalesData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState({ 
    goals: true,
    sales: true 
  });

  const calculateStats = () => {
    const stats = {
      savings: 0,
      income: 0,
      expenses: 0
    };

    if (Array.isArray(transactions)) {
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;

        switch (transaction.type) {
          case "income":
            stats.income += amount;
            break;
          case "expense":
            stats.expenses += amount;
            break;
          case "savings":
            stats.savings += amount;
            break;
        }
      });

      if (stats.savings === 0) {
        stats.savings = stats.income - stats.expenses;
      }
    }

    return stats;
  };

  const stats = calculateStats();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(prev => ({ ...prev, sales: true }));
        const res = await axios.get("http://localhost:5000/api/transactions/sales/monthly", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });
        setSalesData(res.data);
        setLoading(prev => ({ ...prev, sales: false }));
      } catch (err) {
        setSalesData([]);
        setLoading(prev => ({ ...prev, sales: false }));
      }
    };
    fetchSales();

    const fetchGoals = async () => {
      try {
        setLoading(prev => ({ ...prev, goals: true }));
        const res = await axios.get("http://localhost:5000/api/savings-goals", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });
        setGoals(res.data);
        setLoading(prev => ({ ...prev, goals: false }));
      } catch (err) {
        setGoals([]);
        setLoading(prev => ({ ...prev, goals: false }));
      }
    };
    fetchGoals();

    const tips = [
      "A penny saved is a penny earned!",
      "Track your spending to reach your goals faster.",
      "Small savings today, big rewards tomorrow.",
      "Consistency is the key to financial success.",
      "Review your goals regularly and adjust as needed."
    ];
    setMotivation(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const totalRevenue = salesData.reduce((sum, item) => sum + (item.total || 0), 0);
  const bestMonth = salesData.reduce((best, item) => (item.total > (best?.total || 0) ? item : best), null);
  const activeGoals = goals.filter(g => g.status === 'pending');
  const topGoal = activeGoals.sort((a, b) => a.priority - b.priority)[0];
  const topGoalProgress = topGoal ? Math.min(100, (topGoal.currentAmount / topGoal.targetAmount) * 100) : 0;
  const recentTx = [...transactions].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)).slice(0, 5);

  return (
    <div className="grid grid-cols-12 gap-6 p-6 bg-slate-50 dark:bg-darkmode-700 min-h-screen">
      <div className="col-span-12 2xl:col-span-9">
        <div className="grid grid-cols-12 gap-6">
          {/* Header */}
          <div className="col-span-12">
            <div className="flex items-center h-10 intro-y">
              <h2 className="ml-10 text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <Home className="mr-5" size={24} />
                Dashboard
              </h2>
            </div>
          </div>

          {/* NEW STATS CARDS */}
          <div className="col-span-12 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              {/* Savings Card */}
              <div className="bg-gray-100 dark:bg-blue-900/30 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
               
                <h2 className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 mb-1">
                  ${stats.savings.toFixed(2)}
                </h2>
                <p className="text-blue-800 dark:text-blue-300 font-medium">Savings</p>
              </div>
              
              {/* Income Card */}
              <div className="bg-gray-100 dark:bg-green-900/30 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                
                <h2 className="text-2xl font-extrabold text-green-900 dark:text-green-200 mb-1">
                  ${stats.income.toFixed(2)}
                </h2>
                <p className="text-green-800 dark:text-green-300 font-medium">Income</p>
              </div>
              
              {/* Expenses Card */}
              <div className="bg-gray-100 dark:bg-red-900/30 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
    
                <h2 className="text-2xl font-extrabold text-red-900 dark:text-red-200 mb-1">
                  ${stats.expenses.toFixed(2)}
                </h2>
                <p className="text-red-800 dark:text-red-300 font-medium">Expenses</p>
              </div>
              
              {/* Transactions Card */}
              <div className="bg-gray-100 dark:bg-purple-900/30 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
         
                <h2 className="text-2xl font-extrabold text-purple-900 dark:text-purple-200 mb-1">
                  {transactions.length}
                </h2>
                <p className="text-purple-800 dark:text-purple-300 font-medium">Transactions</p>
              </div>
              
              {/* Active Goals Card */}
              <div className="bg-gray-100 dark:bg-amber-900/30 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
              
                <h2 className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 mb-1">
                  {loading.goals ? "--" : activeGoals.length}
                </h2>
                <p className="text-amber-800 dark:text-amber-300 font-medium">Active Goals</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="col-span-12 mt-6 xl:col-span-8">
            <div className="box p-6 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  Revenue Insights
                </h2>
                <div className="ml-auto flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-300">
                      ${totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-slate-500 text-xs">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-300">
                      {bestMonth ? bestMonth.name : '--'}
                    </div>
                    <div className="text-slate-500 text-xs">Best Month</div>
                  </div>
                </div>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: 'none',
                        borderRadius: '0.5rem'
                      }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      dot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6, fill: '#fff' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium">💡 Insight:</span> This chart shows your income trends over the past year. Use these insights to plan your business growth!
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="col-span-12 mt-6 xl:col-span-4">
            <div className="box p-6 rounded-2xl shadow-lg h-full">
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  Recent Transactions
                </h2>
                <a href="/transactions" className="ml-auto text-primary text-sm">
                  View All
                </a>
              </div>
              <div className="mt-4">
                {recentTx.length > 0 ? (
                  <div className="space-y-4">
                    {recentTx.map((tx, index) => (
                      <div key={index} className="flex items-center">
                        <div className={clsx(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          {
                            "bg-green-100 text-green-600": tx.type === "income",
                            "bg-red-100 text-red-600": tx.type === "expense",
                            "bg-blue-100 text-blue-600": tx.type === "savings"
                          }
                        )}>
                          {tx.type === "income" ? "↑" : tx.type === "expense" ? "↓" : "💰"}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {tx.description}
                          </div>
                          <div className="text-slate-500 text-sm">
                            {new Date(tx.dateTime).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={clsx(
                          "font-medium",
                          {
                            "text-green-600": tx.type === "income",
                            "text-red-600": tx.type === "expense",
                            "text-blue-600": tx.type === "savings"
                          }
                        )}>
                          {tx.type === "expense" ? "-" : "+"}${parseFloat(tx.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No recent transactions
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="col-span-12 2xl:col-span-3">
        <div className="pb-10 -mb-10 2xl:border-l border-slate-200 dark:border-darkmode-400">
          <div className="grid grid-cols-12 2xl:pl-6 gap-x-6 2xl:gap-x-0 gap-y-6">
            {/* Top Goal */}
            {topGoal && (
              <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-12">
                <div className="box p-5 rounded-2xl shadow-lg">
                  <div className="flex items-center">
                    <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                      Top Priority Goal
                    </h2>
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-purple-500/30 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                      Priority
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 truncate">
                      {topGoal.name}
                    </h3>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 dark:text-slate-400 text-sm">Progress</span>
                        <span className="font-medium text-blue-600 dark:text-purple-300">
                          {topGoalProgress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={topGoalProgress} 
                        color="blue" 
                        className="h-2 bg-blue-100 dark:bg-purple-900/50"
                      />
                      <div className="mt-1 text-slate-500 dark:text-slate-400 text-sm text-right">
                        ${topGoal.currentAmount} / ${topGoal.targetAmount}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-darkmode-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-slate-600 dark:text-slate-300">Target Date:</span>
                        <span className="ml-auto font-medium">
                          {new Date(topGoal.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Motivational Tip */}
            <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-12">
              <div className="box p-5 rounded-2xl shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                    💡
                  </div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Financial Tip</h3>
                </div>
                <div className="mt-3 text-slate-700 dark:text-slate-300 italic">
                  "{motivation}"
                </div>
              </div>
            </div>

            {/* Goals Summary */}
            <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-12">
              <div className="box p-5 rounded-2xl shadow-lg">
                <div className="flex items-center">
                  <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                    Goals Summary
                  </h2>
                  <span className="ml-auto bg-slate-100 dark:bg-darkmode-400 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
                    {activeGoals.length} Active
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {activeGoals.slice(0, 3).map((goal, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-1">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {goal.name}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">
                          ${goal.currentAmount} / ${goal.targetAmount}
                        </div>
                      </div>
                      <div className="ml-4 w-16">
                        <Progress 
                          value={Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)} 
                          color="blue" 
                          className="h-2 bg-blue-100 dark:bg-blue-900/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {activeGoals.length > 3 && (
                  <a href="/goals" className="block mt-4 text-center text-primary text-sm">
                    View All Goals
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}