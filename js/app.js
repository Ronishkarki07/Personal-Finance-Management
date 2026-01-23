/**
 * Main Application Controller
 * Personal Finance Manager
 */

(async function () {
    'use strict';

    // Current page
    let currentPage = 'dashboard';

    /**
     * Initialize application
     */
    async function initApp() {
        console.log('💰 Personal Finance Manager - Initializing...');

        try {
            // Initialize database
            await Storage.initDB();
            console.log('✅ Database initialized');

            // Initialize categories
            await Categories.initializeDefaultCategories();
            console.log('✅ Categories initialized');

            // Setup event listeners
            setupEventListeners();
            console.log('✅ Event listeners setup');

            // Load dashboard
            await updateDashboard();
            console.log('✅ Dashboard loaded');

            // Update current month display
            updateMonthDisplay();

            console.log('✅ Application ready!');
            Helpers.showToast('Welcome to Personal Finance Manager! 💰');

        } catch (error) {
            console.error('❌ Initialization error:', error);
            Helpers.showToast('Error initializing application');
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', handleNavigation);
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);

        // Sidebar toggle (mobile)
        document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            Helpers.hideModal();
        });

        // Click outside modal to close
        document.getElementById('modalContainer').addEventListener('click', (e) => {
            if (e.target.id === 'modalContainer') {
                Helpers.hideModal();
            }
        });

        // Backup button
        document.getElementById('backupBtn').addEventListener('click', async () => {
            await Storage.backup();
        });

        // Restore button
        document.getElementById('restoreBtn').addEventListener('click', () => {
            Helpers.confirm('Are you sure you want to restore data? This will replace all current data.', () => {
                Storage.restore();
            });
        });

        // Quick actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', handleQuickAction);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    /**
     * Handle navigation
     */
    function handleNavigation(e) {
        e.preventDefault();
        const page = e.currentTarget.getAttribute('data-page');

        if (page === currentPage) return;

        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show selected page
        const pageElement = document.getElementById(`${page}-page`);
        pageElement.classList.add('active');

        // Initialize page content
        currentPage = page;
        loadPageContent(page);

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    }

    /**
     * Load page content
     */
    function loadPageContent(page) {
        switch (page) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'income':
                Income.init();
                break;
            case 'expenses':
                Expenses.init();
                break;
            case 'monthly-view':
                MonthlyView.init();
                break;
            case 'categories':
                Categories.init();
                break;
            case 'budget':
                Budget.init();
                break;
            case 'reports':
                Reports.init();
                break;
            case 'goals':
                Goals.init();
                break;
            case 'settings':
                loadSettingsPage();
                break;
        }
    }

    /**
     * Update dashboard
     */
    async function updateDashboard() {
        try {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Get all income and expenses
            const allIncome = await Storage.getAll(Storage.STORES.INCOME);
            const allExpenses = await Storage.getAll(Storage.STORES.EXPENSES);

            // Filter by current month
            const monthIncome = allIncome.filter(i => {
                const date = new Date(i.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });

            const monthExpenses = allExpenses.filter(e => {
                const date = new Date(e.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });

            // Calculate totals
            const totalIncome = monthIncome.reduce((sum, i) => sum + i.amount, 0);
            const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
            const netSavings = totalIncome - totalExpenses;
            const totalBalance = allIncome.reduce((sum, i) => sum + i.amount, 0) -
                allExpenses.reduce((sum, e) => sum + e.amount, 0);

            // Update summary cards
            document.getElementById('monthlyIncome').textContent = Helpers.formatCurrency(totalIncome);
            document.getElementById('monthlyExpenses').textContent = Helpers.formatCurrency(totalExpenses);

            const netElement = document.getElementById('netSavings');
            netElement.textContent = Helpers.formatCurrency(Math.abs(netSavings));
            netElement.className = netSavings >= 0 ? 'amount text-success' : 'amount text-danger';

            const balanceElement = document.getElementById('totalBalance');
            balanceElement.textContent = Helpers.formatCurrency(Math.abs(totalBalance));
            balanceElement.className = totalBalance >= 0 ? 'amount text-success' : 'amount text-danger';

            // Load recent transactions
            await loadRecentTransactions();

            // Load expense breakdown
            await loadExpenseBreakdown(monthExpenses);

        } catch (error) {
            console.error('Dashboard update error:', error);
        }
    }

    /**
     * Load recent transactions
     */
    async function loadRecentTransactions() {
        const allIncome = await Storage.getAll(Storage.STORES.INCOME);
        const allExpenses = await Storage.getAll(Storage.STORES.EXPENSES);

        // Combine and sort
        const transactions = [
            ...allIncome.map(i => ({ ...i, type: 'Income' })),
            ...allExpenses.map(e => ({ ...e, type: 'Expense' }))
        ];

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = transactions.slice(0, 10);

        const tbody = document.querySelector('#recentTransactionsTable tbody');

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions yet. Add income or expenses to get started!</td></tr>';
            return;
        }

        let html = '';
        recent.forEach(t => {
            const isIncome = t.type === 'Income';
            html += `
                <tr>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td><span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">${t.category}</span></td>
                    <td>${isIncome ? t.source : Helpers.truncate(t.description, 30)}</td>
                    <td><span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">${t.type}</span></td>
                    <td class="text-right"><strong class="${isIncome ? 'text-success' : 'text-danger'}">${Helpers.formatCurrency(t.amount)}</strong></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Load expense breakdown
     */
    async function loadExpenseBreakdown(monthExpenses) {
        const breakdown = document.getElementById('expenseBreakdown');

        if (monthExpenses.length === 0) {
            breakdown.innerHTML = '<p class="text-center" style="padding: 2rem; color: var(--text-secondary);">Add expenses to see breakdown</p>';
            return;
        }

        // Group by category
        const byCategory = {};
        monthExpenses.forEach(e => {
            if (!byCategory[e.category]) {
                byCategory[e.category] = 0;
            }
            byCategory[e.category] += e.amount;
        });

        // Sort by amount
        const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        let html = '';
        sorted.forEach(([category, amount]) => {
            const percentage = (amount / total * 100).toFixed(1);
            html += `
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600;">${category}</span>
                        <span>${Helpers.formatCurrency(amount)} (${percentage}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #f5576c, #f093fb);"></div>
                    </div>
                </div>
            `;
        });

        breakdown.innerHTML = html;
    }

    /**
     * Update month display
     */
    function updateMonthDisplay() {
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonthYear').textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }

    /**
     * Handle quick actions
     */
    function handleQuickAction(e) {
        const action = e.target.getAttribute('data-action');

        switch (action) {
            case 'add-income':
                Income.showAddIncomeForm();
                break;
            case 'add-expense':
                Expenses.showAddExpenseForm();
                break;
            case 'view-monthly':
                document.querySelector('[data-page="monthly-view"]').click();
                break;
            case 'view-reports':
                document.querySelector('[data-page="reports"]').click();
                break;
            case 'set-budget':
                document.querySelector('[data-page="budget"]').click();
                break;
            case 'add-goal':
                document.querySelector('[data-page="goals"]').click();
                break;
        }
    }

    /**
     * Toggle theme
     */
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');

        // Update icon
        const icon = document.querySelector('.theme-icon');
        icon.textContent = isDark ? '☀️' : '🌙';

        // Save preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        Helpers.showToast(`${isDark ? 'Dark' : 'Light'} mode activated`);
    }

    /**
     * Toggle sidebar (mobile)
     */
    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('active');
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + I: Add Income
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            Income.showAddIncomeForm();
        }

        // Ctrl/Cmd + E: Add Expense
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            Expenses.showAddExpenseForm();
        }

        // Escape: Close modal
        if (e.key === 'Escape') {
            Helpers.hideModal();
        }
    }

    /**
     * Load settings page
     */
    function loadSettingsPage() {
        const page = document.getElementById('settings-page');

        page.innerHTML = `
            <div class="page-header">
                <h2>Settings</h2>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Preferences</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label class="form-label">Theme</label>
                        <select class="form-control" id="themeSelect">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Currency</label>
                        <input type="text" class="form-control" value="NPR (Rs.)" disabled>
                    </div>

                    <div style="margin-top: 2rem;">
                        <button class="btn btn-primary" id="saveSettingsBtn">Save Settings</button>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top: 1.5rem;">
                <div class="card-header">
                    <h3>Data Management</h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; gap: 1rem;">
                        <button class="btn btn-secondary" onclick="Storage.backup()">💾 Backup Data</button>
                        <button class="btn btn-secondary" onclick="Storage.restore()">📥 Restore Data</button>
                        <button class="btn btn-danger" id="clearDataBtn">🗑️ Clear All Data</button>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top: 1.5rem;">
                <div class="card-header">
                    <h3>About</h3>
                </div>
                <div class="card-body">
                    <h4>💰 Personal Finance Manager</h4>
                    <p>Track your income, expenses, and savings goals.</p>
                    <p><strong>Features:</strong></p>
                    <ul>
                        <li>Track income from multiple sources</li>
                        <li>Manage expenses by category</li>
                        <li>Monthly financial overview</li>
                        <li>Budget planning</li>
                        <li>Savings goals tracking</li>
                        <li>Financial reports</li>
                    </ul>
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Built with:</strong> HTML, CSS, Vanilla JavaScript</p>
                    <p><strong>Keyboard Shortcuts:</strong></p>
                    <ul>
                        <li>Ctrl/Cmd + I: Add Income</li>
                        <li>Ctrl/Cmd + E: Add Expense</li>
                        <li>Escape: Close Modal</li>
                    </ul>
                </div>
            </div>
        `;

        // Load saved settings
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.getElementById('themeSelect').value = savedTheme;

        // Save settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            const theme = document.getElementById('themeSelect').value;

            if (theme === 'dark' && !document.body.classList.contains('dark-theme')) {
                document.getElementById('themeToggle').click();
            } else if (theme === 'light' && document.body.classList.contains('dark-theme')) {
                document.getElementById('themeToggle').click();
            }

            Helpers.showToast('Settings saved successfully');
        });

        // Clear data
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            Helpers.confirm('Are you sure you want to clear ALL data? This cannot be undone!', async () => {
                try {
                    for (const store of Object.values(Storage.STORES)) {
                        await Storage.clear(store);
                    }
                    Helpers.showToast('All data cleared');
                    setTimeout(() => location.reload(), 1000);
                } catch (error) {
                    Helpers.showToast('Error clearing data');
                    console.error(error);
                }
            });
        });
    }

    /**
     * Load saved theme
     */
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('.theme-icon').textContent = '☀️';
        }
    }

    /**
     * Initialize on DOM ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadSavedTheme();
            initApp();
        });
    } else {
        loadSavedTheme();
        initApp();
    }

    // Make updateDashboard globally accessible
    window.updateDashboard = updateDashboard;

})();
