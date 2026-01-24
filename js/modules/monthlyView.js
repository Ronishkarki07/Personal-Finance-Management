/**
 * Monthly View Module - View income and expenses by month
 */

const MonthlyView = (() => {
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    /**
     * Render page
     */
    function renderPage() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        return `
            <div class="page-header">
                <h2>Monthly View</h2>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <button class="btn btn-secondary" id="prevMonthBtn">← Previous</button>
                    <span id="currentMonthDisplay" style="font-weight: 600; font-size: 1.125rem;">${monthNames[currentMonth]} ${currentYear}</span>
                    <button class="btn btn-secondary" id="nextMonthBtn">Next →</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card summary-card">
                    <div class="card-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">💵</div>
                    <div class="card-content">
                        <h3>Total Income</h3>
                        <p class="amount" id="monthTotalIncome">Rs. 0.00</p>
                    </div>
                </div>

                <div class="card summary-card">
                    <div class="card-icon" style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);">💸</div>
                    <div class="card-content">
                        <h3>Total Expenses</h3>
                        <p class="amount" id="monthTotalExpenses">Rs. 0.00</p>
                    </div>
                </div>

                <div class="card summary-card">
                    <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">💰</div>
                    <div class="card-content">
                        <h3>Net Savings</h3>
                        <p class="amount" id="monthNetSavings">Rs. 0.00</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-row">
                <div class="card">
                    <div class="card-header">
                        <h3>Income This Month</h3>
                    </div>
                    <div class="card-body">
                        <div id="monthIncomeList"></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Expenses This Month</h3>
                    </div>
                    <div class="card-body">
                        <div id="monthExpenseList"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load monthly data
     */
    async function loadMonthlyData() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        document.getElementById('currentMonthDisplay').textContent = `${monthNames[currentMonth]} ${currentYear}`;

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

        // Update summary cards
        document.getElementById('monthTotalIncome').textContent = Helpers.formatCurrency(totalIncome);
        document.getElementById('monthTotalExpenses').textContent = Helpers.formatCurrency(totalExpenses);
        const netElement = document.getElementById('monthNetSavings');
        netElement.textContent = Helpers.formatCurrency(Math.abs(netSavings));
        netElement.className = netSavings >= 0 ? 'amount text-success' : 'amount text-danger';

        // Display income list
        const incomeList = document.getElementById('monthIncomeList');
        if (monthIncome.length === 0) {
            incomeList.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">No income this month</p>';
        } else {
            incomeList.innerHTML = monthIncome.map(i => `
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-tertiary); border-radius: 8px;">
                    <div>
                        <div style="font-weight: 600;">${i.source}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${i.category} • ${new Date(i.date).toLocaleDateString()}</div>
                    </div>
                    <div style="font-weight: 700; color: var(--success-color);">${Helpers.formatCurrency(i.amount)}</div>
                </div>
            `).join('');
        }

        // Display expense list
        const expenseList = document.getElementById('monthExpenseList');
        if (monthExpenses.length === 0) {
            expenseList.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">No expenses this month</p>';
        } else {
            expenseList.innerHTML = monthExpenses.map(e => `
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-tertiary); border-radius: 8px;">
                    <div>
                        <div style="font-weight: 600;">${e.description}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${e.category} • ${new Date(e.date).toLocaleDateString()}</div>
                    </div>
                    <div style="font-weight: 700; color: var(--danger-color);">${Helpers.formatCurrency(e.amount)}</div>
                </div>
            `).join('');
        }
    }

    /**
     * Navigate to previous month
     */
    function prevMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        loadMonthlyData();
    }

    /**
     * Navigate to next month
     */
    function nextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        loadMonthlyData();
    }

    /**
     * Initialize page
     */
    async function init() {
        const page = document.getElementById('monthly-view-page');
        page.innerHTML = renderPage();

        document.getElementById('prevMonthBtn').addEventListener('click', prevMonth);
        document.getElementById('nextMonthBtn').addEventListener('click', nextMonth);

        await loadMonthlyData();
    }

    return {
        init
    };
})();
