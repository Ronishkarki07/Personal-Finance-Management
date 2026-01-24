/**
 * Customers Module
 */

const Customers = (() => {
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Customers</h2>
                <button class="btn btn-primary" id="addCustomerBtn">+ Add Customer</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Customer List</h3>
                </div>
                <div class="card-body">
                    <p class="text-center" style="padding: 2rem;">Customers module - Manage customer information</p>
                    <p class="text-center">Track customer details, PAN/VAT numbers, and transaction history.</p>
                </div>
            </div>
        `;
    }

    function init() {
        const page = document.getElementById('customers-page');
        page.innerHTML = renderPage();
    }

    return { init };
})();
