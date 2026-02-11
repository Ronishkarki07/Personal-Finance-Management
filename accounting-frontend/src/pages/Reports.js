import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Calendar, DollarSign, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { expensesAPI, incomeAPI } from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [reportData, setReportData] = useState({
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      transactionCount: 0
    },
    categoryBreakdown: {
      income: [],
      expenses: []
    },
    monthlyTrends: []
  });

  const [activeTab, setActiveTab] = useState('summary');


  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      // Load expenses and income data
      const [expensesResponse, incomeResponse] = await Promise.all([
        expensesAPI.getExpenses(),
        incomeAPI.getIncome()
      ]);

      const expenses = expensesResponse.data;
      const income = incomeResponse.data;

      // Filter by date range
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= new Date(dateRange.startDate) && expenseDate <= new Date(dateRange.endDate);
      });

      const filteredIncome = income.filter(inc => {
        const incomeDate = new Date(inc.date);
        return incomeDate >= new Date(dateRange.startDate) && incomeDate <= new Date(dateRange.endDate);
      });

      // Calculate summary
      const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const totalIncome = filteredIncome.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
      const netIncome = totalIncome - totalExpenses;
      const transactionCount = filteredExpenses.length + filteredIncome.length;

      // Calculate category breakdown
      const expensesByCategory = {};
      const incomeByCategory = {};

      filteredExpenses.forEach(expense => {
        expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + parseFloat(expense.amount);
      });

      filteredIncome.forEach(inc => {
        incomeByCategory[inc.category] = (incomeByCategory[inc.category] || 0) + parseFloat(inc.amount);
      });

      const expenseCategoryBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0
      }));

      const incomeCategoryBreakdown = Object.entries(incomeByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0
      }));

      setReportData({
        summary: {
          totalIncome,
          totalExpenses,
          netIncome,
          transactionCount
        },
        categoryBreakdown: {
          income: incomeCategoryBreakdown,
          expenses: expenseCategoryBreakdown
        },
        monthlyTrends: [] // Could be implemented for more advanced reporting
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const exportReport = (format) => {
    // Basic CSV export functionality
    if (format === 'csv') {
      let csvContent = "Report Type,Category,Amount,Percentage\n";
      
      // Add income data
      reportData.categoryBreakdown.income.forEach(item => {
        csvContent += `Income,${item.category},${item.amount},${item.percentage}%\n`;
      });
      
      // Add expense data
      reportData.categoryBreakdown.expenses.forEach(item => {
        csvContent += `Expenses,${item.category},${item.amount},${item.percentage}%\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully!');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📊 Financial Reports</h2>
        <p className="page-subtitle">Comprehensive financial analysis and reporting</p>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Date Range:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="input input-sm"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="input input-sm"
              />
            </div>
            <button
              onClick={() => exportReport('csv')}
              className="btn btn-sm btn-outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="tabs mb-6">
        <button
          className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Summary
        </button>
        <button
          className={`tab ${activeTab === 'categories' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <PieChart className="w-4 h-4 mr-2" />
          Categories
        </button>
        <button
          className={`tab ${activeTab === 'detailed' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('detailed')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Detailed
        </button>
      </div>

      {loading && <div className="loading-spinner">Loading report data...</div>}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="stats-card bg-green-50 border-green-200">
            <div className="stats-icon bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="stats-content">
              <h3 className="stats-title text-green-700">Total Income</h3>
              <p className="stats-value text-green-800">{formatCurrency(reportData.summary.totalIncome)}</p>
            </div>
          </div>
          
          <div className="stats-card bg-red-50 border-red-200">
            <div className="stats-icon bg-red-100 text-red-600">
              <TrendingUp className="w-6 h-6 rotate-180" />
            </div>
            <div className="stats-content">
              <h3 className="stats-title text-red-700">Total Expenses</h3>
              <p className="stats-value text-red-800">{formatCurrency(reportData.summary.totalExpenses)}</p>
            </div>
          </div>
          
          <div className={`stats-card ${reportData.summary.netIncome >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className={`stats-icon ${reportData.summary.netIncome >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="stats-content">
              <h3 className={`stats-title ${reportData.summary.netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Income</h3>
              <p className={`stats-value ${reportData.summary.netIncome >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{formatCurrency(reportData.summary.netIncome)}</p>
            </div>
          </div>
          
          <div className="stats-card bg-purple-50 border-purple-200">
            <div className="stats-icon bg-purple-100 text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="stats-content">
              <h3 className="stats-title text-purple-700">Total Transactions</h3>
              <p className="stats-value text-purple-800">{reportData.summary.transactionCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Categories */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-green-600">Income by Category</h3>
            </div>
            <div className="card-body">
              {reportData.categoryBreakdown.income.length > 0 ? (
                <div className="space-y-3">
                  {reportData.categoryBreakdown.income.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{formatCurrency(item.amount)}</div>
                        <div className="text-sm text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No income data for selected period</p>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-red-600">Expenses by Category</h3>
            </div>
            <div className="card-body">
              {reportData.categoryBreakdown.expenses.length > 0 ? (
                <div className="space-y-3">
                  {reportData.categoryBreakdown.expenses.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">{formatCurrency(item.amount)}</div>
                        <div className="text-sm text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No expense data for selected period</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Tab */}
      {activeTab === 'detailed' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Detailed Financial Report</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Report Summary</h4>
                <p><strong>Period:</strong> {dateRange.startDate} to {dateRange.endDate}</p>
                <p><strong>Total Income:</strong> {formatCurrency(reportData.summary.totalIncome)}</p>
                <p><strong>Total Expenses:</strong> {formatCurrency(reportData.summary.totalExpenses)}</p>
                <p><strong>Net Result:</strong> 
                  <span className={reportData.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(reportData.summary.netIncome)}
                  </span>
                </p>
                <p><strong>Savings Rate:</strong> 
                  {reportData.summary.totalIncome > 0 ? 
                    `${((reportData.summary.netIncome / reportData.summary.totalIncome) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </p>
              </div>
              
              {reportData.summary.netIncome > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">🎉 Great job!</h4>
                  <p className="text-green-700">You have a positive net income for this period. Keep up the good work!</p>
                </div>
              )}
              
              {reportData.summary.netIncome < 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-700 mb-2">⚠️ Budget Alert</h4>
                  <p className="text-red-700">Your expenses exceeded your income this period. Consider reviewing your spending habits.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;