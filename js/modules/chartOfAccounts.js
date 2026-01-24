/**
 * Chart of Accounts Module
 */

const ChartOfAccounts = (() => {
    let accounts = [];
    let nextAccountCode = 1000;

    /**
     * Initialize default chart of accounts
     */
    async function initializeDefaultAccounts() {
        const existingAccounts = await Storage.getAll(Storage.STORES.ACCOUNTS);
        if (existingAccounts.length > 0) {
            accounts = existingAccounts;
            return;
        }

        const defaultAccounts = [
            // Assets
            { type: 'Asset', name: 'Cash in Hand', code: '1001', openingBalance: 0 },
            { type: 'Asset', name: 'Bank Account', code: '1002', openingBalance: 0 },
            { type: 'Asset', name: 'Accounts Receivable', code: '1003', openingBalance: 0 },
            { type: 'Asset', name: 'Inventory', code: '1004', openingBalance: 0 },
            { type: 'Asset', name: 'Furniture & Fixtures', code: '1005', openingBalance: 0 },
            { type: 'Asset', name: 'Equipment', code: '1006', openingBalance: 0 },

            // Liabilities
            { type: 'Liability', name: 'Accounts Payable', code: '2001', openingBalance: 0 },
            { type: 'Liability', name: 'Loan Payable', code: '2002', openingBalance: 0 },
            { type: 'Liability', name: 'VAT Payable', code: '2003', openingBalance: 0 },
            { type: 'Liability', name: 'Salary Payable', code: '2004', openingBalance: 0 },

            // Equity
            { type: 'Equity', name: 'Capital', code: '3001', openingBalance: 0 },
            { type: 'Equity', name: 'Retained Earnings', code: '3002', openingBalance: 0 },
            { type: 'Equity', name: 'Drawings', code: '3003', openingBalance: 0 },

            // Income
            { type: 'Income', name: 'Sales Revenue', code: '4001', openingBalance: 0 },
            { type: 'Income', name: 'Service Income', code: '4002', openingBalance: 0 },
            { type: 'Income', name: 'Interest Income', code: '4003', openingBalance: 0 },
            { type: 'Income', name: 'Other Income', code: '4004', openingBalance: 0 },

            // Expenses
            { type: 'Expense', name: 'Rent Expense', code: '5001', openingBalance: 0 },
            { type: 'Expense', name: 'Salary Expense', code: '5002', openingBalance: 0 },
            { type: 'Expense', name: 'Electricity Expense', code: '5003', openingBalance: 0 },
            { type: 'Expense', name: 'Internet Expense', code: '5004', openingBalance: 0 },
            { type: 'Expense', name: 'Transportation Expense', code: '5005', openingBalance: 0 },
            { type: 'Expense', name: 'Office Supplies', code: '5006', openingBalance: 0 },
            { type: 'Expense', name: 'Telephone Expense', code: '5007', openingBalance: 0 },
            { type: 'Expense', name: 'Depreciation Expense', code: '5008', openingBalance: 0 },
            { type: 'Expense', name: 'Bank Charges', code: '5009', openingBalance: 0 },
            { type: 'Expense', name: 'Miscellaneous Expense', code: '5010', openingBalance: 0 },
        ];

        for (const account of defaultAccounts) {
            await createAccount(account);
        }

        nextAccountCode = 6000;
    }

    /**
     * Create new account
     */
    async function createAccount(accountData) {
        const account = {
            id: Helpers.generateId(),
            code: accountData.code || generateAccountCode(accountData.type),
            name: accountData.name,
            type: accountData.type,
            openingBalance: parseFloat(accountData.openingBalance || 0),
            isDisabled: false,
            createdAt: new Date().toISOString()
        };

        await Storage.save(Storage.STORES.ACCOUNTS, account);
        accounts.push(account);
        return account;
    }

    /**
     * Generate account code
     */
    function generateAccountCode(type) {
        const prefixes = {
            'Asset': '1',
            'Liability': '2',
            'Equity': '3',
            'Income': '4',
            'Expense': '5'
        };

        const prefix = prefixes[type] || '9';
        const code = prefix + String(nextAccountCode++).padStart(3, '0');
        return code;
    }

    /**
     * Update account
     */
    async function updateAccount(accountId, updates) {
        const account = await Storage.get(Storage.STORES.ACCOUNTS, accountId);
        if (!account) throw new Error('Account not found');

        const updatedAccount = { ...account, ...updates };
        await Storage.save(Storage.STORES.ACCOUNTS, updatedAccount);

        const index = accounts.findIndex(a => a.id === accountId);
        if (index !== -1) {
            accounts[index] = updatedAccount;
        }

        return updatedAccount;
    }

    /**
     * Disable account (soft delete)
     */
    async function disableAccount(accountId) {
        return await updateAccount(accountId, { isDisabled: true });
    }

    /**
     * Enable account
     */
    async function enableAccount(accountId) {
        return await updateAccount(accountId, { isDisabled: false });
    }

    /**
     * Get all accounts
     */
    async function getAllAccounts(includeDisabled = false) {
        accounts = await Storage.getAll(Storage.STORES.ACCOUNTS);
        if (!includeDisabled) {
            return accounts.filter(a => !a.isDisabled);
        }
        return accounts;
    }

    /**
     * Get accounts by type
     */
    async function getAccountsByType(type) {
        const allAccounts = await getAllAccounts();
        return allAccounts.filter(a => a.type === type);
    }

    /**
     * Get account by code
     */
    async function getAccountByCode(code) {
        const allAccounts = await getAllAccounts(true);
        return allAccounts.find(a => a.code === code);
    }

    /**
     * Render chart of accounts page
     */
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Chart of Accounts</h2>
                <button class="btn btn-primary" id="addAccountBtn">+ Add Account</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>All Accounts</h3>
                </div>
                <div class="card-body">
                    <div class="form-row mb-2">
                        <div class="form-group">
                            <input type="text" class="form-control" id="searchAccount" placeholder="Search accounts...">
                        </div>
                        <div class="form-group">
                            <select class="form-control" id="filterAccountType">
                                <option value="">All Types</option>
                                <option value="Asset">Asset</option>
                                <option value="Liability">Liability</option>
                                <option value="Equity">Equity</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="accountsTable">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Account Name</th>
                                    <th>Type</th>
                                    <th>Opening Balance</th>
                                    <th>Current Balance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="accountsTableBody">
                                <tr>
                                    <td colspan="7" class="text-center">Loading...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load accounts table
     */
    async function loadAccountsTable(searchTerm = '', filterType = '') {
        let accountsList = await getAllAccounts(true);

        // Filter
        if (searchTerm) {
            accountsList = accountsList.filter(a =>
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.code.includes(searchTerm)
            );
        }
        if (filterType) {
            accountsList = accountsList.filter(a => a.type === filterType);
        }

        const tbody = document.getElementById('accountsTableBody');
        if (accountsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No accounts found</td></tr>';
            return;
        }

        let html = '';
        for (const account of accountsList) {
            const balance = await AccountingEngine.getAccountBalance(account.id);
            const typeColor = Helpers.getAccountTypeColor(account.type);

            html += `
                <tr>
                    <td><strong>${account.code}</strong></td>
                    <td>${account.name}</td>
                    <td><span class="badge" style="background: ${typeColor}; color: white;">${account.type}</span></td>
                    <td class="text-right">${Helpers.formatCurrency(account.openingBalance)}</td>
                    <td class="text-right"><strong>${Helpers.formatCurrency(balance)}</strong></td>
                    <td>
                        ${account.isDisabled
                    ? '<span class="badge badge-danger">Disabled</span>'
                    : '<span class="badge badge-success">Active</span>'}
                    </td>
                    <td>
                        <button class="btn btn-secondary action-btn" onclick="ChartOfAccounts.viewLedger('${account.id}')">Ledger</button>
                        <button class="btn btn-secondary action-btn" onclick="ChartOfAccounts.editAccount('${account.id}')">Edit</button>
                        ${!account.isDisabled
                    ? `<button class="btn btn-danger action-btn" onclick="ChartOfAccounts.toggleAccount('${account.id}')">Disable</button>`
                    : `<button class="btn btn-success action-btn" onclick="ChartOfAccounts.toggleAccount('${account.id}')">Enable</button>`}
                    </td>
                </tr>
            `;
        }

        tbody.innerHTML = html;
    }

    /**
     * Show add account form
     */
    function showAddAccountForm() {
        const content = `
            <form id="addAccountForm">
                <div class="form-group">
                    <label class="form-label">Account Type *</label>
                    <select class="form-control" name="type" required>
                        <option value="">Select Type</option>
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Account Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Account Code (Auto-generated if empty)</label>
                    <input type="text" class="form-control" name="code">
                </div>
                <div class="form-group">
                    <label class="form-label">Opening Balance</label>
                    <input type="number" class="form-control" name="openingBalance" value="0" step="0.01">
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Account</button>
                </div>
            </form>
        `;

        Helpers.showModal('Add New Account', content);

        setTimeout(() => {
            document.getElementById('addAccountForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const accountData = Object.fromEntries(formData);

                try {
                    await createAccount(accountData);
                    Helpers.hideModal();
                    Helpers.showToast('Account created successfully');
                    loadAccountsTable();
                } catch (error) {
                    Helpers.showToast('Error creating account');
                    console.error(error);
                }
            });
        }, 100);
    }

    /**
     * Edit account
     */
    async function editAccount(accountId) {
        const account = await Storage.get(Storage.STORES.ACCOUNTS, accountId);
        if (!account) return;

        const content = `
            <form id="editAccountForm">
                <div class="form-group">
                    <label class="form-label">Account Code</label>
                    <input type="text" class="form-control" value="${account.code}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Account Name *</label>
                    <input type="text" class="form-control" name="name" value="${account.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Opening Balance</label>
                    <input type="number" class="form-control" name="openingBalance" value="${account.openingBalance}" step="0.01">
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Account</button>
                </div>
            </form>
        `;

        Helpers.showModal('Edit Account', content);

        setTimeout(() => {
            document.getElementById('editAccountForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = Object.fromEntries(formData);

                try {
                    await updateAccount(accountId, updates);
                    Helpers.hideModal();
                    Helpers.showToast('Account updated successfully');
                    loadAccountsTable();
                } catch (error) {
                    Helpers.showToast('Error updating account');
                    console.error(error);
                }
            });
        }, 100);
    }

    /**
     * Toggle account status
     */
    async function toggleAccount(accountId) {
        const account = await Storage.get(Storage.STORES.ACCOUNTS, accountId);
        if (!account) return;

        const action = account.isDisabled ? 'enable' : 'disable';
        Helpers.confirm(`Are you sure you want to ${action} this account?`, async () => {
            if (account.isDisabled) {
                await enableAccount(accountId);
            } else {
                await disableAccount(accountId);
            }
            Helpers.showToast(`Account ${action}d successfully`);
            loadAccountsTable();
        });
    }

    /**
     * View account ledger
     */
    async function viewLedger(accountId) {
        const account = await Storage.get(Storage.STORES.ACCOUNTS, accountId);
        if (!account) return;

        const ledger = await AccountingEngine.getAccountLedger(accountId);

        let tableHtml = `
            <div style="margin-bottom: 1rem;">
                <strong>Account:</strong> ${account.code} - ${account.name}<br>
                <strong>Type:</strong> ${account.type}<br>
                <strong>Opening Balance:</strong> ${Helpers.formatCurrency(account.openingBalance)}
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date (BS)</th>
                            <th>Voucher No.</th>
                            <th>Particulars</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (ledger.length === 0) {
            tableHtml += '<tr><td colspan="6" class="text-center">No transactions</td></tr>';
        } else {
            ledger.forEach(entry => {
                tableHtml += `
                    <tr>
                        <td>${entry.dateBS.year}/${String(entry.dateBS.month).padStart(2, '0')}/${String(entry.dateBS.day).padStart(2, '0')}</td>
                        <td>${entry.voucherNo}</td>
                        <td>${entry.particulars}</td>
                        <td class="text-right">${entry.debit > 0 ? Helpers.formatCurrency(entry.debit) : '-'}</td>
                        <td class="text-right">${entry.credit > 0 ? Helpers.formatCurrency(entry.credit) : '-'}</td>
                        <td class="text-right"><strong>${Helpers.formatCurrency(entry.balance)}</strong></td>
                    </tr>
                `;
            });
        }

        tableHtml += '</tbody></table></div>';

        Helpers.showModal(`Ledger: ${account.name}`, tableHtml);
    }

    /**
     * Initialize page
     */
    function init() {
        const page = document.getElementById('chart-of-accounts-page');
        page.innerHTML = renderPage();

        // Event listeners
        document.getElementById('addAccountBtn').addEventListener('click', showAddAccountForm);

        document.getElementById('searchAccount').addEventListener('input', Helpers.debounce((e) => {
            const searchTerm = e.target.value;
            const filterType = document.getElementById('filterAccountType').value;
            loadAccountsTable(searchTerm, filterType);
        }, 300));

        document.getElementById('filterAccountType').addEventListener('change', (e) => {
            const searchTerm = document.getElementById('searchAccount').value;
            const filterType = e.target.value;
            loadAccountsTable(searchTerm, filterType);
        });

        // Load table
        loadAccountsTable();
    }

    return {
        initializeDefaultAccounts,
        createAccount,
        updateAccount,
        disableAccount,
        enableAccount,
        getAllAccounts,
        getAccountsByType,
        getAccountByCode,
        init,
        loadAccountsTable,
        showAddAccountForm,
        editAccount,
        toggleAccount,
        viewLedger
    };
})();
