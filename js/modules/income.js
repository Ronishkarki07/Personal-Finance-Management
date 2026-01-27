// Static income categories for PHP version
const staticIncomeCategories = [
    { name: 'Salary', icon: '💼', color: '#43e97b' },
    { name: 'Freelance', icon: '💻', color: '#38f9d7' },
    { name: 'Business', icon: '🏢', color: '#667eea' },
    { name: 'Investment', icon: '📈', color: '#4facfe' },
    { name: 'Parents', icon: '👨‍👩‍👧‍👦', color: '#ff9ff3' },
    { name: 'Gift', icon: '🎁', color: '#f093fb' },
    { name: 'Other Income', icon: '💰', color: '#feca57' }
];

// Helper to get static income categories
function getStaticIncomeCategories() {
    return staticIncomeCategories;
}
/**
 * Income Module - Track all income sources
 */

const Income = (() => {
    /**
     * Render income page
     */
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Income</h2>
                <button class="btn btn-primary" id="addIncomeBtn">+ Add Income</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Income History</h3>
                </div>
                <div class="card-body">
                    <div class="form-row mb-2">
                        <div class="form-group">
                            <input type="text" class="form-control" id="searchIncome" placeholder="Search income...">
                        </div>
                        <div class="form-group">
                            <select class="form-control" id="filterIncomeCategory">
                                <option value="">All Categories</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="incomeTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Source</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="incomeTableBody">
                                <tr>
                                    <td colspan="6" class="text-center">Loading...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load income table
     */
    async function loadIncomeTable(searchTerm = '', filterCategory = '') {
        let incomes = await Storage.getAll(Storage.STORES.INCOME);

        // Filter
        if (searchTerm) {
            incomes = incomes.filter(i =>
                i.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterCategory) {
            incomes = incomes.filter(i => i.category === filterCategory);
        }

        // Sort by date descending
        incomes.sort((a, b) => new Date(b.date) - new Date(a.date));

        const tbody = document.getElementById('incomeTableBody');
        if (incomes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No income records found</td></tr>';
            return;
        }

        let html = '';
        incomes.forEach(income => {
            html += `
                <tr>
                    <td>${new Date(income.date).toLocaleDateString()}</td>
                    <td><span class="badge badge-success">${income.category}</span></td>
                    <td>${income.source}</td>
                    <td>${Helpers.truncate(income.description, 40)}</td>
                    <td class="text-right"><strong>${Helpers.formatCurrency(income.amount)}</strong></td>
                    <td>
                        <button class="btn btn-secondary action-btn" onclick="Income.editIncome('${income.id}')">Edit</button>
                        <button class="btn btn-danger action-btn" onclick="Income.deleteIncome('${income.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Show add income form
     */
    async function showAddIncomeForm() {
        // Use static income categories for PHP version
        const categories = getStaticIncomeCategories();
        const categoryOptions = categories.map(c =>
            `<option value="${c.name}">${c.icon ? c.icon + ' ' : ''}${c.name}</option>`
        ).join('');

        const content = `
            <form id="addIncomeForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date *</label>
                        <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount (Rs.) *</label>
                        <input type="number" class="form-control" name="amount" step="0.01" min="0" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Category *</label>
                        <select class="form-control" name="category" required>
                            <option value="">Select Category</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Source *</label>
                        <input type="text" class="form-control" name="source" placeholder="e.g., Salary, Freelance Project" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" rows="3"></textarea>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Income</button>
                </div>
            </form>
        `;

        Helpers.showModal('Add Income', content);

        setTimeout(() => {
            document.getElementById('addIncomeForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const incomeData = Object.fromEntries(formData);

                try {
                    await createIncome(incomeData);
                    Helpers.hideModal();
                    Helpers.showToast('Income added successfully');
                    loadIncomeTable();
                    window.updateDashboard();
                } catch (error) {
                    Helpers.showToast('Error adding income');
                    console.error(error);
                }
            });
        }, 100);
    }

    /**
     * Create income
     */
    async function createIncome(incomeData) {
        const income = {
            id: Helpers.generateId(),
            date: incomeData.date,
            category: incomeData.category,
            source: incomeData.source,
            description: incomeData.description || '',
            amount: parseFloat(incomeData.amount),
            createdAt: new Date().toISOString()
        };

        await Storage.save(Storage.STORES.INCOME, income);
        return income;
    }

    /**
     * Edit income
     */
    async function editIncome(incomeId) {
        const income = await Storage.get(Storage.STORES.INCOME, incomeId);
        if (!income) return;

        const categories = await Categories.getIncomeCategories();
        const categoryOptions = categories.map(c =>
            `<option value="${c.name}" ${c.name === income.category ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        const content = `
            <form id="editIncomeForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date *</label>
                        <input type="date" class="form-control" name="date" value="${income.date}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount (Rs.) *</label>
                        <input type="number" class="form-control" name="amount" value="${income.amount}" step="0.01" min="0" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Category *</label>
                        <select class="form-control" name="category" required>
                            ${categoryOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Source *</label>
                        <input type="text" class="form-control" name="source" value="${income.source}" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" rows="3">${income.description}</textarea>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Income</button>
                </div>
            </form>
        `;

        Helpers.showModal('Edit Income', content);

        setTimeout(() => {
            document.getElementById('editIncomeForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = Object.fromEntries(formData);
                updates.amount = parseFloat(updates.amount);

                try {
                    await Storage.save(Storage.STORES.INCOME, { ...income, ...updates });
                    Helpers.hideModal();
                    Helpers.showToast('Income updated successfully');
                    loadIncomeTable();
                    window.updateDashboard();
                } catch (error) {
                    Helpers.showToast('Error updating income');
                    console.error(error);
                }
            });
        }, 100);
    }

    /**
     * Delete income
     */
    async function deleteIncome(incomeId) {
        Helpers.confirm('Are you sure you want to delete this income record?', async () => {
            try {
                await Storage.remove(Storage.STORES.INCOME, incomeId);
                Helpers.showToast('Income deleted successfully');
                loadIncomeTable();
                window.updateDashboard();
            } catch (error) {
                Helpers.showToast('Error deleting income');
                console.error(error);
            }
        });
    }

    /**
     * Initialize page
     */
    async function init() {
        const page = document.getElementById('income-page');
        page.innerHTML = renderPage();

        // Load categories for filter
        const categories = await Categories.getIncomeCategories();
        const filterSelect = document.getElementById('filterIncomeCategory');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            filterSelect.appendChild(option);
        });

        // Event listeners
        document.getElementById('addIncomeBtn').addEventListener('click', showAddIncomeForm);

        document.getElementById('searchIncome').addEventListener('input', Helpers.debounce((e) => {
            const searchTerm = e.target.value;
            const filterCategory = document.getElementById('filterIncomeCategory').value;
            loadIncomeTable(searchTerm, filterCategory);
        }, 300));

        document.getElementById('filterIncomeCategory').addEventListener('change', (e) => {
            const searchTerm = document.getElementById('searchIncome').value;
            const filterCategory = e.target.value;
            loadIncomeTable(searchTerm, filterCategory);
        });

        // Load table
        loadIncomeTable();
    }

    return {
        init,
        loadIncomeTable,
        showAddIncomeForm,
        createIncome,
        editIncome,
        deleteIncome
    };
})();
