/**
 * Company Setup Module
 */

const Company = (() => {
    let companyData = null;

    /**
     * Initialize company
     */
    async function init() {
        const companies = await Storage.getAll(Storage.STORES.COMPANY);
        if (companies.length > 0) {
            companyData = companies[0];
        }
    }

    /**
     * Get company data
     */
    async function getCompanyData() {
        if (!companyData) {
            await init();
        }
        return companyData;
    }

    /**
     * Save company data
     */
    async function saveCompanyData(data) {
        const company = {
            id: companyData?.id || 'company-1',
            businessName: data.businessName,
            address: data.address,
            pan: data.pan,
            vat: data.vat,
            fiscalYear: data.fiscalYear,
            phone: data.phone,
            email: data.email,
            updatedAt: new Date().toISOString()
        };

        await Storage.save(Storage.STORES.COMPANY, company);
        companyData = company;
        return company;
    }

    /**
     * Render company setup page
     */
    function renderPage() {
        const company = companyData || {};

        return `
            <div class="page-header">
                <h2>Company Setup</h2>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Business Information</h3>
                </div>
                <div class="card-body">
                    <form id="companySetupForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Business Name *</label>
                                <input type="text" class="form-control" name="businessName" 
                                    value="${company.businessName || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fiscal Year (BS) *</label>
                                <input type="text" class="form-control" name="fiscalYear" 
                                    placeholder="2080/81" value="${company.fiscalYear || ''}" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Address *</label>
                            <textarea class="form-control" name="address" required>${company.address || ''}</textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">PAN Number</label>
                                <input type="text" class="form-control" name="pan" 
                                    placeholder="9 digits" value="${company.pan || ''}" maxlength="9">
                            </div>
                            <div class="form-group">
                                <label class="form-label">VAT Number</label>
                                <input type="text" class="form-control" name="vat" 
                                    placeholder="9-10 digits" value="${company.vat || ''}" maxlength="10">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Phone</label>
                                <input type="text" class="form-control" name="phone" 
                                    value="${company.phone || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" 
                                    value="${company.email || ''}">
                            </div>
                        </div>

                        <div style="margin-top: 2rem;">
                            <button type="submit" class="btn btn-primary">Save Company Information</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Initialize page
     */
    function initPage() {
        const page = document.getElementById('company-setup-page');
        page.innerHTML = renderPage();

        document.getElementById('companySetupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // Validate PAN
            if (data.pan && !Helpers.validatePAN(data.pan)) {
                Helpers.showToast('Invalid PAN number (must be 9 digits)');
                return;
            }

            // Validate VAT
            if (data.vat && !Helpers.validateVAT(data.vat)) {
                Helpers.showToast('Invalid VAT number (must be 9-10 digits)');
                return;
            }

            try {
                await saveCompanyData(data);
                Helpers.showToast('Company information saved successfully');

                // Update fiscal year display
                document.getElementById('currentFiscalYear').textContent = data.fiscalYear;
            } catch (error) {
                Helpers.showToast('Error saving company information');
                console.error(error);
            }
        });
    }

    return {
        init,
        getCompanyData,
        saveCompanyData,
        initPage
    };
})();
