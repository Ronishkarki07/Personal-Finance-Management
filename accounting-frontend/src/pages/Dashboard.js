import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    currentMonth: { income: 0, expenses: 0, balance: 0 },
    recentTransactions: [],
    expenseCategories: [],
    incomeCategories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount).replace('NPR', 'Rs.');
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#f5576c', '#feca57'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Overview of your financial activity</p>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-stats">
        <div className="stat-card income">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>This Month's Income</h3>
            <p className="stat-value">{formatCurrency(dashboardData.currentMonth.income)}</p>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>This Month's Expenses</h3>
            <p className="stat-value">{formatCurrency(dashboardData.currentMonth.expenses)}</p>
          </div>
        </div>

        <div className={`stat-card ${dashboardData.currentMonth.balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">
            {dashboardData.currentMonth.balance >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div className="stat-content">
            <h3>Balance</h3>
            <p className="stat-value">{formatCurrency(dashboardData.currentMonth.balance)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Charts */}
        <div className="dashboard-charts">
          <div className="card">
            <div className="card-header">
              <h3>Expense Categories</h3>
            </div>
            <div className="card-body">
              {dashboardData.expenseCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {dashboardData.expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No expense data available</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Income vs Expenses</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'This Month',
                      income: dashboardData.currentMonth.income,
                      expenses: dashboardData.currentMonth.expenses
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#43e97b" />
                  <Bar dataKey="expenses" fill="#f5576c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3><Activity size={20} /> Recent Transactions</h3>
          </div>
          <div className="card-body">
            {dashboardData.recentTransactions.length > 0 ? (
              <div className="transaction-list">
                {dashboardData.recentTransactions.map((transaction, index) => (
                  <div key={index} className={`transaction-item ${transaction.type}`}>
                    <div className="transaction-info">
                      <h4>{transaction.description}</h4>
                      <p>{transaction.category} • {formatDate(transaction.date)}</p>
                    </div>
                    <div className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No recent transactions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;