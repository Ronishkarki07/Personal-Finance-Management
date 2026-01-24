/**
 * Suppliers Module
 */

const Suppliers = (() => {
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Suppliers</h2>
                <button class="btn btn-primary" id="addSupplierBtn">+ Add Supplier</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Supplier List</h3>
                </div>
                <div class="card-body">
                    <p class="text-center" style="padding: 2rem;">Suppliers module - Manage supplier information</p>
                    <p class="text-center">Track supplier details, PAN/VAT numbers, and purchase history.</p>
                </div>
            </div>
        `;
    }

    function init() {
        const page = document.getElementById('suppliers-page');
        page.innerHTML = renderPage();
    }

    return { init };
})();
