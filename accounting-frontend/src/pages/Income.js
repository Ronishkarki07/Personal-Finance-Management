import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { incomeAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Income = () => {
  const [income, setIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: ''
  });

  useEffect(() => {
    loadIncome();
    loadCategories();
  }, []);

  const loadIncome = async () => {
    try {
      const response = await incomeAPI.getIncome();
      setIncome(response.data);
    } catch (error) {
      console.error('Error loading income:', error);
      toast.error('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.filter(cat => cat.type === 'income'));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingIncome) {
        await incomeAPI.updateIncome({ ...formData, id: editingIncome.id });
        toast.success('Income updated successfully!');
      } else {
        await incomeAPI.createIncome(formData);
        toast.success('Income added successfully!');
      }
      
      setShowModal(false);
      setEditingIncome(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: ''
      });
      loadIncome();
    } catch (error) {
      console.error('Error saving income:', error);
      toast.error('Failed to save income');
    }
  };

  const handleEdit = (incomeItem) => {
    setEditingIncome(incomeItem);
    setFormData({
      date: incomeItem.date.split('T')[0],
      category: incomeItem.category,
      description: incomeItem.description,
      amount: incomeItem.amount.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await incomeAPI.deleteIncome(id);
        toast.success('Income deleted successfully!');
        loadIncome();
      } catch (error) {
        console.error('Error deleting income:', error);
        toast.error('Failed to delete income');
      }
    }
  };

  const filteredIncome = income.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total income
  const calculateTotalIncome = () => {
    return filteredIncome.reduce((total, incomeItem) => total + parseFloat(incomeItem.amount || 0), 0);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Income</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Income</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> Add Income
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-header-content">
            <h3>Income History</h3>
            <div className="balance-display">
              <span className="balance-label">Total Income:</span>
              <span className="balance-amount income-amount">{formatCurrency(calculateTotalIncome())}</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Filters */}
          <div className="form-row mb-3">
            <div className="form-group">
              <div className="search-input">
                <Search size={20} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search income..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <select
                className="form-control"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncome.length > 0 ? (
                  filteredIncome.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.date)}</td>
                      <td>
                        <span className="category-badge income">
                          {item.category}
                        </span>
                      </td>
                      <td>{item.description}</td>
                      <td className="amount-positive">{formatCurrency(item.amount)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No income records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingIncome ? 'Edit Income' : 'Add Income'}</h3>
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
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
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
                  <label>Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount (Rs.)</label>
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
                  {editingIncome ? 'Update' : 'Add'} Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;