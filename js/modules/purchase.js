/**
 * Purchase Module
 */

const Purchase = (() => {
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Purchase</h2>
                <button class="btn btn-primary" id="newPurchaseInvoiceBtn">+ New Purchase Invoice</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Purchase Invoices</h3>
                </div>
                <div class="card-body">
                    <p class="text-center" style="padding: 2rem;">Purchase module - Create purchase invoices with VAT calculation</p>
                    <p class="text-center">This feature allows you to create purchase invoices, manage suppliers, and track expenses.</p>
                </div>
            </div>
        `;
    }

    function init() {
        const page = document.getElementById('purchase-page');
        page.innerHTML = renderPage();
    }

    return { init };
})();
