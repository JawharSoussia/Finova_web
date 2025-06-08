import React, { useState, useEffect } from "react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { User, Users, TrendingUp, DollarSign, Flag, Download, CheckCircle, Ban, Lock, Unlock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0
  });
  
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(0);
  const [averageTransactionAmount, setAverageTransactionAmount] = useState(0);
  const [userRetentionRate, setUserRetentionRate] = useState(0);
  const [topCategories, setTopCategories] = useState([]);
  
  const [userGrowth, setUserGrowth] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [users, setUsers] = useState([]);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const filtered = transactions.filter(tx =>
      filterType === 'all' || tx.type === filterType
    );
    setFilteredTransactions(filtered);
  }, [transactions, filterType]);

  useEffect(() => {
    const filtered = users.filter(user => 
      userFilter === 'all' || 
      (userFilter === 'active' && user.status === 'active') ||
      (userFilter === 'blocked' && user.status === 'blocked')
    );
    setFilteredUsers(filtered);
  }, [users, userFilter]);

  const exportTransactions = () => {
    const headers = ['User', 'Type', 'Amount', 'Category', 'Date', 'Status'];
    let csvContent = headers.join(',') + '\n';

    filteredTransactions.forEach(tx => {
      const row = [
        `"${tx.userName || 'Unknown'}"`,
        tx.type,
        tx.amount,
        `"${tx.category}"`,
        new Date(tx.dateTime).toLocaleDateString(),
        tx.status || 'completed'
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        // Fetch users with transaction counts
        const usersRes = await axios.get("http://localhost:5000/api/users", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const usersData = usersRes.data;
        
        
        // Fetch all transactions
        const txRes = await axios.get("http://localhost:5000/api/transactions/all", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const txData = txRes.data;
        console.log(token)

        // Create user name mapping
        const userNameMap = {};
        usersData.forEach(user => {
          userNameMap[user._id] = user.name;
        });

        // Add user names to transactions
        const transactionsWithNames = txData.map(tx => ({
          ...tx,
          userName: userNameMap[tx.userId] || 'Unknown'
        }));

        // Calculate transaction counts per user
        const userTransactionCounts = {};
        txData.forEach(transaction => {
          const userId = transaction.userId;
          userTransactionCounts[userId] = (userTransactionCounts[userId] || 0) + 1;
        });

        // Add transactionCount to each user
        const usersWithCounts = usersData.map(user => ({
          ...user,
          transactionCount: userTransactionCounts[user._id] || 0
        }));

        setUsers(usersWithCounts);
        setFilteredUsers(usersWithCounts);
        
        // Get latest transactions (sorted by date descending)
        const latestTransactions = [...transactionsWithNames]
          .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
          .slice(0, 100);
          
        setTransactions(latestTransactions);
        
        // Calculate stats
        const activeUsersCount = usersWithCounts.filter(u => u.status === 'active').length;
        const totalUsersCount = usersWithCounts.length;
        
        setStats({
          totalUsers: totalUsersCount,
          activeUsers: activeUsersCount,
          blockedUsers: usersWithCounts.filter(u => u.status === 'blocked').length,
          totalTransactions: txData.length,
          totalRevenue: 0
        });
        
        // Recent signups
        setRecentSignups([...usersWithCounts].sort((a, b) => 
          new Date(b.joinDate) - new Date(a.joinDate)).slice(0, 5));
        
        // Most active users
        setMostActive([...usersWithCounts].sort((a, b) => 
          (b.transactionCount || 0) - (a.transactionCount || 0)).slice(0, 5));
        
        // User growth chart
        const growthByMonth = {};
        usersWithCounts.forEach(u => {
          const d = new Date(u.joinDate);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          growthByMonth[key] = (growthByMonth[key] || 0) + 1;
        });
        setUserGrowth(Object.entries(growthByMonth).map(([k, v]) => ({ month: k, users: v })));
        
        // Fetch revenue data
        const revRes = await axios.get("http://localhost:5000/api/transactions/sales/monthly", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const revenue = revRes.data;
        setRevenueData(revenue);
        
        // Calculate total revenue
        const totalRev = revenue.reduce((sum, r) => sum + (r.total || 0), 0);
        setStats(prev => ({ ...prev, totalRevenue: totalRev }));
        
        // Calculate average transaction amount
        const avgTxAmount = txData.length > 0 
          ? txData.reduce((sum, tx) => sum + tx.amount, 0) / txData.length 
          : 0;
        setAverageTransactionAmount(avgTxAmount);
        
        // Calculate top categories
        const categoryCount = {};
        txData.forEach(tx => {
          categoryCount[tx.category] = (categoryCount[tx.category] || 0) + 1;
        });
        const topCats = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category, count]) => ({ category, count }));
        setTopCategories(topCats);
        
        // Calculate monthly growth rate
        const monthlyGrowth = revenue.length >= 2 
          ? ((revenue[revenue.length - 1].total - revenue[revenue.length - 2].total) 
             / revenue[revenue.length - 2].total * 100)
          : 0;
        setMonthlyGrowthRate(monthlyGrowth);
        
        // Calculate user retention rate
        const retentionRate = totalUsersCount > 0 
          ? (activeUsersCount / totalUsersCount) * 100 
          : 0;
        setUserRetentionRate(retentionRate);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Motivational/admin tips
    const tips = [
      "Empower your users by keeping the platform simple and fast!",
      "Review flagged users regularly for a healthy community.",
      "Export data often for safe backups.",
      "Monitor user growth to spot trends early.",
      "A happy user is a returning user!"
    ];
    setMotivation(tips[Math.floor(Math.random() * tips.length)]);
  }, []);
  
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update main users list
      const updatedUsers = users.map(user => 
        user._id === userId ? response.data : user
      );
      setUsers(updatedUsers);

      // Update recent signups
      setRecentSignups([...updatedUsers]
        .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
        .slice(0, 5));

      // Update most active users
      setMostActive([...updatedUsers]
        .sort((a, b) => (b.transactionCount || 0) - (a.transactionCount || 0))
        .slice(0, 5));

      // Update stats
      const activeUsersCount = updatedUsers.filter(u => u.status === 'active').length;
      setStats(prev => ({
        ...prev,
        activeUsers: activeUsersCount,
        blockedUsers: updatedUsers.filter(u => u.status === 'blocked').length,
      }));

      toast.success(`User successfully ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`);
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const exportUsers = () => {
    const headers = ['ID', 'Name', 'Email', 'Status', 'Join Date', 'Last Active', 'Transactions'];
    let csvContent = headers.join(',') + '\n';
    users.forEach(user => {
      const row = [
        user._id,
        `"${user.name}"`,
        `"${user.email}"`,
        user.status,
        new Date(user.joinDate).toLocaleDateString(),
        new Date(user.lastActive).toLocaleDateString(),
        user.transactionCount
      ];
      csvContent += row.join(',') + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold text-blue-700">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold ml-6 mb-6 text-blue-700 flex items-center gap-2">
        Admin Dashboard <TrendingUp className="inline-block" size={28} />
      </h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
          <Users className="text-blue-700 mb-2" size={32} />
          <h2 className="text-2xl font-bold text-blue-900">{stats.totalUsers}</h2>
          <p className="text-blue-800">Total Users</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
          <User className="text-purple-700 mb-2" size={32} />
          <h2 className="text-2xl font-bold text-purple-900">{stats.activeUsers}</h2>
          <p className="text-purple-800">Active Users</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
          <Ban className="text-red-700 mb-2" size={32} />
          <h2 className="text-2xl font-bold text-red-900">{stats.blockedUsers}</h2>
          <p className="text-red-800">Blocked Users</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
          <DollarSign className="text-blue-700 mb-2" size={32} />
          <h2 className="text-2xl font-bold text-blue-900">${stats.totalRevenue.toLocaleString()}</h2>
          <p className="text-blue-800">Total Revenue</p>
        </div>
        
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">User Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#6366f1" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Revenue (Monthly)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Signups & Most Active Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Recent Signups</h2>
          <ul>
            {recentSignups.map(u => (
              <li key={u._id} className="flex items-center gap-3 mb-2">
                <CheckCircle className={`${u.status === 'blocked' ? 'text-red-500' : 'text-blue-500'}`} size={18} />
                <span className={`font-medium ${u.status === 'blocked' ? 'text-red-900' : 'text-blue-900'}`}>
                  {u.name}
                </span>
                <span className="text-gray-500">{u.email}</span>
                <span className="ml-auto text-gray-400 text-xs">{new Date(u.joinDate).toLocaleDateString()}</span>
                {u.status === 'blocked' && <Lock className="text-red-500" size={16} />}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Most Active Users</h2>
          <ul>
            {mostActive.map(u => (
              <li key={u._id} className="flex items-center gap-3 mb-2">
                <TrendingUp className={`${u.status === 'blocked' ? 'text-red-500' : 'text-purple-500'}`} size={18} />
                <span className={`font-medium ${u.status === 'blocked' ? 'text-red-900' : 'text-purple-900'}`}>
                  {u.name}
                </span>
                <span className="text-gray-500">{u.email}</span>
                <span className="ml-auto text-gray-400 text-xs">{u.transactionCount} tx</span>
                {u.status === 'blocked' && <Lock className="text-red-500" size={16} />}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-700">All Users</h2>
          <div className="flex gap-4">
            <select
              className="px-3 py-2 border rounded-md"
              onChange={(e) => setUserFilter(e.target.value)}
              value={userFilter}
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
            <button onClick={exportUsers} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Join Date</th>
                <th className="px-4 py-2 text-left">Last Active</th>
                <th className="px-4 py-2 text-left">Transactions</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr 
                  key={user._id} 
                  className={`border-b hover:bg-blue-50 ${
                    user.status === 'blocked' ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-4 py-2 text-blue-900 flex items-center gap-2">
                    {user.status === 'blocked' && <Lock className="text-red-500" size={16} />}
                    {user.name}
                  </td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                      user.status === 'inactive' ? 'bg-purple-100 text-purple-800' : 
                      user.status === 'blocked' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(user.lastActive).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{user.transactionCount}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {user.status !== 'blocked' ? (
                      <button
                        onClick={() => handleStatusChange(user._id, 'blocked')}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-1 bg-red-50 rounded"
                        title="Block User"
                      >
                        <Lock size={16} /> Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user._id, 'active')}
                        className="text-green-600 hover:text-green-800 flex items-center gap-1 px-2 py-1 bg-green-50 rounded"
                        title="Unblock User"
                      >
                        <Unlock size={16} /> Unblock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">All Transactions</h2>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-md"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="savings">Savings</option>
            </select>
            <button
              onClick={exportTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">User Status</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => {
                const user = users.find(u => u._id === tx.userId);
                return (
                  <tr 
                    key={tx._id} 
                    className={`border-b hover:bg-purple-50 ${
                      user?.status === 'blocked' ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-4 py-2 text-purple-900 flex items-center gap-2">
                      {user?.status === 'blocked' && <Lock className="text-red-500" size={16} />}
                      {tx.userName || 'Unknown'}
                    </td>
                    <td className="px-4 py-2">
                      {user ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                          user.status === 'blocked' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.type === 'income' ? 'bg-blue-100 text-blue-800' : 
                        tx.type === 'expense' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">${tx.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{tx.category}</td>
                    <td className="px-4 py-2">{new Date(tx.dateTime).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        tx.status === 'pending' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tx.status || 'completed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Trends Analysis */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-6 text-blue-700">Trends Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="font-semibold text-blue-800">Monthly Growth Rate</h3>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {monthlyGrowthRate > 0 ? '+' : ''}{monthlyGrowthRate.toFixed(1)}%
            </p>
            <p className="text-sm text-blue-600">compared to last month</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-purple-600" size={24} />
              <h3 className="font-semibold text-purple-800">Average Transaction</h3>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              ${averageTransactionAmount.toFixed(2)}
            </p>
            <p className="text-sm text-purple-600">average per transaction</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-600" size={24} />
              <h3 className="font-semibold text-green-800">User Retention</h3>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {userRetentionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-green-600">active retention rate</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="text-yellow-600" size={24} />
              <h3 className="font-semibold text-yellow-800">Top Categories</h3>
            </div>
            <ul className="space-y-1">
              {topCategories.slice(0, 3).map((cat) => (
                <li key={cat.category} className="flex justify-between items-center">
                  <span className="text-yellow-900">{cat.category}</span>
                  <span className="text-yellow-600">{cat.count} tx</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">User Insights</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                <span>
                  {stats.activeUsers} active users out of {stats.totalUsers} total
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Ban className="text-red-500" size={16} />
                <span>
                  {stats.blockedUsers} blocked accounts ({stats.totalUsers > 0 ? ((stats.blockedUsers / stats.totalUsers) * 100).toFixed(1) : 0}%)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={16} />
                <span>
                  Average {stats.activeUsers > 0 ? (stats.totalTransactions / stats.activeUsers).toFixed(1) : 0} transactions per active user
                </span>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-700 mb-4">Financial Metrics</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <DollarSign className="text-green-500" size={16} />
                <span>
                  Average monthly revenue: ${revenueData.length > 0 ? (stats.totalRevenue / revenueData.length).toFixed(2) : '0.00'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={16} />
                <span>
                  {monthlyGrowthRate > 0 ? 'Growth' : 'Decline'} of {Math.abs(monthlyGrowthRate).toFixed(1)}% this month
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Flag className="text-purple-500" size={16} />
                <span>
                  Top earning category: {topCategories[0]?.category || 'N/A'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Motivational/Admin Tip */}
      <div className="mt-8 p-4 bg-gradient-to-r from-gray-100 to-blue-200 rounded-lg text-center text-lg font-semibold text-blue-800 shadow">
        {motivation}
      </div>
    </div>
  );
}