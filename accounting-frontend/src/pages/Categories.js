import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Tag, Filter } from 'lucide-react';
import { categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: '📁',
    color: '#667eea'
  });

  // Predefined icons for selection
  const availableIcons = [
    '💼', '💻', '🏢', '📈', '👨‍👩‍👧‍👦', '🎁', '💰', // Income icons
    '🍽️', '🚗', '🛍️', '🎬', '⚡', '🏥', '📚', '✈️', '🏠', '💆', '💸', '🎯', '📱', '🔧' // Expense icons
  ];

  // Predefined colors for selection
  const availableColors = [
    '#667eea', '#f093fb', '#43e97b', '#4facfe', '#ff9ff3', '#38f9d7',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#e74c3c', '#2ecc71',
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#8e44ad',
    '#16a085', '#f39800', '#d35400', '#c0392b', '#8e44ad', '#2980b9'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await categoriesAPI.updateCategory({ ...formData, id: editingCategory.id });
        toast.success('Category updated successfully!');
      } else {
        await categoriesAPI.createCategory(formData);
        toast.success('Category added successfully!');
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        type: 'expense',
        icon: '📁',
        color: '#667eea'
      });
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? This action cannot be undone.`)) {
      try {
        await categoriesAPI.deleteCategory(id);
        toast.success('Category deleted successfully!');
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || category.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group categories by type
  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Categories</h2>
        </div>
        <div className="loading-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Categories</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="category-filters">
        <div className="filter-group">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              className="form-control"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group">
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {/* Income Categories */}
        {(!filterType || filterType === 'income') && incomeCategories.length > 0 && (
          <div className="category-section">
            <h3 className="section-title income">
              <Tag size={20} />
              Income Categories ({incomeCategories.length})
            </h3>
            <div className="category-cards">
              {incomeCategories.map((category) => (
                <div key={category.id} className="category-card income">
                  <div className="category-header">
                    <div className="category-icon" style={{ backgroundColor: category.color }}>
                      {category.icon}
                    </div>
                    <div className="category-actions">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(category)}
                        title="Edit Category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(category.id, category.name)}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="category-info">
                    <h4 className="category-name">{category.name}</h4>
                    <span className="category-type income">Income</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense Categories */}
        {(!filterType || filterType === 'expense') && expenseCategories.length > 0 && (
          <div className="category-section">
            <h3 className="section-title expense">
              <Tag size={20} />
              Expense Categories ({expenseCategories.length})
            </h3>
            <div className="category-cards">
              {expenseCategories.map((category) => (
                <div key={category.id} className="category-card expense">
                  <div className="category-header">
                    <div className="category-icon" style={{ backgroundColor: category.color }}>
                      {category.icon}
                    </div>
                    <div className="category-actions">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(category)}
                        title="Edit Category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(category.id, category.name)}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="category-info">
                    <h4 className="category-name">{category.name}</h4>
                    <span className="category-type expense">Expense</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Categories Message */}
        {filteredCategories.length === 0 && (
          <div className="no-categories">
            <Tag size={48} />
            <h3>No categories found</h3>
            <p>
              {searchTerm || filterType 
                ? "No categories match your current filters" 
                : "Start by adding your first category"
              }
            </p>
            {!searchTerm && !filterType && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowModal(true)}
              >
                <Plus size={20} /> Add Your First Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
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
                  <label>Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-selector">
                    {availableIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <div className="color-selector">
                    {availableColors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Preview</label>
                  <div className="category-preview">
                    <div className="preview-icon" style={{ backgroundColor: formData.color }}>
                      {formData.icon}
                    </div>
                    <div className="preview-info">
                      <span className="preview-name">{formData.name || 'Category Name'}</span>
                      <span className={`preview-type ${formData.type}`}>
                        {formData.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </div>
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
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;