// In FinanceContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions from backend API on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No auth token');
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(res.data);
        localStorage.setItem('transactions', JSON.stringify(res.data));
      } catch (e) {
        setError(e.message || 'Failed to fetch transactions');
        // fallback: try to load from localStorage
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
          try {
            setTransactions(JSON.parse(savedTransactions));
          } catch (err) {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Save transactions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    // Ensure each transaction has a unique ID
    const newTransaction = { ...transaction, id: Date.now() };
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      loading,
      error
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}