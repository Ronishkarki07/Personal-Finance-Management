/**
 * Storage Module - IndexedDB wrapper for data persistence
 * Falls back to LocalStorage if IndexedDB is not available
 */

// Storage module using PHP API endpoints
const Storage = (() => {
    const API_BASE = '/api/';
    const STORES = {
        INCOME: 'income',
        EXPENSES: 'expenses',
        CATEGORIES: 'categories',
        BUDGET: 'budget',
        GOALS: 'goals',
        SETTINGS: 'settings'
    };

    // No-op for PHP
    async function initDB() { return true; }

    // Save (create) expense
    async function save(storeName, data) {
        if (storeName === STORES.EXPENSES) {
            const res = await fetch(API_BASE + 'expenses.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to save expense');
            return (await res.json()).id;
        }
        throw new Error('Only expenses supported in PHP version');
    }

    // Get all expenses
    async function getAll(storeName) {
        if (storeName === STORES.EXPENSES) {
            const res = await fetch(API_BASE + 'expenses.php');
            if (!res.ok) throw new Error('Failed to fetch expenses');
            return await res.json();
        }
        throw new Error('Only expenses supported in PHP version');
    }

    // Not implemented for PHP version
    async function get() { throw new Error('Not implemented'); }
    async function remove() { throw new Error('Not implemented'); }
    async function clear() { throw new Error('Not implemented'); }
    async function queryByIndex() { throw new Error('Not implemented'); }
    async function exportData() { throw new Error('Not implemented'); }
    async function importData() { throw new Error('Not implemented'); }
    async function backup() { throw new Error('Not implemented'); }
    function restore() { throw new Error('Not implemented'); }

    return {
        initDB,
        save,
        get,
        getAll,
        remove,
        clear,
        queryByIndex,
        exportData,
        importData,
        backup,
        restore,
        STORES
    };
})();
