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
      <div className="page-container">
        <div className="page-header">
          <h2>Budget Management</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Budget Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> Set Budget
        </button>
      </div>

      {/* Period Selector */}
      <div className="card mb-4">
        <div className="card-body">
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
      </div>

      {/* Budget Overview */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Budget Overview - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</h3>
        </div>
        <div className="card-body">
          <div className="budget-overview">
            <div className="budget-stat">
              <div className="stat-icon" style={{ color: '#3b82f6' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Total Budget</span>
                <span className="stat-value">{formatCurrency(totalBudget)}</span>
              </div>
            </div>
            <div className="budget-stat">
              <div className="stat-icon" style={{ color: '#ef4444' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value">{formatCurrency(totalSpent)}</span>
              </div>
            </div>
            <div className="budget-stat">
              <div className="stat-icon" style={{ color: totalRemaining >= 0 ? '#22c55e' : '#ef4444' }}>
                <TrendingDown size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Remaining</span>
                <span className="stat-value" style={{ color: totalRemaining >= 0 ? '#22c55e' : '#ef4444' }}>
                  {formatCurrency(totalRemaining)}
                </span>
              </div>
            </div>
          </div>

          {totalBudget > 0 && (
            <div className="overall-progress mt-3">
              <div className="progress-info">
                <span>Overall Budget Progress</span>
                <span>{overallPercentage.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(overallPercentage, 100)}%`,
                    backgroundColor: getProgressBarColor(overallPercentage)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget List */}
      <div className="card">
        <div className="card-header">
          <h3>Category Budgets</h3>
        </div>
        <div className="card-body">
          {budgets.length > 0 ? (
            <div className="budget-grid">
              {budgets.map((budget) => {
                const status = getBudgetStatus(budget);
                const StatusIcon = status.icon;

                return (
                  <div key={budget.id} className="budget-card">
                    <div className="budget-card-header">
                      <div className="budget-category">
                        <span className="category-name">{budget.category}</span>
                        <div className="budget-status" style={{ color: status.color }}>
                          <StatusIcon size={16} />
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

                    <div className="budget-amounts">
                      <div className="amount-row">
                        <span>Budgeted:</span>
                        <span className="amount-budgeted">{formatCurrency(budget.budget_amount)}</span>
                      </div>
                      <div className="amount-row">
                        <span>Spent:</span>
                        <span className="amount-spent">{formatCurrency(budget.spent_amount)}</span>
                      </div>
                      <div className="amount-row">
                        <span>Remaining:</span>
                        <span
                          className={`amount-remaining ${budget.remaining_amount < 0 ? 'over-budget' : ''}`}
                        >
                          {formatCurrency(budget.remaining_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="budget-progress">
                      <div className="progress-info">
                        <span>{budget.spent_percentage.toFixed(1)}% used</span>
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
            <div className="empty-state">
              <DollarSign size={48} />
              <h3>No budgets set for this period</h3>
              <p>Start by setting budgets for your expense categories to track your spending.</p>
              <button
                className="btn btn-primary"
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