/**
 * Sales Module
 */

const Sales = (() => {
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Sales</h2>
                <button class="btn btn-primary" id="newSalesInvoiceBtn">+ New Sales Invoice</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Sales Invoices</h3>
                </div>
                <div class="card-body">
                    <p class="text-center" style="padding: 2rem;">Sales module - Create sales invoices with VAT calculation</p>
                    <p class="text-center">This feature allows you to create sales invoices, manage customers, and track sales revenue.</p>
                </div>
            </div>
        `;
    }

    function init() {
        const page = document.getElementById('sales-page');
        page.innerHTML = renderPage();
    }

    return { init };
})();
