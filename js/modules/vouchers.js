/**
 * Vouchers Module
 * Handles JV, PV, RV, CV
 */

const Vouchers = (() => {
    let voucherSequences = {
        'JV': 1,
        'PV': 1,
        'RV': 1,
        'CV': 1
    };

    /**
     * Initialize voucher sequences
     */
    async function initSequences() {
        const vouchers = await Storage.getAll(Storage.STORES.VOUCHERS);
        const company = await Company.getCompanyData();
        const fiscalYear = company?.fiscalYear || '2080/81';

        // Get max sequence for each type in current fiscal year
        ['JV', 'PV', 'RV', 'CV'].forEach(type => {
            const typeVouchers = vouchers.filter(v =>
                v.type === type && v.voucherNo.includes(fiscalYear.replace('/', '-'))
            );
            if (typeVouchers.length > 0) {
                const maxSeq = Math.max(...typeVouchers.map(v => {
                    const parts = v.voucherNo.split('-');
                    return parseInt(parts[parts.length - 1]);
                }));
                voucherSequences[type] = maxSeq + 1;
            }
        });
    }

    /**
     * Create voucher
     */
    async function createVoucher(voucherData) {
        const company = await Company.getCompanyData();
        const fiscalYear = company?.fiscalYear || '2080/81';

        // Validate journal entry
        const validation = AccountingEngine.validateJournalEntry(voucherData.entries);
        if (!validation.isValid) {
            throw new Error(`Journal entry not balanced. Difference: ${Helpers.formatCurrency(validation.difference)}`);
        }

        const voucher = {
            id: Helpers.generateId(),
            voucherNo: Helpers.generateVoucherNumber(voucherData.type, fiscalYear, voucherSequences[voucherData.type]++),
            type: voucherData.type,
            date: voucherData.date,
            dateBS: voucherData.dateBS,
            narration: voucherData.narration,
            entries: voucherData.entries,
            status: 'Posted',
            createdAt: new Date().toISOString()
        };

        await Storage.save(Storage.STORES.VOUCHERS, voucher);
        await AccountingEngine.postJournalEntry(voucher);

        return voucher;
    }

    /**
     * Render vouchers page
     */
    function renderPage() {
        return `
            <div class="page-header">
                <h2>Vouchers</h2>
                <div>
                    <button class="btn btn-primary" data-voucher-type="JV">+ Journal Voucher</button>
                    <button class="btn btn-primary" data-voucher-type="PV">+ Payment Voucher</button>
                    <button class="btn btn-primary" data-voucher-type="RV">+ Receipt Voucher</button>
                    <button class="btn btn-primary" data-voucher-type="CV">+ Contra Voucher</button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>All Vouchers</h3>
                </div>
                <div class="card-body">
                    <div class="form-row mb-2">
                        <div class="form-group">
                            <input type="text" class="form-control" id="searchVoucher" placeholder="Search vouchers...">
                        </div>
                        <div class="form-group">
                            <select class="form-control" id="filterVoucherType">
                                <option value="">All Types</option>
                                <option value="JV">Journal Voucher</option>
                                <option value="PV">Payment Voucher</option>
                                <option value="RV">Receipt Voucher</option>
                                <option value="CV">Contra Voucher</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="vouchersTable">
                            <thead>
                                <tr>
                                    <th>Voucher No.</th>
                                    <th>Type</th>
                                    <th>Date (BS)</th>
                                    <th>Date (AD)</th>
                                    <th>Narration</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="vouchersTableBody">
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
     * Load vouchers table
     */
    async function loadVouchersTable(searchTerm = '', filterType = '') {
        let vouchers = await Storage.getAll(Storage.STORES.VOUCHERS);

        // Filter
        if (searchTerm) {
            vouchers = vouchers.filter(v =>
                v.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.narration.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterType) {
            vouchers = vouchers.filter(v => v.type === filterType);
        }

        // Sort by date descending
        vouchers.sort((a, b) => new Date(b.date) - new Date(a.date));

        const tbody = document.getElementById('vouchersTableBody');
        if (vouchers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No vouchers found</td></tr>';
            return;
        }

        let html = '';
        vouchers.forEach(voucher => {
            const amount = voucher.entries.reduce((sum, e) => sum + parseFloat(e.debit || 0), 0);
            const typeColor = Helpers.getVoucherTypeColor(voucher.type);
            const dateBS = `${voucher.dateBS.year}/${String(voucher.dateBS.month).padStart(2, '0')}/${String(voucher.dateBS.day).padStart(2, '0')}`;

            html += `
                <tr>
                    <td><strong>${voucher.voucherNo}</strong></td>
                    <td><span class="badge" style="background: ${typeColor}; color: white;">${voucher.type}</span></td>
                    <td>${dateBS}</td>
                    <td>${voucher.date}</td>
                    <td>${Helpers.truncate(voucher.narration, 40)}</td>
                    <td class="text-right"><strong>${Helpers.formatCurrency(amount)}</strong></td>
                    <td>
                        <button class="btn btn-secondary action-btn" onclick="Vouchers.viewVoucher('${voucher.id}')">View</button>
                        <button class="btn btn-secondary action-btn" onclick="Vouchers.printVoucher('${voucher.id}')">Print</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Show voucher form
     */
    async function showVoucherForm(type) {
        const accounts = await ChartOfAccounts.getAllAccounts();
        const accountOptions = accounts.map(a =>
            `<option value="${a.id}">${a.code} - ${a.name}</option>`
        ).join('');

        const typeNames = {
            'JV': 'Journal Voucher',
            'PV': 'Payment Voucher',
            'RV': 'Receipt Voucher',
            'CV': 'Contra Voucher'
        };

        // Get current BS date
        const currentBS = NepaliDateConverter.getCurrentBsDate();
        const currentBSString = `${currentBS.year}/${String(currentBS.month).padStart(2, '0')}/${String(currentBS.day).padStart(2, '0')}`;

        const content = `
            <form id="voucherForm">
                <input type="hidden" name="type" value="${type}">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date (BS) *</label>
                        <input type="text" class="form-control" id="dateBS" value="${currentBSString}" 
                            placeholder="YYYY/MM/DD" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date (AD) *</label>
                        <input type="date" class="form-control" name="date" id="dateAD" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Narration *</label>
                    <textarea class="form-control" name="narration" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label"><strong>Entries</strong></label>
                    <div id="entriesContainer">
                        <div class="entry-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr 60px; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <select class="form-control entry-account" required>
                                <option value="">Select Account</option>
                                ${accountOptions}
                            </select>
                            <input type="number" class="form-control entry-debit" placeholder="Debit" step="0.01" min="0">
                            <input type="number" class="form-control entry-credit" placeholder="Credit" step="0.01" min="0">
                            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove(); Vouchers.updateTotals();">×</button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary" id="addEntryBtn">+ Add Entry</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px; margin: 1rem 0;">
                    <div>
                        <strong>Total Debit:</strong> <span id="totalDebit">Rs. 0.00</span>
                    </div>
                    <div>
                        <strong>Total Credit:</strong> <span id="totalCredit">Rs. 0.00</span>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <strong>Difference:</strong> <span id="difference" class="text-danger">Rs. 0.00</span>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Voucher</button>
                </div>
            </form>
        `;

        Helpers.showModal(typeNames[type], content);

        setTimeout(() => {
            // Set current AD date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('dateAD').value = today;

            // Date conversion
            document.getElementById('dateBS').addEventListener('change', (e) => {
                try {
                    const bs = NepaliDateConverter.parseBsDate(e.target.value);
                    const ad = NepaliDateConverter.bsToAd(bs.year, bs.month, bs.day);
                    document.getElementById('dateAD').value = `${ad.year}-${String(ad.month).padStart(2, '0')}-${String(ad.day).padStart(2, '0')}`;
                } catch (error) {
                    console.error('Date conversion error:', error);
                }
            });

            document.getElementById('dateAD').addEventListener('change', (e) => {
                try {
                    const parts = e.target.value.split('-');
                    const bs = NepaliDateConverter.adToBs(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
                    document.getElementById('dateBS').value = `${bs.year}/${String(bs.month).padStart(2, '0')}/${String(bs.day).padStart(2, '0')}`;
                } catch (error) {
                    console.error('Date conversion error:', error);
                }
            });

            // Add entry button
            document.getElementById('addEntryBtn').addEventListener('click', () => {
                const container = document.getElementById('entriesContainer');
                const newEntry = container.firstElementChild.cloneNode(true);
                newEntry.querySelectorAll('input').forEach(input => input.value = '');
                newEntry.querySelector('select').selectedIndex = 0;
                container.appendChild(newEntry);
            });

            // Update totals on input
            document.getElementById('entriesContainer').addEventListener('input', updateTotals);

            // Form submission
            document.getElementById('voucherForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(e.target);
                const voucherData = {
                    type: formData.get('type'),
                    date: formData.get('date'),
                    dateBS: NepaliDateConverter.parseBsDate(document.getElementById('dateBS').value),
                    narration: formData.get('narration'),
                    entries: []
                };

                // Collect entries
                const entryRows = document.querySelectorAll('.entry-row');
                entryRows.forEach(row => {
                    const accountId = row.querySelector('.entry-account').value;
                    const debit = parseFloat(row.querySelector('.entry-debit').value || 0);
                    const credit = parseFloat(row.querySelector('.entry-credit').value || 0);

                    if (accountId && (debit > 0 || credit > 0)) {
                        voucherData.entries.push({ accountId, debit, credit });
                    }
                });

                if (voucherData.entries.length < 2) {
                    Helpers.showToast('At least 2 entries required');
                    return;
                }

                try {
                    await createVoucher(voucherData);
                    Helpers.hideModal();
                    Helpers.showToast('Voucher created successfully');
                    loadVouchersTable();
                    updateDashboard();
                } catch (error) {
                    Helpers.showToast(error.message);
                    console.error(error);
                }
            });
        }, 100);
    }

    /**
     * Update totals
     */
    function updateTotals() {
        let totalDebit = 0;
        let totalCredit = 0;

        document.querySelectorAll('.entry-row').forEach(row => {
            totalDebit += parseFloat(row.querySelector('.entry-debit').value || 0);
            totalCredit += parseFloat(row.querySelector('.entry-credit').value || 0);
        });

        document.getElementById('totalDebit').textContent = Helpers.formatCurrency(totalDebit);
        document.getElementById('totalCredit').textContent = Helpers.formatCurrency(totalCredit);

        const difference = Math.abs(totalDebit - totalCredit);
        const diffElement = document.getElementById('difference');
        diffElement.textContent = Helpers.formatCurrency(difference);
        diffElement.className = difference < 0.01 ? 'text-success' : 'text-danger';
    }

    /**
     * View voucher
     */
    async function viewVoucher(voucherId) {
        const voucher = await Storage.get(Storage.STORES.VOUCHERS, voucherId);
        if (!voucher) return;

        const accounts = await ChartOfAccounts.getAllAccounts(true);
        const dateBS = `${voucher.dateBS.year}/${String(voucher.dateBS.month).padStart(2, '0')}/${String(voucher.dateBS.day).padStart(2, '0')}`;

        let entriesHtml = '';
        let totalDebit = 0;
        let totalCredit = 0;

        for (const entry of voucher.entries) {
            const account = accounts.find(a => a.id === entry.accountId);
            totalDebit += parseFloat(entry.debit || 0);
            totalCredit += parseFloat(entry.credit || 0);

            entriesHtml += `
                <tr>
                    <td>${account?.code || 'N/A'}</td>
                    <td>${account?.name || 'Unknown'}</td>
                    <td class="text-right">${entry.debit > 0 ? Helpers.formatCurrency(entry.debit) : '-'}</td>
                    <td class="text-right">${entry.credit > 0 ? Helpers.formatCurrency(entry.credit) : '-'}</td>
                </tr>
            `;
        }

        const content = `
            <div style="margin-bottom: 1rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div><strong>Voucher No:</strong> ${voucher.voucherNo}</div>
                    <div><strong>Type:</strong> ${voucher.type}</div>
                    <div><strong>Date (BS):</strong> ${dateBS}</div>
                    <div><strong>Date (AD):</strong> ${voucher.date}</div>
                </div>
                <div style="margin-top: 1rem;"><strong>Narration:</strong> ${voucher.narration}</div>
            </div>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Account Code</th>
                            <th>Account Name</th>
                            <th>Debit</th>
                            <th>Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entriesHtml}
                    </tbody>
                    <tfoot>
                        <tr style="font-weight: bold; background: var(--bg-tertiary);">
                            <td colspan="2">Total</td>
                            <td class="text-right">${Helpers.formatCurrency(totalDebit)}</td>
                            <td class="text-right">${Helpers.formatCurrency(totalCredit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        Helpers.showModal(`Voucher Details: ${voucher.voucherNo}`, content);
    }

    /**
     * Print voucher
     */
    async function printVoucher(voucherId) {
        const voucher = await Storage.get(Storage.STORES.VOUCHERS, voucherId);
        if (!voucher) return;

        const company = await Company.getCompanyData();
        const accounts = await ChartOfAccounts.getAllAccounts(true);
        const dateBS = `${voucher.dateBS.year}/${String(voucher.dateBS.month).padStart(2, '0')}/${String(voucher.dateBS.day).padStart(2, '0')}`;

        let entriesHtml = '';
        let totalDebit = 0;
        let totalCredit = 0;

        for (const entry of voucher.entries) {
            const account = accounts.find(a => a.id === entry.accountId);
            totalDebit += parseFloat(entry.debit || 0);
            totalCredit += parseFloat(entry.credit || 0);

            entriesHtml += `
                <tr>
                    <td>${account?.code || 'N/A'}</td>
                    <td>${account?.name || 'Unknown'}</td>
                    <td style="text-align: right;">${entry.debit > 0 ? Helpers.formatCurrency(entry.debit) : '-'}</td>
                    <td style="text-align: right;">${entry.credit > 0 ? Helpers.formatCurrency(entry.credit) : '-'}</td>
                </tr>
            `;
        }

        const printContent = `
            <div class="header">
                <h1>${company?.businessName || 'Company Name'}</h1>
                <p>${company?.address || ''}</p>
                <p>PAN: ${company?.pan || 'N/A'} | VAT: ${company?.vat || 'N/A'}</p>
                <h2 style="margin-top: 20px;">${voucher.type} - ${voucher.voucherNo}</h2>
            </div>

            <div style="margin: 20px 0;">
                <p><strong>Date (BS):</strong> ${dateBS} | <strong>Date (AD):</strong> ${voucher.date}</p>
                <p><strong>Narration:</strong> ${voucher.narration}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Account Code</th>
                        <th>Account Name</th>
                        <th>Debit</th>
                        <th>Credit</th>
                    </tr>
                </thead>
                <tbody>
                    ${entriesHtml}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold;">
                        <td colspan="2">Total</td>
                        <td style="text-align: right;">${Helpers.formatCurrency(totalDebit)}</td>
                        <td style="text-align: right;">${Helpers.formatCurrency(totalCredit)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                <div style="text-align: center; border-top: 1px solid #000; padding-top: 5px;">Prepared By</div>
                <div style="text-align: center; border-top: 1px solid #000; padding-top: 5px;">Checked By</div>
                <div style="text-align: center; border-top: 1px solid #000; padding-top: 5px;">Approved By</div>
            </div>
        `;

        Helpers.printContent(printContent, `Voucher ${voucher.voucherNo}`);
    }

    /**
     * Initialize page
     */
    function init() {
        const page = document.getElementById('vouchers-page');
        page.innerHTML = renderPage();

        // Event listeners for voucher type buttons
        document.querySelectorAll('[data-voucher-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-voucher-type');
                showVoucherForm(type);
            });
        });

        document.getElementById('searchVoucher').addEventListener('input', Helpers.debounce((e) => {
            const searchTerm = e.target.value;
            const filterType = document.getElementById('filterVoucherType').value;
            loadVouchersTable(searchTerm, filterType);
        }, 300));

        document.getElementById('filterVoucherType').addEventListener('change', (e) => {
            const searchTerm = document.getElementById('searchVoucher').value;
            const filterType = e.target.value;
            loadVouchersTable(searchTerm, filterType);
        });

        loadVouchersTable();
    }

    return {
        initSequences,
        createVoucher,
        init,
        loadVouchersTable,
        showVoucherForm,
        updateTotals,
        viewVoucher,
        printVoucher
    };
})();
