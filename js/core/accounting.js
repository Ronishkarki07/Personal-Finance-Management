/**
 * Core Accounting Engine
 * Implements Double-Entry Bookkeeping System
 */

const AccountingEngine = (() => {
    /**
     * Validate journal entry (Debit = Credit)
     */
    function validateJournalEntry(entries) {
        let totalDebit = 0;
        let totalCredit = 0;

        entries.forEach(entry => {
            totalDebit += parseFloat(entry.debit || 0);
            totalCredit += parseFloat(entry.credit || 0);
        });

        const difference = Math.abs(totalDebit - totalCredit);
        const isBalanced = difference < 0.01; // Allow for floating point errors

        return {
            isValid: isBalanced,
            totalDebit,
            totalCredit,
            difference
        };
    }

    /**
     * Post journal entry to ledger
     */
    async function postJournalEntry(voucher) {
        const transactions = [];

        for (const entry of voucher.entries) {
            // Debit transaction
            if (entry.debit > 0) {
                transactions.push({
                    id: Helpers.generateId(),
                    voucherId: voucher.id,
                    voucherNo: voucher.voucherNo,
                    voucherType: voucher.type,
                    accountId: entry.accountId,
                    date: voucher.date,
                    dateBS: voucher.dateBS,
                    particulars: entry.particulars || voucher.narration,
                    debit: entry.debit,
                    credit: 0,
                    balance: 0 // Will be calculated
                });
            }

            // Credit transaction
            if (entry.credit > 0) {
                transactions.push({
                    id: Helpers.generateId(),
                    voucherId: voucher.id,
                    voucherNo: voucher.voucherNo,
                    voucherType: voucher.type,
                    accountId: entry.accountId,
                    date: voucher.date,
                    dateBS: voucher.dateBS,
                    particulars: entry.particulars || voucher.narration,
                    debit: 0,
                    credit: entry.credit,
                    balance: 0 // Will be calculated
                });
            }
        }

        // Save all transactions
        for (const transaction of transactions) {
            await Storage.save(Storage.STORES.TRANSACTIONS, transaction);
        }

        return transactions;
    }

    /**
     * Get account balance
     */
    async function getAccountBalance(accountId, upToDate = null) {
        const account = await Storage.get(Storage.STORES.ACCOUNTS, accountId);
        if (!account) return 0;

        const transactions = await Storage.queryByIndex(Storage.STORES.TRANSACTIONS, 'accountId', accountId);

        let balance = parseFloat(account.openingBalance || 0);

        transactions.forEach(transaction => {
            if (upToDate && new Date(transaction.date) > new Date(upToDate)) {
                return;
            }

            const debit = parseFloat(transaction.debit || 0);
            const credit = parseFloat(transaction.credit || 0);

            // Calculate balance based on account type
            if (account.type === 'Asset' || account.type === 'Expense') {
                balance += debit - credit;
            } else {
                balance += credit - debit;
            }
        });

        return balance;
    }

    /**
     * Get ledger for an account
     */
    async function getAccountLedger(accountId, fromDate = null, toDate = null) {
        const account = await Storage.get(Storage.STORES.ACCOUNTS, accountId);
        if (!account) return [];

        let transactions = await Storage.queryByIndex(Storage.STORES.TRANSACTIONS, 'accountId', accountId);

        // Filter by date range
        if (fromDate) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(fromDate));
        }
        if (toDate) {
            transactions = transactions.filter(t => new Date(t.date) <= new Date(toDate));
        }

        // Sort by date
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate running balance
        let balance = parseFloat(account.openingBalance || 0);

        const ledger = transactions.map(transaction => {
            const debit = parseFloat(transaction.debit || 0);
            const credit = parseFloat(transaction.credit || 0);

            if (account.type === 'Asset' || account.type === 'Expense') {
                balance += debit - credit;
            } else {
                balance += credit - debit;
            }

            return {
                ...transaction,
                balance
            };
        });

        return ledger;
    }

    /**
     * Get trial balance
     */
    async function getTrialBalance(asOfDate = null) {
        const accounts = await Storage.getAll(Storage.STORES.ACCOUNTS);
        const trialBalance = [];

        for (const account of accounts) {
            if (account.isDisabled) continue;

            const balance = await getAccountBalance(account.id, asOfDate);

            trialBalance.push({
                accountCode: account.code,
                accountName: account.name,
                accountType: account.type,
                debit: balance >= 0 && (account.type === 'Asset' || account.type === 'Expense') ? balance : 0,
                credit: balance >= 0 && (account.type === 'Liability' || account.type === 'Equity' || account.type === 'Income') ? balance : 0,
                balance
            });
        }

        // Sort by account code
        trialBalance.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

        return trialBalance;
    }

    /**
     * Get profit and loss statement
     */
    async function getProfitAndLoss(fromDate, toDate) {
        const accounts = await Storage.getAll(Storage.STORES.ACCOUNTS);

        const income = [];
        const expenses = [];
        let totalIncome = 0;
        let totalExpenses = 0;

        for (const account of accounts) {
            if (account.isDisabled) continue;

            const transactions = await Storage.queryByIndex(Storage.STORES.TRANSACTIONS, 'accountId', account.id);

            let accountTotal = 0;
            transactions.forEach(transaction => {
                const transDate = new Date(transaction.date);
                if (transDate >= new Date(fromDate) && transDate <= new Date(toDate)) {
                    const debit = parseFloat(transaction.debit || 0);
                    const credit = parseFloat(transaction.credit || 0);

                    if (account.type === 'Income') {
                        accountTotal += credit - debit;
                    } else if (account.type === 'Expense') {
                        accountTotal += debit - credit;
                    }
                }
            });

            if (account.type === 'Income' && accountTotal !== 0) {
                income.push({
                    accountCode: account.code,
                    accountName: account.name,
                    amount: accountTotal
                });
                totalIncome += accountTotal;
            } else if (account.type === 'Expense' && accountTotal !== 0) {
                expenses.push({
                    accountCode: account.code,
                    accountName: account.name,
                    amount: accountTotal
                });
                totalExpenses += accountTotal;
            }
        }

        const netProfit = totalIncome - totalExpenses;

        return {
            income,
            expenses,
            totalIncome,
            totalExpenses,
            netProfit
        };
    }

    /**
     * Get balance sheet
     */
    async function getBalanceSheet(asOfDate = null) {
        const accounts = await Storage.getAll(Storage.STORES.ACCOUNTS);

        const assets = [];
        const liabilities = [];
        const equity = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        for (const account of accounts) {
            if (account.isDisabled) continue;

            const balance = await getAccountBalance(account.id, asOfDate);

            if (balance === 0) continue;

            const item = {
                accountCode: account.code,
                accountName: account.name,
                amount: Math.abs(balance)
            };

            if (account.type === 'Asset') {
                assets.push(item);
                totalAssets += balance;
            } else if (account.type === 'Liability') {
                liabilities.push(item);
                totalLiabilities += balance;
            } else if (account.type === 'Equity') {
                equity.push(item);
                totalEquity += balance;
            }
        }

        return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity
        };
    }

    /**
     * Get cash book
     */
    async function getCashBook(fromDate = null, toDate = null) {
        const accounts = await Storage.getAll(Storage.STORES.ACCOUNTS);
        const cashAccounts = accounts.filter(a => a.name.toLowerCase().includes('cash') && !a.isDisabled);

        const cashBook = [];

        for (const account of cashAccounts) {
            const ledger = await getAccountLedger(account.id, fromDate, toDate);
            cashBook.push({
                accountName: account.name,
                accountCode: account.code,
                transactions: ledger
            });
        }

        return cashBook;
    }

    /**
     * Get bank book
     */
    async function getBankBook(fromDate = null, toDate = null) {
        const accounts = await Storage.getAll(Storage.STORES.ACCOUNTS);
        const bankAccounts = accounts.filter(a => a.name.toLowerCase().includes('bank') && !a.isDisabled);

        const bankBook = [];

        for (const account of bankAccounts) {
            const ledger = await getAccountLedger(account.id, fromDate, toDate);
            bankBook.push({
                accountName: account.name,
                accountCode: account.code,
                transactions: ledger
            });
        }

        return bankBook;
    }

    /**
     * Get VAT report
     */
    async function getVATReport(fromDate, toDate) {
        const vouchers = await Storage.getAll(Storage.STORES.VOUCHERS);

        const salesVAT = [];
        const purchaseVAT = [];
        let totalSalesVAT = 0;
        let totalPurchaseVAT = 0;

        vouchers.forEach(voucher => {
            const voucherDate = new Date(voucher.date);
            if (voucherDate >= new Date(fromDate) && voucherDate <= new Date(toDate)) {
                if (voucher.type === 'SI' && voucher.vatAmount > 0) {
                    salesVAT.push({
                        date: voucher.dateBS,
                        voucherNo: voucher.voucherNo,
                        party: voucher.customerName,
                        panVat: voucher.customerPAN,
                        taxableAmount: voucher.subtotal,
                        vatAmount: voucher.vatAmount,
                        totalAmount: voucher.total
                    });
                    totalSalesVAT += parseFloat(voucher.vatAmount);
                } else if (voucher.type === 'PI' && voucher.vatAmount > 0) {
                    purchaseVAT.push({
                        date: voucher.dateBS,
                        voucherNo: voucher.voucherNo,
                        party: voucher.supplierName,
                        panVat: voucher.supplierPAN,
                        taxableAmount: voucher.subtotal,
                        vatAmount: voucher.vatAmount,
                        totalAmount: voucher.total
                    });
                    totalPurchaseVAT += parseFloat(voucher.vatAmount);
                }
            }
        });

        const netVAT = totalSalesVAT - totalPurchaseVAT;

        return {
            salesVAT,
            purchaseVAT,
            totalSalesVAT,
            totalPurchaseVAT,
            netVAT
        };
    }

    /**
     * Close fiscal year
     */
    async function closeFiscalYear(fiscalYear) {
        // Get profit/loss for the year
        const fyStart = `${fiscalYear.split('/')[0]}-04-01`;
        const fyEnd = `${parseInt(fiscalYear.split('/')[0]) + 1}-03-31`;

        const pl = await getProfitAndLoss(fyStart, fyEnd);

        // Transfer profit/loss to capital
        if (pl.netProfit !== 0) {
            const accounts = await Storage.getAll(Storage.STORES.ACCOUNTS);
            const capitalAccount = accounts.find(a => a.name.toLowerCase().includes('capital'));

            if (capitalAccount) {
                // Create closing entry
                const closingVoucher = {
                    id: Helpers.generateId(),
                    voucherNo: Helpers.generateVoucherNumber('JV', fiscalYear, 9999),
                    type: 'JV',
                    date: fyEnd,
                    dateBS: NepaliDateConverter.adToBs(
                        parseInt(fyEnd.split('-')[0]),
                        parseInt(fyEnd.split('-')[1]),
                        parseInt(fyEnd.split('-')[2])
                    ),
                    narration: `Profit/Loss transfer for FY ${fiscalYear}`,
                    entries: [],
                    status: 'Posted'
                };

                if (pl.netProfit > 0) {
                    // Profit - Credit Capital
                    closingVoucher.entries.push({
                        accountId: capitalAccount.id,
                        particulars: 'Net Profit',
                        debit: 0,
                        credit: pl.netProfit
                    });
                } else {
                    // Loss - Debit Capital
                    closingVoucher.entries.push({
                        accountId: capitalAccount.id,
                        particulars: 'Net Loss',
                        debit: Math.abs(pl.netProfit),
                        credit: 0
                    });
                }

                await Storage.save(Storage.STORES.VOUCHERS, closingVoucher);
                await postJournalEntry(closingVoucher);
            }
        }

        return pl.netProfit;
    }

    return {
        validateJournalEntry,
        postJournalEntry,
        getAccountBalance,
        getAccountLedger,
        getTrialBalance,
        getProfitAndLoss,
        getBalanceSheet,
        getCashBook,
        getBankBook,
        getVATReport,
        closeFiscalYear
    };
})();
