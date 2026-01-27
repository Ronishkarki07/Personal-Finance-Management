/**
 * Categories Module - Manage income and expense categories
 */

const Categories = (() => {
    // ...existing code...

    const defaultExpenseCategories = [
        { name: 'Food & Dining', icon: '🍽️', color: '#f5576c' },
        { name: 'Transportation', icon: '🚗', color: '#f093fb' },
        { name: 'Rent', icon: '🏠', color: '#764ba2' },
        { name: 'Utilities', icon: '💡', color: '#feca57' },
        { name: 'Healthcare', icon: '🏥', color: '#43e97b' },
        { name: 'Entertainment', icon: '🎬', color: '#4facfe' },
        { name: 'Shopping', icon: '🛍️', color: '#f5576c' },
        { name: 'Education', icon: '📚', color: '#667eea' },
        { name: 'Internet & Phone', icon: '📱', color: '#38f9d7' },
        { name: 'Other Expenses', icon: '💸', color: '#a0aec0' }
    ];

    // No-op for PHP version; only static categories used
    async function initializeDefaultCategories() { return true; }

    // Not supported in PHP version
    async function getIncomeCategories() { return []; }

    /**
     * Get expense categories (static only)
     */
    async function getExpenseCategories() {
        return defaultExpenseCategories;
    }

    /**
     * Render page
     */
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Categories</h2>
            </div>
            <div class="dashboard-row">
                <div class="card">
                    <div class="card-header">
                        <h3>Expense Categories</h3>
                    </div>
                    <div class="card-body" id="expenseCategoriesContainer">
                        <p class="text-center">Loading...</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load categories
     */
    async function loadCategories() {
        const expenseCategories = await getExpenseCategories();
        const expenseContainer = document.getElementById('expenseCategoriesContainer');
        expenseContainer.innerHTML = expenseCategories.map(cat => `
            <div style="display: flex; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 1.5rem; margin-right: 0.75rem;">${cat.icon}</span>
                <span style="flex: 1; font-weight: 600;">${cat.name}</span>
                <span class="badge badge-danger">Expense</span>
            </div>
        `).join('');
    }

    /**
     * Initialize page
     */
    async function init() {
        const page = document.getElementById('categories-page');
        page.innerHTML = renderPage();
        await loadCategories();
    }

    return {
        initializeDefaultCategories,
        getIncomeCategories,
        getExpenseCategories,
        init
    };
})();
