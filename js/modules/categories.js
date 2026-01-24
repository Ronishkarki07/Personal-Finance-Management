/**
 * Categories Module - Manage income and expense categories
 */

const Categories = (() => {
    const defaultIncomeCategories = [
        { name: 'Salary', icon: '💼', color: '#43e97b' },
        { name: 'Freelance', icon: '💻', color: '#38f9d7' },
        { name: 'Business', icon: '🏢', color: '#667eea' },
        { name: 'Investment', icon: '📈', color: '#4facfe' },
        { name: 'Parents', icon: '👨‍👩‍👧‍👦', color: '#ff9ff3' },
        { name: 'Gift', icon: '🎁', color: '#f093fb' },
        { name: 'Other Income', icon: '💰', color: '#feca57' }
    ];

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

    /**
     * Initialize default categories
     */
    async function initializeDefaultCategories() {
        const existing = await Storage.getAll(Storage.STORES.CATEGORIES);
        const defaults = [...defaultIncomeCategories, ...defaultExpenseCategories];

        for (const cat of defaults) {
            // Check if this specific category already exists
            const exists = existing.some(e => e.name === cat.name && e.type === (defaultIncomeCategories.includes(cat) ? 'income' : 'expense'));

            if (!exists) {
                await Storage.save(Storage.STORES.CATEGORIES, {
                    id: Helpers.generateId(),
                    ...cat,
                    type: defaultIncomeCategories.includes(cat) ? 'income' : 'expense'
                });
            }
        }
    }

    /**
     * Get income categories
     */
    async function getIncomeCategories() {
        const all = await Storage.getAll(Storage.STORES.CATEGORIES);
        return all.filter(c => c.type === 'income' || defaultIncomeCategories.some(d => d.name === c.name));
    }

    /**
     * Get expense categories
     */
    async function getExpenseCategories() {
        const all = await Storage.getAll(Storage.STORES.CATEGORIES);
        return all.filter(c => c.type === 'expense' || defaultExpenseCategories.some(d => d.name === c.name));
    }

    /**
     * Render page
     */
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Categories</h2>
                <button class="btn btn-primary" id="addCategoryBtn">+ Add Category</button>
            </div>

            <div class="dashboard-row">
                <div class="card">
                    <div class="card-header">
                        <h3>Income Categories</h3>
                    </div>
                    <div class="card-body" id="incomeCategoriesContainer">
                        <p class="text-center">Loading...</p>
                    </div>
                </div>

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
        const incomeCategories = await getIncomeCategories();
        const expenseCategories = await getExpenseCategories();

        const incomeContainer = document.getElementById('incomeCategoriesContainer');
        const expenseContainer = document.getElementById('expenseCategoriesContainer');

        incomeContainer.innerHTML = incomeCategories.map(cat => `
            <div style="display: flex; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 1.5rem; margin-right: 0.75rem;">${cat.icon}</span>
                <span style="flex: 1; font-weight: 600;">${cat.name}</span>
                <span class="badge badge-success">Income</span>
            </div>
        `).join('');

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
