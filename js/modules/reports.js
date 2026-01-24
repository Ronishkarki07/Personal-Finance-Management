/**
 * Reports Module - Personal Finance Reports
 */

const Reports = (() => {
    /**
     * Render reports page
     */
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Financial Reports</h2>
            </div>

            <div class="dashboard-grid">
                <div class="card" style="cursor: pointer;" onclick="Reports.showIncomeReport()">
                    <div class="card-body" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💵</div>
                        <h3>Income Report</h3>
                        <p style="color: var(--text-secondary);">View income by category</p>
                    </div>
                </div>

                <div class="card" style="cursor: pointer;" onclick="Reports.showExpenseReport()">
                    <div class="card-body" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💸</div>
                        <h3>Expense Report</h3>
                        <p style="color: var(--text-secondary);">View expenses by category</p>
                    </div>
                </div>

                <div class="card" style="cursor: pointer;" onclick="Reports.showMonthlySummary()">
                    <div class="card-body" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                        <h3>Monthly Summary</h3>
                        <p style="color: var(--text-secondary);">Month-by-month overview</p>
                    </div>
                </div>

                <div class="card" style="cursor: pointer;" onclick="Reports.showYearlySummary()">
                    <div class="card-body" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📈</div>
                        <h3>Yearly Summary</h3>
                        <p style="color: var(--text-secondary);">Annual financial overview</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show income report
     */
    async function showIncomeReport() {
        const allIncome = await Storage.getAll(Storage.STORES.INCOME);

        // Group by category
        const byCategory = {};
        let total = 0;

        allIncome.forEach(i => {
            if (!byCategory[i.category]) {
                byCategory[i.category] = 0;
            }
            byCategory[i.category] += i.amount;
            total += i.amount;
        });

        const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

        let tableRows = '';
        sorted.forEach(([category, amount]) => {
            const percentage = (amount / total * 100).toFixed(1);
            tableRows += `
                <tr>
                    <td>${category}</td>
                    <td class="text-right">${Helpers.formatCurrency(amount)}</td>
                    <td class="text-right">${percentage}%</td>
                </tr>
            `;
        });

        const content = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3>Income Report</h3>
                <p>Total Income: <strong>${Helpers.formatCurrency(total)}</strong></p>
            </div>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="3" class="text-center">No income data</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="Helpers.exportToCSV(${JSON.stringify(sorted.map(([cat, amt]) => ({ category: cat, amount: amt })))}, 'income-report.csv')">📥 Export CSV</button>
            </div>
        `;

        Helpers.showModal('Income Report', content);
    }

    /**
     * Show expense report
     */
    async function showExpenseReport() {
        const allExpenses = await Storage.getAll(Storage.STORES.EXPENSES);

        // Group by category
        const byCategory = {};
        let total = 0;

        allExpenses.forEach(e => {
            if (!byCategory[e.category]) {
                byCategory[e.category] = 0;
            }
            byCategory[e.category] += e.amount;
            total += e.amount;
        });

        const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

        let tableRows = '';
        sorted.forEach(([category, amount]) => {
            const percentage = (amount / total * 100).toFixed(1);
            tableRows += `
                <tr>
                    <td>${category}</td>
                    <td class="text-right">${Helpers.formatCurrency(amount)}</td>
                    <td class="text-right">${percentage}%</td>
                </tr>
            `;
        });

        const content = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3>Expense Report</h3>
                <p>Total Expenses: <strong>${Helpers.formatCurrency(total)}</strong></p>
            </div>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="3" class="text-center">No expense data</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="Helpers.exportToCSV(${JSON.stringify(sorted.map(([cat, amt]) => ({ category: cat, amount: amt })))}, 'expense-report.csv')">📥 Export CSV</button>
            </div>
        `;

        Helpers.showModal('Expense Report', content);
    }

    /**
     * Show monthly summary
     */
    async function showMonthlySummary() {
        const allIncome = await Storage.getAll(Storage.STORES.INCOME);
        const allExpenses = await Storage.getAll(Storage.STORES.EXPENSES);

        // Group by month
        const monthlyData = {};

        allIncome.forEach(i => {
            const date = new Date(i.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { income: 0, expenses: 0 };
            }
            monthlyData[key].income += i.amount;
        });

        allExpenses.forEach(e => {
            const date = new Date(e.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { income: 0, expenses: 0 };
            }
            monthlyData[key].expenses += e.amount;
        });

        const sorted = Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0]));

        let tableRows = '';
        sorted.forEach(([month, data]) => {
            const savings = data.income - data.expenses;
            tableRows += `
                <tr>
                    <td>${month}</td>
                    <td class="text-right">${Helpers.formatCurrency(data.income)}</td>
                    <td class="text-right">${Helpers.formatCurrency(data.expenses)}</td>
                    <td class="text-right ${savings >= 0 ? 'text-success' : 'text-danger'}"><strong>${Helpers.formatCurrency(Math.abs(savings))}</strong></td>
                </tr>
            `;
        });

        const content = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3>Monthly Summary</h3>
            </div>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Income</th>
                            <th>Expenses</th>
                            <th>Savings</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="4" class="text-center">No data available</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;

        Helpers.showModal('Monthly Summary', content);
    }

    /**
     * Show yearly summary
     */
    async function showYearlySummary() {
        const allIncome = await Storage.getAll(Storage.STORES.INCOME);
        const allExpenses = await Storage.getAll(Storage.STORES.EXPENSES);

        // Group by year
        const yearlyData = {};

        allIncome.forEach(i => {
            const year = new Date(i.date).getFullYear();
            if (!yearlyData[year]) {
                yearlyData[year] = { income: 0, expenses: 0 };
            }
            yearlyData[year].income += i.amount;
        });

        allExpenses.forEach(e => {
            const year = new Date(e.date).getFullYear();
            if (!yearlyData[year]) {
                yearlyData[year] = { income: 0, expenses: 0 };
            }
            yearlyData[year].expenses += e.amount;
        });

        const sorted = Object.entries(yearlyData).sort((a, b) => b[0] - a[0]);

        let tableRows = '';
        sorted.forEach(([year, data]) => {
            const savings = data.income - data.expenses;
            tableRows += `
                <tr>
                    <td>${year}</td>
                    <td class="text-right">${Helpers.formatCurrency(data.income)}</td>
                    <td class="text-right">${Helpers.formatCurrency(data.expenses)}</td>
                    <td class="text-right ${savings >= 0 ? 'text-success' : 'text-danger'}"><strong>${Helpers.formatCurrency(Math.abs(savings))}</strong></td>
                </tr>
            `;
        });

        const content = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3>Yearly Summary</h3>
            </div>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Income</th>
                            <th>Expenses</th>
                            <th>Savings</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="4" class="text-center">No data available</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;

        Helpers.showModal('Yearly Summary', content);
    }

    /**
     * Initialize page
     */
    function init() {
        const page = document.getElementById('reports-page');
        page.innerHTML = renderPage();
    }

    return {
        init,
        showIncomeReport,
        showExpenseReport,
        showMonthlySummary,
        showYearlySummary
    };
})();
