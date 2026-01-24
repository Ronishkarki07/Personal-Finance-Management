/**
 * Goals Module - Set and track savings goals
 */

const Goals = (() => {
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Savings Goals</h2>
                <button class="btn btn-primary" id="addGoalBtn">+ Add Goal</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Your Savings Goals</h3>
                </div>
                <div class="card-body">
                    <p class="text-center" style="padding: 2rem;">Savings goals feature</p>
                    <p class="text-center" style="color: var(--text-secondary);">Set financial goals like buying a car, vacation, emergency fund, etc. and track your progress.</p>
                </div>
            </div>
        `;
    }

    function init() {
        const page = document.getElementById('goals-page');
        page.innerHTML = renderPage();
    }

    return { init };
})();
