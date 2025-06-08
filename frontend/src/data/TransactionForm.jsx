import { useState, useEffect } from "react";
import { useFinance } from "./FinanceContext";
import { Spinner } from "@material-tailwind/react";
import { toast } from "react-toastify";
import axios from "axios";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function TransactionForm({ onTransactionAdded, budgets = [] }) {
  const { addTransaction, isLoading } = useFinance();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState([
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Health",
    "Other",
  ]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState('monthly');

  const handleAddCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory)) {
      setCategories([...categories, customCategory]);
      setCustomCategory("");
      setSuccess(`Category "${customCategory}" added!`);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !amount) {
      setError("Please fill in all fields.");
      return;
    }
    if (isNaN(amount)) {
      setError("Please enter a valid amount.");
      return;
    }

    const formData = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      dateTime: new Date().toISOString(),
      isRecurring,
      interval: isRecurring ? interval : undefined
    };

    try {
      await axios.post("http://localhost:5000/api/transactions", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setSuccess("Transaction added successfully!");
      setDescription("");
      setAmount("");
      setCategory("Other");
      setDate(new Date().toISOString().split("T")[0]);
      setError("");
      setIsRecurring(false);
      setInterval('monthly');

      if (onTransactionAdded) {
        onTransactionAdded();
      }

      addTransaction(formData);
    } catch (err) {
      setError("Failed to add transaction. Please try again.");
    }
  };

  useEffect(() => {
    const checkBudget = () => {
      if (type === "expense" && category && amount) {
        const budget = budgets.find((b) => b.category === category);
        if (budget) {
          const projected = budget.spent + parseFloat(amount);
          if (projected > budget.limit) {
            toast.warning(
              `⚠️ This expense will exceed your ${category} budget by €${(
                projected - budget.limit
              ).toFixed(2)}`
            );
          } else if (projected > budget.limit * 0.9) {
            toast.info(
              `ℹ️ This expense will reach ${Math.round(
                (projected / budget.limit) * 100
              )}% of your ${category} budget`
            );
          }
        }
      }
    };

    const timeout = setTimeout(checkBudget, 500);
    return () => clearTimeout(timeout);
  }, [category, amount, type, budgets]);

  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-darkmode-800 py-6 px-4">
      <div className="w-full max-w-3xl">
        <div className="box bg-white dark:bg-darkmode-700 rounded-xl shadow-md border border-slate-200 dark:border-darkmode-600 p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            Add Transaction
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="What's this for?"
                  className="w-full p-3 text-base border border-slate-300 dark:border-darkmode-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-darkmode-800 text-slate-900 dark:text-slate-100"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Amount (€)
                </label>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 text-base border border-slate-300 dark:border-darkmode-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-darkmode-800 text-slate-900 dark:text-slate-100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="w-full p-3 text-base border border-slate-300 dark:border-darkmode-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-darkmode-800 text-slate-900 dark:text-slate-100"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  id="type"
                  className="w-full p-3 text-base border border-slate-300 dark:border-darkmode-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-darkmode-800 text-slate-900 dark:text-slate-100"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="income" className="text-green-700 dark:text-green-400">Income</option>
                  <option value="expense" className="text-red-700 dark:text-red-400">Expense</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full p-3 text-base border border-slate-300 dark:border-darkmode-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-darkmode-800 text-slate-900 dark:text-slate-100"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="customCategory" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Add Category
                </label>
                <div className="flex gap-2">
                  <input
                    id="customCategory"
                    type="text"
                    placeholder="New category"
                    className="flex-1 p-3 text-base border border-slate-300 dark:border-darkmode-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-darkmode-800 text-slate-900 dark:text-slate-100"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                    aria-label="Add new category"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-5 w-5 accent-indigo-600 rounded focus:ring-indigo-500"
                aria-describedby="periodic-info"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                Recurring
                <span className="relative group">
                  <InformationCircleIcon
                    className="h-4 w-4 text-slate-500 dark:text-slate-400 ml-1"
                    aria-label="Info"
                  />
                  <span id="periodic-info" className="absolute left-0 top-6 z-10 hidden group-hover:block w-60 bg-white dark:bg-darkmode-600 border border-slate-300 dark:border-darkmode-500 text-xs text-slate-700 dark:text-slate-200 rounded-lg shadow-lg px-3 py-2">
                    Enable for repeating transactions
                  </span>
                </span>
              </label>
            </div>
            
            {isRecurring && (
              <div className="flex flex-col gap-1">
                <label htmlFor="interval" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Recurrence Interval
                </label>
                <div className="relative">
                  <select
                    id="interval"
                    className="w-full p-3 text-base border border-slate-300 dark:border-darkmode-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-darkmode-800 text-slate-900 dark:text-slate-100"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    aria-describedby="interval-info"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <div className="absolute right-3 top-3 group">
                    <InformationCircleIcon
                      className="h-4 w-4 text-slate-500 dark:text-slate-400"
                      aria-label="Interval info"
                    />
                    <span id="interval-info" className="absolute left-0 top-6 z-10 hidden group-hover:block w-60 bg-white dark:bg-darkmode-600 border border-slate-300 dark:border-darkmode-500 text-xs text-slate-700 dark:text-slate-200 rounded-lg shadow-lg px-3 py-2">
                      How often this transaction repeats
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-4 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="h-5 w-5" />
                  <span>Processing...</span>
                </>
              ) : (
                "Add Transaction"
              )}
            </button>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 mt-4">
                <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 mt-4">
                <p className="text-green-700 dark:text-green-300 font-medium text-sm">{success}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}