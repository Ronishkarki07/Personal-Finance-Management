import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { budgetsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    years.push(year);
  }

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, [selectedMonth, selectedYear]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetsAPI.getBudgets(selectedMonth, selectedYear);
      // Convert string values to numbers
      const budgetsData = (response.data.data || []).map(budget => ({
        ...budget,
        budget_amount: parseFloat(budget.budget_amount),
        spent_amount: parseFloat(budget.spent_amount),
        remaining_amount: parseFloat(budget.remaining_amount),
        spent_percentage: parseFloat(budget.spent_percentage)
      }));
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.filter(cat => cat.type === 'expense'));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBudget) {
        await budgetsAPI.updateBudget({ ...formData, id: editingBudget.id });
        toast.success('Budget updated successfully!');
      } else {
        await budgetsAPI.createBudget(formData);
        toast.success('Budget created successfully!');
      }

      setShowModal(false);
      setEditingBudget(null);
      setFormData({
        category: '',
        amount: '',
        month: selectedMonth,
        year: selectedYear
      });
      loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.budget_amount.toString(),
      month: budget.month,
      year: budget.year
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetsAPI.deleteBudget(id);
        toast.success('Budget deleted successfully!');
        loadBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error('Failed to delete budget');
      }
    }
  };

  const handlePeriodChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount).replace('NPR', 'Rs.');
  };

  const getProgressBarColor = (percentage) => {
    if (percentage <= 75) return '#22c55e'; // Green
    if (percentage <= 90) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getBudgetStatus = (budget) => {
    const percentage = budget.spent_percentage;
    if (percentage >= 100) return { status: 'over', icon: AlertTriangle, color: '#ef4444' };
    if (percentage >= 90) return { status: 'warning', icon: TrendingUp, color: '#f59e0b' };
    if (percentage >= 75) return { status: 'caution', icon: TrendingUp, color: '#f97316' };
    return { status: 'good', icon: TrendingDown, color: '#22c55e' };
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget_amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent_amount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="page-container budget-page">
        <div className="page-header">
          <h2>Budget Management</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container budget-page">
      <div className="budget-hero">
        <div className="hero-left">
          <div className="hero-kicker">Financial Planning</div>
          <h2>Budget Management</h2>
          <p className="page-subtitle">
            Set budgets, track spending, and stay on top of your financial goals for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </p>
          <div className="hero-badges">
            <span className="badge">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</span>
            {budgets.length > 0 && (
              <span className="badge badge-muted">{budgets.length} categories tracked</span>
            )}
          </div>
        </div>
        <div className="hero-right">
          <div className={`hero-balance ${totalRemaining >= 0 ? 'positive' : 'negative'}`}>
            <span className="hero-balance-label">Budget Health</span>
            <span className="hero-balance-value">
              {totalBudget > 0 ? `${overallPercentage.toFixed(1)}%` : 'No budgets'}
            </span>
            <span className="hero-balance-meta">
              {totalBudget > 0 ? `${formatCurrency(totalRemaining)} remaining` : 'Set your first budget'}
            </span>
          </div>
        </div>
      </div>

      <div className="budget-insights">
        <div className="insight-card">
          <span className="insight-label">Total Budget</span>
          <span className="insight-value">{formatCurrency(totalBudget)}</span>
          <span className="insight-meta">Allocated for this month</span>
        </div>
        <div className="insight-card">
          <span className="insight-label">Total Spent</span>
          <span className="insight-value">{formatCurrency(totalSpent)}</span>
          <span className="insight-meta">{totalBudget > 0 ? `${overallPercentage.toFixed(1)}% of budget` : 'No spending tracked'}</span>
        </div>
        <div className="insight-card">
          <span className="insight-label">Remaining</span>
          <span className="insight-value" style={{ color: totalRemaining >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatCurrency(totalRemaining)}
          </span>
          <span className="insight-meta">
            {totalRemaining >= 0 ? 'Within budget' : 'Over budget'}
          </span>
        </div>
      </div>

      {/* Period Selector & Actions */}
      <div className="card budget-controls">
        <div className="card-body">
          <div className="controls-grid">
            <div className="period-selector">
              <h4>Select Period</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Month</label>
                  <select
                    className="form-control"
                    value={selectedMonth}
                    onChange={(e) => handlePeriodChange(parseInt(e.target.value), selectedYear)}
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select
                    className="form-control"
                    value={selectedYear}
                    onChange={(e) => handlePeriodChange(selectedMonth, parseInt(e.target.value))}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="action-section">
              <h4>Quick Actions</h4>
              <button
                className="btn btn-primary btn-large"
                onClick={() => setShowModal(true)}
              >
                <Plus size={20} /> Set Budget
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      {totalBudget > 0 && (
        <div className="card budget-overview-card">
          <div className="card-header">
            <h3>Monthly Progress</h3>
          </div>
          <div className="card-body">
            <div className="overall-progress">
              <div className="progress-header">
                <div className="progress-info">
                  <span>Overall Budget Progress</span>
                  <span className="progress-percentage">{overallPercentage.toFixed(1)}%</span>
                </div>
                <div className="progress-status">
                  <span className={`status-badge ${
                    overallPercentage <= 75 ? 'good' : 
                    overallPercentage <= 90 ? 'warning' : 'danger'
                  }`}>
                    {overallPercentage <= 75 ? 'On Track' : 
                     overallPercentage <= 90 ? 'Caution' : 'Over Budget'}
                  </span>
                </div>
              </div>
              <div className="progress-bar modern">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(overallPercentage, 100)}%`,
                    backgroundColor: getProgressBarColor(overallPercentage)
                  }}
                />
              </div>
              <div className="progress-details">
                <div className="detail-item">
                  <span className="detail-label">Spent</span>
                  <span className="detail-value">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Budget</span>
                  <span className="detail-value">{formatCurrency(totalBudget)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="card budget-list-card">
        <div className="card-header">
          <h3>Category Budgets</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Add Budget
          </button>
        </div>
        <div className="card-body">
          {budgets.length > 0 ? (
            <div className="budget-grid modern">
              {budgets.map((budget) => {
                const status = getBudgetStatus(budget);
                const StatusIcon = status.icon;

                return (
                  <div key={budget.id} className="budget-card modern">
                    <div className="budget-card-header">
                      <div className="budget-category">
                        <div className="category-info">
                          <span className="category-name">{budget.category}</span>
                          <div className="budget-status" style={{ color: status.color }}>
                            <StatusIcon size={16} />
                            <span className="status-text">
                              {status.status === 'over' ? 'Over Budget' :
                               status.status === 'warning' ? 'Near Limit' :
                               status.status === 'caution' ? 'Caution' : 'On Track'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="budget-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(budget)}
                          title="Edit Budget"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(budget.id)}
                          title="Delete Budget"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="budget-amounts modern">
                      <div className="amount-row">
                        <span>Budgeted:</span>
                        <span className="amount-budgeted">{formatCurrency(budget.budget_amount)}</span>
                      </div>
                      <div className="amount-row">
                        <span>Spent:</span>
                        <span className="amount-spent">{formatCurrency(budget.spent_amount)}</span>
                      </div>
                      <div className="amount-row highlight">
                        <span>Remaining:</span>
                        <span
                          className={`amount-remaining ${budget.remaining_amount < 0 ? 'over-budget' : ''}`}
                        >
                          {formatCurrency(budget.remaining_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="budget-progress modern">
                      <div className="progress-info">
                        <span>{budget.spent_percentage.toFixed(1)}% used</span>
                        <span className="progress-amount">{formatCurrency(budget.spent_amount)} / {formatCurrency(budget.budget_amount)}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(budget.spent_percentage, 100)}%`,
                            backgroundColor: getProgressBarColor(budget.spent_percentage)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state modern">
              <DollarSign size={48} />
              <h3>No budgets set for this period</h3>
              <p>Start by setting budgets for your expense categories to track your spending and achieve your financial goals.</p>
              <button
                className="btn btn-primary btn-large"
                onClick={() => setShowModal(true)}
              >
                <Plus size={20} /> Set Your First Budget
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBudget ? 'Edit Budget' : 'Set Budget'}</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Budget Amount (Rs.)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Month</label>
                    <select
                      className="form-control"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      required
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <select
                      className="form-control"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    >
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBudget ? 'Update' : 'Set'} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;