import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity, Calendar, Target, PlusCircle, Eye, BarChart3 } from 'lucide-react';
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
  const [animatedValues, setAnimatedValues] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  // Animate values when data loads
  useEffect(() => {
    if (dashboardData.currentMonth.income > 0 || dashboardData.currentMonth.expenses > 0) {
      const duration = 1000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        setAnimatedValues({
          income: Math.round(dashboardData.currentMonth.income * easeOutQuart),
          expenses: Math.round(dashboardData.currentMonth.expenses * easeOutQuart),
          balance: Math.round(dashboardData.currentMonth.balance * easeOutQuart)
        });
        
        if (step >= steps) {
          clearInterval(interval);
          setAnimatedValues({
            income: dashboardData.currentMonth.income,
            expenses: dashboardData.currentMonth.expenses,
            balance: dashboardData.currentMonth.balance
          });
        }
      }, stepDuration);
    }
  }, [dashboardData.currentMonth]);

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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getFinancialHealthScore = () => {
    if (incomeTotal === 0) return { score: 0, status: 'No Data', color: '#9ca3af' };
    
    const savingsRatio = balanceTotal / incomeTotal;
    const expenseRatio = expenseTotal / incomeTotal;
    
    let score = 0;
    if (savingsRatio >= 0.2) score += 40;
    else if (savingsRatio >= 0.1) score += 25;
    else if (savingsRatio >= 0) score += 10;
    
    if (expenseRatio <= 0.7) score += 30;
    else if (expenseRatio <= 0.8) score += 20;
    else if (expenseRatio <= 0.9) score += 10;
    
    if (dashboardData.recentTransactions.length >= 5) score += 20;
    else score += dashboardData.recentTransactions.length * 4;
    
    if (dashboardData.expenseCategories.length >= 3) score += 10;
    
    let status = 'Poor';
    let color = '#ef4444';
    
    if (score >= 80) { status = 'Excellent'; color = '#22c55e'; }
    else if (score >= 60) { status = 'Good'; color = '#3b82f6'; }
    else if (score >= 40) { status = 'Fair'; color = '#f59e0b'; }
    
    return { score: Math.min(score, 100), status, color };
  };

  const getSpendingTrend = () => {
    if (dashboardData.recentTransactions.length < 2) return 'stable';
    
    const recent = dashboardData.recentTransactions.slice(0, 3)
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const older = dashboardData.recentTransactions.slice(3, 6)
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (recent > older * 1.2) return 'increasing';
    if (recent < older * 0.8) return 'decreasing';
    return 'stable';
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
  const healthScore = getFinancialHealthScore();
  const spendingTrend = getSpendingTrend();

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
          <div className="hero-kicker">
            <Calendar size={14} />
            Financial Overview • {formatTime(currentTime)}
          </div>
          <h2>Dashboard</h2>
          <p className="page-subtitle">Complete overview of your financial activity and trends</p>
          <div className="hero-badges">
            <span className="badge">This month</span>
            {topExpenseCategory && (
              <span className="badge badge-muted">Top expense: {topExpenseCategory.name}</span>
            )}
            <span className={`badge badge-status ${spendingTrend}`}>
              Spending: {spendingTrend}
            </span>
          </div>
        </div>
        <div className="hero-right">
          <div className={`hero-balance ${balanceTotal >= 0 ? 'positive' : 'negative'}`}>
            <span className="hero-balance-label">Net Balance</span>
            <span className="hero-balance-value">{formatCurrency(animatedValues.balance)}</span>
            <span className="hero-balance-meta">
              Income {formatCurrency(animatedValues.income)} - Expenses {formatCurrency(animatedValues.expenses)}
            </span>
            <div className="balance-trend">
              <div className="health-score">
                <div className="score-circle" style={{ borderColor: healthScore.color }}>
                  <span style={{ color: healthScore.color }}>{healthScore.score}</span>
                </div>
                <span className="score-label">Health Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="insight-section">
          <div className="insight-grid">
            <div className="insight-card premium">
              <div className="insight-icon">
                <Target size={20} />
              </div>
              <div className="insight-content">
                <span className="insight-label">Financial Health</span>
                <span className="insight-value" style={{ color: healthScore.color }}>
                  {healthScore.status}
                </span>
                <span className="insight-meta">{healthScore.score}/100 score</span>
              </div>
            </div>
            <div className="insight-card premium">
              <div className="insight-icon">
                <TrendingUp size={20} />
              </div>
              <div className="insight-content">
                <span className="insight-label">Top Expense</span>
                <span className="insight-value">
                  {topExpenseCategory ? topExpenseCategory.name : 'No data'}
                </span>
                <span className="insight-meta">
                  {topExpenseCategory ? formatCurrency(topExpenseCategory.total) : 'Add expenses to see trends'}
                </span>
              </div>
            </div>
            <div className="insight-card premium">
              <div className="insight-icon">
                <DollarSign size={20} />
              </div>
              <div className="insight-content">
                <span className="insight-label">Savings Rate</span>
                <span className="insight-value">
                  {savingsRate !== null ? `${savingsRate}%` : 'N/A'}
                </span>
                <span className="insight-meta">
                  {savingsRate !== null && savingsRate >= 20 ? 'Excellent saving!' : 
                   savingsRate !== null && savingsRate >= 10 ? 'Good progress' : 
                   'Consider saving more'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h4>Quick Actions</h4>
          <div className="action-buttons">
            <button className="action-btn income">
              <PlusCircle size={16} />
              <span>Add Income</span>
            </button>
            <button className="action-btn expense">
              <TrendingDown size={16} />
              <span>Add Expense</span>
            </button>
            <button className="action-btn reports">
              <BarChart3 size={16} />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="dashboard-stats premium">
        <div className="stat-card income premium">
          <div className="stat-background"></div>
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Monthly Income</h3>
            <p className="stat-value">{formatCurrency(animatedValues.income)}</p>
            <div className="stat-trend positive">
              <TrendingUp size={14} />
              <span>+12.5% vs last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card expense premium">
          <div className="stat-background"></div>
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>Monthly Expenses</h3>
            <p className="stat-value">{formatCurrency(animatedValues.expenses)}</p>
            <div className={`stat-trend ${spendingTrend === 'increasing' ? 'negative' : 'positive'}`}>
              {spendingTrend === 'increasing' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>Trend: {spendingTrend}</span>
            </div>
          </div>
        </div>

        <div className={`stat-card ${balanceTotal >= 0 ? 'positive' : 'negative'} premium`}>
          <div className="stat-background"></div>
          <div className="stat-icon">
            {balanceTotal >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div className="stat-content">
            <h3>Net Balance</h3>
            <p className="stat-value">{formatCurrency(animatedValues.balance)}</p>
            <div className={`stat-trend ${balanceTotal >= 0 ? 'positive' : 'negative'}`}>
              {balanceTotal >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{balanceTotal >= 0 ? 'Surplus' : 'Deficit'}</span>
            </div>
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