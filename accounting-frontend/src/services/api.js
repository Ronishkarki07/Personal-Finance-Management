import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardAPI = {
  getDashboardData: () => apiClient.get('/dashboard'),
};

// Expenses API
export const expensesAPI = {
  getExpenses: () => apiClient.get('/expenses'),
  createExpense: (expense) => apiClient.post('/expenses', expense),
  updateExpense: (expense) => apiClient.put('/expenses', expense),
  deleteExpense: (id) => apiClient.delete(`/expenses?id=${id}`),
};

// Income API
export const incomeAPI = {
  getIncome: () => apiClient.get('/income'),
  createIncome: (income) => apiClient.post('/income', income),
  updateIncome: (income) => apiClient.put('/income', income),
  deleteIncome: (id) => apiClient.delete(`/income?id=${id}`),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => apiClient.get('/categories'),
  createCategory: (category) => apiClient.post('/categories', category),
  updateCategory: (category) => apiClient.put('/categories', category),
  deleteCategory: (id) => apiClient.delete(`/categories?id=${id}`),
};

export default apiClient;