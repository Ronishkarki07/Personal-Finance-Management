import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { goalsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: ''
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getGoals();
      setGoals(response.data);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.target_amount) {
      toast.error('Title and target amount are required');
      return;
    }

    try {
      if (editingGoal) {
        await goalsAPI.updateGoal({ ...formData, id: editingGoal.id });
        toast.success('Goal updated successfully!');
      } else {
        await goalsAPI.createGoal(formData);
        toast.success('Goal created successfully!');
      }
      
      setShowModal(false);
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        current_amount: '',
        target_date: ''
      });
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date ? goal.target_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await goalsAPI.deleteGoal(id);
      setGoals(goals.filter(goal => goal.id !== id));
      toast.success('Goal deleted successfully!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleProgressUpdate = async (goalId, newAmount) => {
    try {
      await goalsAPI.updateGoal({ id: goalId, current_amount: newAmount });
      loadGoals();
      toast.success('Progress updated successfully!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount).replace('NPR', 'Rs.');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'overdue': return <AlertTriangle size={16} />;
      case 'urgent': return <Clock size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      case 'urgent': return 'Urgent';
      default: return 'Active';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Goals</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Financial Goals</h2>
          <p className="page-subtitle">Set and track your financial goals</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <div className="goal-title">
                  <h3>{goal.title}</h3>
                  <div className={`goal-status ${getStatusColor(goal.status)}`}>
                    {getStatusIcon(goal.status)}
                    <span>{getStatusText(goal.status)}</span>
                  </div>
                </div>
                <div className="goal-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleEdit(goal)}
                    title="Edit goal"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(goal.id)}
                    title="Delete goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {goal.description && (
                <p className="goal-description">{goal.description}</p>
              )}

              <div className="goal-amounts">
                <div className="amount-info">
                  <DollarSign size={16} />
                  <span>Progress: {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
                </div>
                {goal.target_date && (
                  <div className="date-info">
                    <Calendar size={16} />
                    <span>Target: {formatDate(goal.target_date)}</span>
                  </div>
                )}
              </div>

              <div className="goal-progress">
                <div className="progress-info">
                  <span className="progress-text">{goal.progress_percentage || 0}% Complete</span>
                  <span className="remaining-amount">
                    {formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))} remaining
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${goal.status === 'completed' ? 'completed' : ''}`}
                    style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Progress Update */}
              <div className="progress-update">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const amount = prompt(`Update progress for "${goal.title}":\nCurrent: ${formatCurrency(goal.current_amount)}\nTarget: ${formatCurrency(goal.target_amount)}\n\nEnter new amount:`);
                    if (amount && !isNaN(amount) && parseFloat(amount) >= 0) {
                      handleProgressUpdate(goal.id, parseFloat(amount));
                    }
                  }}
                >
                  <TrendingUp size={14} />
                  Update Progress
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Target size={64} />
            <h3>No goals set yet</h3>
            <p>Start by creating your first financial goal. Set targets for savings, investments, or any financial milestone you want to achieve.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowModal(false);
                  setEditingGoal(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Goal Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your goal (optional)"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    placeholder="100000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current Amount (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGoal(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;