/**
 * Budget Module - Set and track monthly budgets
 */

const Budget = (() => {
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Budget Planning</h2>
                <button class="btn btn-primary" id="setBudgetBtn">Set Monthly Budget</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Monthly Budget Tracker</h3>
                </div>
                <div class="card-body">
                    <p class="text-center" style="padding: 2rem;">Budget planning feature</p>
                    <p class="text-center" style="color: var(--text-secondary);">Set monthly budgets for different expense categories and track your spending.</p>
                </div>
            </div>
        `;
    }

    function init() {
        const page = document.getElementById('budget-page');
        page.innerHTML = renderPage();
    }

    return { init };
})();
