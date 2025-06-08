import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use axios for API calls
import { Search, Edit, Trash, ChevronDown, ChevronUp, Filter, Download, Eye, Ban, Shield, AlertTriangle } from "lucide-react";
import { useFinance } from "@/data/FinanceContext";
import { toast } from 'react-hot-toast';

export default function UserSettings() {
  const { transactions } = useFinance();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'lastActive', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user data from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = response.data;
        const usersWithId = data.map(user => ({
  ...user,
  id: user._id // Use the _id from backend as id
}));
        setUsers(usersWithId);
        setFilteredUsers(usersWithId);

        // Update stats based on fetched data
        setUserStats({
          total: data.length,
          active: data.filter((u) => u.status === 'active').length,
          inactive: data.filter((u) => u.status === 'inactive').length,
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch user transactions when a user is selected
// Update the useEffect for fetching transactions
useEffect(() => {
  // Inside your fetchUserTransactions function
const fetchUserTransactions = async () => {
  if (!selectedUser) return;

  setLoading(true);
  try {
    console.log(`Fetching transactions for user ID: ${selectedUser.id}`);
    const response = await axios.get(
      `http://localhost:5000/api/users/${selectedUser.id}/transactions`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      }
    );
    
    console.log("Transactions response:", response);
    console.log("Transactions data:", response.data);
    
    setUserTransactions(response.data);
  } catch (error) {
    console.error('Error fetching user transactions:', error.response || error);
    setUserTransactions([]);
  } finally {
    setLoading(false);
  }
};

  fetchUserTransactions();
}, [selectedUser]);

  // Search and filter users
  useEffect(() => {
    let result = [...users];

    // Apply search
    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {

      result = result.filter(user => user.status === filterStatus);

    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, sortConfig, filterStatus]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle user selection
  const handleSelectUser = (user) => {
    console.log("Selected user:", user);
    console.log("User ID type:", typeof user.id);
    setSelectedUser(selectedUser && selectedUser.id === user.id ? null : user);

  
  };

  // Handle user status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      // Update the user in the local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      setFilteredUsers(filteredUsers.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      // Update stats
      setUserStats(prev => ({
        ...prev,
        active: newStatus === 'active' ? prev.active + 1 : prev.active - 1,
        inactive: newStatus === 'inactive' ? prev.inactive + 1 : prev.inactive - 1,
      }));

      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);

        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
        }

        // Update stats
        setUserStats({
          total: updatedUsers.length,
          active: updatedUsers.filter(u => u.status === 'active').length,
          inactive: updatedUsers.filter(u => u.status === 'inactive').length,

        });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Export user data as CSV
  const exportUserData = () => {
    const headers = ['ID', 'Name', 'Email', 'Status', 'Join Date', 'Last Active', 'Transactions', 'Total Spent', 'Savings'];

    let csvContent = headers.join(',') + '\n';

    filteredUsers.forEach(user => {
      const row = [
        user.id,
        `"${user.name || ""}"`,
        `"${user.email || ""}"`,
        user.status || "unknown",
        formatDate(user.joinDate || new Date()),
        formatDate(user.lastActive || new Date()),
        user.transactionCount || 0,
        (user.totalSpent || 0).toFixed(2),
        (user.savings || 0).toFixed(2)
      ];

      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl ml-6 font-bold mb-4">User Management</h1>
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={exportUserData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            title="Export users as CSV"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
      {/* Users Table */}
      <div className="overflow-x-auto mb-8">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{loading ? "Loading users..." : "No users found."}</div>
        ) : (
          <table className="min-w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Join Date</th>
                <th className="px-4 py-2 text-left">Last Active</th>
                <th className="px-4 py-2 text-left">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {(filteredUsers || []).map(user => (
                <tr
                  key={user.id}
                  className={`hover:bg-blue-50 cursor-pointer transition ${selectedUser && selectedUser.id === user.id ? 'bg-blue-100 font-semibold' : ''}`}
                  onClick={() => handleSelectUser(user)}
                  title="Click to view details"
                >
                  <td className="px-4 py-2">{user.name || ""}</td>
                  <td className="px-4 py-2">{user.email || ""}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.status || "unknown"}</span>
                  </td>
                  <td className="px-4 py-2">{formatDate(user.joinDate || new Date())}</td>
                  <td className="px-4 py-2">{formatDate(user.lastActive || new Date())}</td>
                  <td className="px-4 py-2">{user.transactionCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-auto p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
              title="Close details"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">User Details: {selectedUser.name || ""}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{userTransactions.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold">
                  ${userTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold">
                  ${userTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-2xl font-bold">{formatDate(selectedUser.joinDate || new Date())}</p>
              </div>
            </div>
            <h4 className="font-medium mb-2">Recent Transactions</h4>
            {loading ? (
              <div className="text-center py-4">
                <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                <span className="ml-2 text-blue-600">Loading transactions...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(userTransactions).length > 0 ? (
                      (userTransactions).map(transaction => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{transaction.type}</span>
                          </td>
                          <td className="px-4 py-2">{transaction.category}</td>
                          <td className="px-4 py-2">${(transaction.amount || 0).toFixed(2)}</td>
                          <td className="px-4 py-2">{formatDate(transaction.dateTime || new Date())}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{transaction.status || 'completed'}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No transactions found for this user.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock components for the icons
function User(props) { return <div {...props} />; }
function CheckCircle(props) { return <div {...props} />; }
function Clock(props) { return <div {...props} />; }