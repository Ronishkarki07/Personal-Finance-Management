/**
 * Expenses Module - Track all expenses
 */

const Expenses = (() => {
    /**
     * Render expenses page
     */
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Expenses</h2>
                <button class="btn btn-primary" id="addExpenseBtn">+ Add Expense</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Expense History</h3>
                </div>
                <div class="card-body">
                    <div class="form-row mb-2">
                        <div class="form-group">
                            <input type="text" class="form-control" id="searchExpense" placeholder="Search expenses...">
                        </div>
                        <div class="form-group">
                            <select class="form-control" id="filterExpenseCategory">
                                <option value="">All Categories</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="expenseTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Payment Method</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="expenseTableBody">
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
     * Load expense table
     */
    async function loadExpenseTable(searchTerm = '', filterCategory = '') {
        let expenses = await Storage.getAll(Storage.STORES.EXPENSES);

        // Filter
        if (searchTerm) {
            expenses = expenses.filter(e =>
                e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterCategory) {
            expenses = expenses.filter(e => e.category === filterCategory);
        }

        // Sort by date descending
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        const tbody = document.getElementById('expenseTableBody');
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No expense records found</td></tr>';
            return;
        }

        let html = '';
        expenses.forEach(expense => {
            html += `
                <tr>
                    <td>${new Date(expense.date).toLocaleDateString()}</td>
                    <td><span class="badge badge-danger">${expense.category}</span></td>
                    <td>${Helpers.truncate(expense.description, 40)}</td>
                    <td>${expense.paymentMethod}</td>
                    <td class="text-right"><strong>${Helpers.formatCurrency(expense.amount)}</strong></td>
                    <td>
                        <button class="btn btn-secondary action-btn" onclick="Expenses.editExpense('${expense.id}')">Edit</button>
                        <button class="btn btn-danger action-btn" onclick="Expenses.deleteExpense('${expense.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Show add expense form
     */
    async function showAddExpenseForm() {
        const categories = await Categories.getExpenseCategories();
        const categoryOptions = categories.map(c =>
            `<option value="${c.name}">${c.name}</option>`
        ).join('');

        const content = `
            <form id="addExpenseForm">
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
                        <label class="form-label">Payment Method *</label>
                        <select class="form-control" name="paymentMethod" required>
                            <option value="">Select Method</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Card</option>
                            <option value="Mobile Payment">Mobile Payment (eSewa, Khalti, etc.)</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Bill Photo</label>
                    <input type="file" class="form-control" name="billPhoto" accept="image/*">
                </div>

                <div class="form-group">
                    <label class="form-label">Description *</label>
                    <textarea class="form-control" name="description" rows="3" required></textarea>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Expense</button>
                </div>
            </form>
        `;

        Helpers.showModal('Add Expense', content);

        setTimeout(() => {
            document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const expenseData = Object.fromEntries(formData);
                const fileInput = e.target.elements['billPhoto'];
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    expenseData.billPhoto = await Helpers.fileToBase64(file);
                }
                try {
                    await createExpense(expenseData);
                    Helpers.hideModal();
                    Helpers.showToast('Expense added successfully');
                    loadExpenseTable();
                    window.updateDashboard();
                } catch (error) {
                    Helpers.showToast('Error adding expense');
                    console.error(error);
                }
            });
        }, 100);
    }

    /**
     * Create expense
     */
    async function createExpense(expenseData) {
        const expense = {
            id: Helpers.generateId(),
            date: expenseData.date,
            category: expenseData.category,
            description: expenseData.description,
            paymentMethod: expenseData.paymentMethod,
            amount: parseFloat(expenseData.amount),
            createdAt: new Date().toISOString(),
            billPhoto: expenseData.billPhoto || null
        };
        await Storage.save(Storage.STORES.EXPENSES, expense);
        return expense;
    }

    /**
     * Edit expense
     */
    async function editExpense(expenseId) {
        const expense = await Storage.get(Storage.STORES.EXPENSES, expenseId);
        if (!expense) return;

        const categories = await Categories.getExpenseCategories();
        const categoryOptions = categories.map(c =>
            `<option value="${c.name}" ${c.name === expense.category ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        const content = `
            <form id="editExpenseForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date *</label>
                        <input type="date" class="form-control" name="date" value="${expense.date}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount (Rs.) *</label>
                        <input type="number" class="form-control" name="amount" value="${expense.amount}" step="0.01" min="0" required>
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
                        <label class="form-label">Payment Method *</label>
                        <select class="form-control" name="paymentMethod" required>
                            <option value="Cash" ${expense.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                            <option value="Bank Transfer" ${expense.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                            <option value="Card" ${expense.paymentMethod === 'Card' ? 'selected' : ''}>Card</option>
                            <option value="Mobile Payment" ${expense.paymentMethod === 'Mobile Payment' ? 'selected' : ''}>Mobile Payment (eSewa, Khalti, etc.)</option>
                            <option value="Other" ${expense.paymentMethod === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Bill Photo</label>
                    <input type="file" class="form-control" name="billPhoto" accept="image/*">
                    ${expense.billPhoto ? `<div style='margin-top:0.5rem'><img src='${expense.billPhoto}' alt='Bill Photo' style='max-width:100px;max-height:100px;'/></div>` : ''}
                </div>

                <div class="form-group">
                    <label class="form-label">Description *</label>
                    <textarea class="form-control" name="description" rows="3" required>${expense.description}</textarea>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Expense</button>
                </div>
            </form>
        `;

        Helpers.showModal('Edit Expense', content);

        setTimeout(() => {
            document.getElementById('editExpenseForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = Object.fromEntries(formData);
                updates.amount = parseFloat(updates.amount);
                const fileInput = e.target.elements['billPhoto'];
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    updates.billPhoto = await Helpers.fileToBase64(file);
                } else {
                    updates.billPhoto = expense.billPhoto || null;
                }
                try {
                    await Storage.save(Storage.STORES.EXPENSES, { ...expense, ...updates });
                    Helpers.hideModal();
                    Helpers.showToast('Expense updated successfully');
                    loadExpenseTable();
                    window.updateDashboard();
                } catch (error) {
                    Helpers.showToast('Error updating expense');
                    console.error(error);
                }
            });
        }, 100);
    }

    /**
     * Delete expense
     */
    async function deleteExpense(expenseId) {
        Helpers.confirm('Are you sure you want to delete this expense record?', async () => {
            try {
                await Storage.remove(Storage.STORES.EXPENSES, expenseId);
                Helpers.showToast('Expense deleted successfully');
                loadExpenseTable();
                window.updateDashboard();
            } catch (error) {
                Helpers.showToast('Error deleting expense');
                console.error(error);
            }
        });
    }

    /**
     * Initialize page
     */
    async function init() {
        const page = document.getElementById('expenses-page');
        page.innerHTML = renderPage();

        // Load categories for filter
        const categories = await Categories.getExpenseCategories();
        const filterSelect = document.getElementById('filterExpenseCategory');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            filterSelect.appendChild(option);
        });

        // Event listeners
        document.getElementById('addExpenseBtn').addEventListener('click', showAddExpenseForm);

        document.getElementById('searchExpense').addEventListener('input', Helpers.debounce((e) => {
            const searchTerm = e.target.value;
            const filterCategory = document.getElementById('filterExpenseCategory').value;
            loadExpenseTable(searchTerm, filterCategory);
        }, 300));

        document.getElementById('filterExpenseCategory').addEventListener('change', (e) => {
            const searchTerm = document.getElementById('searchExpense').value;
            const filterCategory = e.target.value;
            loadExpenseTable(searchTerm, filterCategory);
        });

        // Load table
        loadExpenseTable();
    }

    return {
        init,
        loadExpenseTable,
        showAddExpenseForm,
        createExpense,
        editExpense,
        deleteExpense
    };
})();
