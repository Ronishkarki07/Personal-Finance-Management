import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { incomeAPI, expensesAPI } from '../services/api';
import toast from 'react-hot-toast';

const MonthlyView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyData();
  }, [currentDate]);

  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      const [incomeResponse, expensesResponse] = await Promise.all([
        incomeAPI.getIncome(),
        expensesAPI.getExpenses()
      ]);

      // Filter data for current month/year
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyIncome = incomeResponse.data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });

      const monthlyExpenses = expensesResponse.data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });

      setIncome(monthlyIncome);
      setExpenses(monthlyExpenses);
    } catch (error) {
      console.error('Error loading monthly data:', error);
      toast.error('Failed to load monthly data');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  // Group by category
  const incomeByCategory = income.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
    return acc;
  }, {});

  const expensesByCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Monthly View</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Monthly View</h2>
        <div className="month-navigation">
          <button className="btn btn-secondary" onClick={() => navigateMonth('prev')}>
            <ChevronLeft size={20} />
          </button>
          <span className="month-year">{getMonthYear()}</span>
          <button className="btn btn-secondary" onClick={() => navigateMonth('next')}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card income">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Income</h3>
            <p className="amount">{formatCurrency(totalIncome)}</p>
            <span className="count">{income.length} transactions</span>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Expenses</h3>
            <p className="amount">{formatCurrency(totalExpenses)}</p>
            <span className="count">{expenses.length} transactions</span>
          </div>
        </div>

        <div className={`summary-card balance ${netBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-icon">
            <DollarSign size={24} />
          </div>
          <div className="summary-content">
            <h3>Net Balance</h3>
            <p className="amount">{formatCurrency(netBalance)}</p>
            <span className={`status ${netBalance >= 0 ? 'surplus' : 'deficit'}`}>
              {netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </div>
      </div>

      <div className="monthly-details">
        {/* Income Categories */}
        <div className="card">
          <div className="card-header">
            <h3>Income by Category</h3>
          </div>
          <div className="card-body">
            {Object.keys(incomeByCategory).length > 0 ? (
              <div className="category-breakdown">
                {Object.entries(incomeByCategory).map(([category, amount]) => (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category}</span>
                      <span className="category-amount income">{formatCurrency(amount)}</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress income" 
                        style={{ width: `${(amount / totalIncome) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No income records for this month</p>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="card">
          <div className="card-header">
            <h3>Expenses by Category</h3>
          </div>
          <div className="card-body">
            {Object.keys(expensesByCategory).length > 0 ? (
              <div className="category-breakdown">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category}</span>
                      <span className="category-amount expense">{formatCurrency(amount)}</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress expense" 
                        style={{ width: `${(amount / totalExpenses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No expense records for this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Transactions</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...income.map(item => ({...item, type: 'income'})), 
                  ...expenses.map(item => ({...item, type: 'expense'}))]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((item, index) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span className={`transaction-type ${item.type}`}>
                        {item.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.description}</td>
                    <td className={item.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                {[...income, ...expenses].length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">No transactions for this month</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;