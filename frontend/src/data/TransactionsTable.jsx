import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useFinance } from "./FinanceContext";
import { format } from "date-fns";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaFileDownload,
  FaCalendarAlt,
  FaChartPie,
  FaWallet
} from 'react-icons/fa';

export default function TransactionsTable() {
  const { transactions, setTransactions } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dateTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/transactions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setTransactions(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred. Please try again.");
      }
    };

    fetchTransactions();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Filter by search term
        const matchesSearch =
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by type
        const matchesType =
          filterType === 'all' ||
          tx.type === filterType;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        // Handle sorting
        if (sortField === 'amount') {
          return sortDirection === 'asc'
            ? parseFloat(a.amount) - parseFloat(b.amount)
            : parseFloat(b.amount) - parseFloat(a.amount);
        } else if (sortField === 'dateTime') {
          const dateA = new Date(a.dateTime || new Date());
          const dateB = new Date(b.dateTime || new Date());
          return sortDirection === 'asc'
            ? dateA - dateB
            : dateB - dateA;
        } else {
          return sortDirection === 'asc'
            ? (a[sortField] || '').localeCompare(b[sortField] || '')
            : (b[sortField] || '').localeCompare(a[sortField] || '');
        }
      });
  }, [transactions, searchTerm, sortField, sortDirection, filterType]);

  // Pagination
  const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  // Category totals
  const categoryTotals = useMemo(() => {
    const totals = {};
    filteredTransactions.forEach(tx => {
      if (!totals[tx.category]) {
        totals[tx.category] = {
          income: 0,
          expense: 0
        };
      }
      if (tx.type === 'income') {
        totals[tx.category].income += parseFloat(tx.amount);
      } else {
        totals[tx.category].expense += parseFloat(tx.amount);
      }
    });
    return totals;
  }, [filteredTransactions]);

  // Get transaction status
  const getTransactionStatus = (tx) => {
    const today = new Date();
    const txDate = new Date(tx.dateTime || today);
    const diffTime = Math.abs(today - txDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'recent';
    if (tx.type === 'income' && tx.amount > 1000) return 'major';
    return 'normal';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date & Time', 'Description', 'Amount', 'Type', 'Category'],
      ...filteredTransactions.map(tx => [
        format(new Date(tx.dateTime || new Date()), 'dd/MM/yyyy HH:mm'),
        tx.description,
        tx.amount,
        tx.type,
        tx.category
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <FaSort className="text-gray-400 ml-1" />;
    return sortDirection === 'asc' ?
      <FaSortUp className="text-indigo-600 ml-1" /> :
      <FaSortDown className="text-indigo-600 ml-1" />;
  };

  const stopRecurringTransaction = async (id) => {
    if (!id) {
      console.error("Transaction ID is undefined.");
      return;
    }
    try {
      const response = await axios.put(`http://localhost:5000/api/transactions/${id}/stop`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setTransactions(transactions => transactions.map(tx => tx._id === id ? { ...tx, active: false } : tx));
      setSuccessMessage("Recurring transaction stopped successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error stopping recurring transaction:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-darkmode-700 rounded-lg shadow-sm border-2 border-slate-200 dark:border-darkmode-500 p-5">
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/20 rounded-lg p-3 mb-4 text-center">
          <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center ml-10">
          <FaWallet className="text-indigo-600 mr-5 text-xl" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Transaction History</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border-2 border-slate-300 dark:border-darkmode-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-darkmode-800 text-slate-800 dark:text-slate-200 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
          </div>
          <select
            className="py-2 px-3 border-2 border-slate-300 dark:border-darkmode-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-darkmode-800 text-slate-800 dark:text-slate-200"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 hover:shadow-md transition-all"
          >
            <FaFileDownload className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/20 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Income</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(filteredTransactions.reduce((sum, tx) => tx.type === 'income' ? sum + parseFloat(tx.amount) : sum, 0))}
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l-3-3m3 3l3-3" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-500/10 border-2 border-purple-200 dark:border-purple-500/20 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Expenses</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(filteredTransactions.reduce((sum, tx) => tx.type === 'expense' ? sum + parseFloat(tx.amount) : sum, 0))}
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V8m0 0l-3 3m3-3l3 3" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border-2 border-indigo-200 dark:border-indigo-500/20 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Net Balance</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(filteredTransactions.reduce((sum, tx) => tx.type === 'income' ? sum + parseFloat(tx.amount) : sum - parseFloat(tx.amount), 0))}
              </div>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-500/20 w-12 h-12 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l3-3m-3 3l3 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border-2 border-slate-200 dark:border-darkmode-500">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-darkmode-600">
            <tr>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => handleSort('dateTime')}>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-slate-500 dark:text-slate-400" />
                  Date & Time
                  <SortIndicator field="dateTime" />
                </div>
              </th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => handleSort('description')}>
                <div className="flex items-center">
                  Description
                  <SortIndicator field="description" />
                </div>
              </th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => handleSort('amount')}>
                <div className="flex items-center">
                  Amount
                  <SortIndicator field="amount" />
                </div>
              </th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => handleSort('type')}>
                <div className="flex items-center">
                  Type
                  <SortIndicator field="type" />
                </div>
              </th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => handleSort('category')}>
                <div className="flex items-center">
                  <FaChartPie className="mr-2 text-slate-500 dark:text-slate-400" />
                  Category
                  <SortIndicator field="category" />
                </div>
              </th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">Status</th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx, index) => {
                const status = getTransactionStatus(tx);
                return (
                  <tr
                    key={index}
                    className={`border-t-2 border-slate-200 dark:border-darkmode-500 ${
                      index % 2 === 0 
                        ? 'bg-slate-50 dark:bg-darkmode-700' 
                        : 'bg-white dark:bg-darkmode-800'
                    } 
                    transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:z-10`}
                  >
                    <td className="p-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {tx.dateTime
                        ? format(new Date(tx.dateTime), 'dd/MM/yyyy HH:mm')
                        : format(new Date(), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">
                      {tx.description}
                    </td>
                    <td className={`p-3 font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === "income" 
                          ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300" 
                          : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"}`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-full text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-3">
                      {status === 'recent' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-xs font-medium">
                          Recent
                        </span>
                      )}
                      {status === 'major' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 rounded-full text-xs font-medium">
                          Major
                        </span>
                      )}
                      {status === 'normal' && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300 rounded-full text-xs font-medium">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {tx.isRecurring && (
                        tx.active ? (
                          <button
                            onClick={() => stopRecurringTransaction(tx._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 hover:shadow-md transition-all"
                          >
                            Stop
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-darkmode-600 text-slate-600 dark:text-slate-300 text-xs font-medium">
                            Stopped
                          </span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500 dark:text-slate-400">
                  No transactions found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1 
                  ? 'bg-slate-100 dark:bg-darkmode-600 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-100 dark:bg-darkmode-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkmode-500 hover:shadow-md'
              }`}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1 
                  ? 'bg-slate-100 dark:bg-darkmode-600 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-100 dark:bg-darkmode-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkmode-500 hover:shadow-md'
              }`}
            >
              Prev
            </button>
            
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              let pageNum;
              if (pageCount <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pageCount - 2) {
                pageNum = pageCount - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-darkmode-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkmode-500 hover:shadow-md'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === pageCount 
                  ? 'bg-slate-100 dark:bg-darkmode-600 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-100 dark:bg-darkmode-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkmode-500 hover:shadow-md'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(pageCount)}
              disabled={currentPage === pageCount}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === pageCount 
                  ? 'bg-slate-100 dark:bg-darkmode-600 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-100 dark:bg-darkmode-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkmode-500 hover:shadow-md'
              }`}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}