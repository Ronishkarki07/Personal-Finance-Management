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
    <div className="page-container journal-container">
      <div className="page-header journal-header">
        <h2>📊 Financial Journal & Reports</h2>
        <p className="page-subtitle">Comprehensive financial analysis and reporting</p>
      </div>

      {/* Date Range Filter */}
      <div className="journal-controls">
        <div className="journal-period">
          <div className="period-selector">
            <Calendar className="period-icon" />
            <span className="period-label">Reporting Period:</span>
            <div className="date-inputs">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="journal-date-input"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="journal-date-input"
              />
            </div>
            <button
              onClick={() => exportReport('csv')}
              className="journal-export-btn"
            >
              <Download className="export-icon" />
              Export Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="journal-tabs">
        <button
          className={`journal-tab ${activeTab === 'summary' ? 'journal-tab-active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <BarChart3 className="tab-icon" />
          Trial Balance
        </button>
        <button
          className={`journal-tab ${activeTab === 'categories' ? 'journal-tab-active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <PieChart className="tab-icon" />
          General Ledger
        </button>
        <button
          className={`journal-tab ${activeTab === 'detailed' ? 'journal-tab-active' : ''}`}
          onClick={() => setActiveTab('detailed')}
        >
          <FileText className="tab-icon" />
          Financial Statement
        </button>
      </div>

      {loading && <div className="loading-spinner">Loading report data...</div>}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="journal-balance-sheet">
          <div className="balance-sheet-header">
            <h3>Trial Balance Summary</h3>
            <p className="balance-period">Period: {dateRange.startDate} to {dateRange.endDate}</p>
          </div>
          <div className="balance-accounts">
            <div className="account-entry debit-entry">
              <div className="account-header">
                <TrendingUp className="account-icon" />
                <span className="account-name">Total Revenue</span>
              </div>
              <div className="account-amount credit-amount">
                {formatCurrency(reportData.summary.totalIncome)}
              </div>
            </div>
            
            <div className="account-entry credit-entry">
              <div className="account-header">
                <TrendingUp className="account-icon expense-icon" />
                <span className="account-name">Total Expenses</span>
              </div>
              <div className="account-amount debit-amount">
                {formatCurrency(reportData.summary.totalExpenses)}
              </div>
            </div>
            
            <div className="account-entry balance-entry">
              <div className="account-header">
                <DollarSign className="account-icon" />
                <span className="account-name">Net Income (Loss)</span>
              </div>
              <div className={`account-amount ${reportData.summary.netIncome >= 0 ? 'credit-amount' : 'debit-amount'}`}>
                {formatCurrency(reportData.summary.netIncome)}
              </div>
            </div>
            
            <div className="account-entry info-entry">
              <div className="account-header">
                <FileText className="account-icon" />
                <span className="account-name">Total Transactions</span>
              </div>
              <div className="account-count">
                {reportData.summary.transactionCount} entries
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="journal-ledger">
          <div className="ledger-header">
            <h3>General Ledger - Account Summary</h3>
          </div>
          <div className="ledger-columns">
            {/* Income Ledger */}
            <div className="ledger-section">
              <div className="ledger-section-header credit-header">
                <h4>Revenue Accounts</h4>
              </div>
              <div className="ledger-entries">
                {reportData.categoryBreakdown.income.length > 0 ? (
                  reportData.categoryBreakdown.income.map((item, index) => (
                    <div key={index} className="ledger-entry credit-entry">
                      <div className="entry-details">
                        <span className="account-name">{item.category}</span>
                        <span className="account-percentage">{item.percentage}%</span>
                      </div>
                      <div className="entry-amount credit-amount">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-entries">No revenue entries for selected period</div>
                )}
              </div>
            </div>

            {/* Expense Ledger */}
            <div className="ledger-section">
              <div className="ledger-section-header debit-header">
                <h4>Expense Accounts</h4>
              </div>
              <div className="ledger-entries">
                {reportData.categoryBreakdown.expenses.length > 0 ? (
                  reportData.categoryBreakdown.expenses.map((item, index) => (
                    <div key={index} className="ledger-entry debit-entry">
                      <div className="entry-details">
                        <span className="account-name">{item.category}</span>
                        <span className="account-percentage">{item.percentage}%</span>
                      </div>
                      <div className="entry-amount debit-amount">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-entries">No expense entries for selected period</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Tab */}
      {activeTab === 'detailed' && (
        <div className="financial-statement">
          <div className="statement-header">
            <h3>Financial Statement</h3>
            <p className="statement-period">For the Period Ended {dateRange.endDate}</p>
          </div>
          <div className="statement-body">
            <div className="statement-section">
              <div className="section-title">Financial Position Summary</div>
              <div className="statement-grid">
                <div className="statement-row">
                  <span className="line-item">Reporting Period:</span>
                  <span className="line-value">{dateRange.startDate} to {dateRange.endDate}</span>
                </div>
                <div className="statement-row">
                  <span className="line-item">Total Revenue:</span>
                  <span className="line-value credit-value">{formatCurrency(reportData.summary.totalIncome)}</span>
                </div>
                <div className="statement-row">
                  <span className="line-item">Total Expenses:</span>
                  <span className="line-value debit-value">{formatCurrency(reportData.summary.totalExpenses)}</span>
                </div>
                <div className="statement-separator"></div>
                <div className="statement-row total-row">
                  <span className="line-item">Net Income (Loss):</span>
                  <span className={`line-value ${reportData.summary.netIncome >= 0 ? 'credit-value' : 'debit-value'}`}>
                    {formatCurrency(reportData.summary.netIncome)}
                  </span>
                </div>
                <div className="statement-row">
                  <span className="line-item">Savings Rate:</span>
                  <span className="line-value">
                    {reportData.summary.totalIncome > 0 ? 
                      `${((reportData.summary.netIncome / reportData.summary.totalIncome) * 100).toFixed(1)}%` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {reportData.summary.netIncome > 0 && (
              <div className="statement-note positive-note">
                <div className="note-header">📈 Positive Performance</div>
                <p>The entity shows a positive net income for this period, indicating profitable operations and effective financial management.</p>
              </div>
            )}
            
            {reportData.summary.netIncome < 0 && (
              <div className="statement-note negative-note">
                <div className="note-header">⚠️ Performance Alert</div>
                <p>The entity shows a net loss for this period. Management should review expense allocations and revenue strategies.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;