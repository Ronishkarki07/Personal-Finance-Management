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

  const incomeTotal = dashboardData.currentMonth.income;
  const expenseTotal = dashboardData.currentMonth.expenses;
  const balanceTotal = dashboardData.currentMonth.balance;
  const topExpenseCategory = dashboardData.expenseCategories.length
    ? [...dashboardData.expenseCategories].sort((a, b) => b.total - a.total)[0]
    : null;
  const topIncomeCategory = dashboardData.incomeCategories.length
    ? [...dashboardData.incomeCategories].sort((a, b) => b.total - a.total)[0]
    : null;
  const savingsRate = incomeTotal > 0 ? Math.round((balanceTotal / incomeTotal) * 100) : null;

  if (loading) {
    return (
      <div className="page-container dashboard-page">
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-hero">
        <div className="hero-left">
          <div className="hero-kicker">Financial Overview</div>
          <h2>Dashboard</h2>
          <p className="page-subtitle">Overview of your financial activity</p>
          <div className="hero-badges">
            <span className="badge">This month</span>
            {topExpenseCategory && (
              <span className="badge badge-muted">Top expense: {topExpenseCategory.name}</span>
            )}
          </div>
        </div>
        <div className="hero-right">
          <div className={`hero-balance ${balanceTotal >= 0 ? 'positive' : 'negative'}`}>
            <span className="hero-balance-label">Net balance</span>
            <span className="hero-balance-value">{formatCurrency(balanceTotal)}</span>
            <span className="hero-balance-meta">
              Income {formatCurrency(incomeTotal)} - Expenses {formatCurrency(expenseTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="insight-grid">
        <div className="insight-card">
          <span className="insight-label">Top Expense</span>
          <span className="insight-value">
            {topExpenseCategory ? topExpenseCategory.name : 'No data'}
          </span>
          <span className="insight-meta">
            {topExpenseCategory ? formatCurrency(topExpenseCategory.total) : 'Add expenses to see trends'}
          </span>
        </div>
        <div className="insight-card">
          <span className="insight-label">Top Income</span>
          <span className="insight-value">
            {topIncomeCategory ? topIncomeCategory.name : 'No data'}
          </span>
          <span className="insight-meta">
            {topIncomeCategory ? formatCurrency(topIncomeCategory.total) : 'Add income to see trends'}
          </span>
        </div>
        <div className="insight-card">
          <span className="insight-label">Savings Rate</span>
          <span className="insight-value">
            {savingsRate !== null ? `${savingsRate}%` : 'N/A'}
          </span>
          <span className="insight-meta">Based on current month balance</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-stats">
        <div className="stat-card income">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>This Month's Income</h3>
            <p className="stat-value">{formatCurrency(incomeTotal)}</p>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>This Month's Expenses</h3>
            <p className="stat-value">{formatCurrency(expenseTotal)}</p>
          </div>
        </div>

        <div className={`stat-card ${balanceTotal >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">
            {balanceTotal >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div className="stat-content">
            <h3>Balance</h3>
            <p className="stat-value">{formatCurrency(balanceTotal)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Charts */}
        <div className="dashboard-charts">
          <div className="card dashboard-card chart-card">
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
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
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

          <div className="card dashboard-card chart-card">
            <div className="card-header">
              <h3>Income vs Expenses</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'This Month',
                      income: incomeTotal,
                      expenses: expenseTotal
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="4 6" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#43e97b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" fill="#f5576c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card dashboard-card transaction-card">
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