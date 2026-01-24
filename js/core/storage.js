/**
 * Storage Module - IndexedDB wrapper for data persistence
 * Falls back to LocalStorage if IndexedDB is not available
 */

const Storage = (() => {
    const DB_NAME = 'PersonalFinanceDB';
    const DB_VERSION = 2;
    let db = null;

    // Store names
    const STORES = {
        INCOME: 'income',
        EXPENSES: 'expenses',
        CATEGORIES: 'categories',
        BUDGET: 'budget',
        GOALS: 'goals',
        SETTINGS: 'settings'
    };

    /**
     * Initialize IndexedDB
     */
    async function initDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn('IndexedDB not supported, falling back to LocalStorage');
                resolve(false);
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                db = request.result;
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                // Create object stores
                if (!database.objectStoreNames.contains(STORES.INCOME)) {
                    const incomeStore = database.createObjectStore(STORES.INCOME, { keyPath: 'id' });
                    incomeStore.createIndex('date', 'date', { unique: false });
                    incomeStore.createIndex('category', 'category', { unique: false });
                }

                if (!database.objectStoreNames.contains(STORES.EXPENSES)) {
                    const expenseStore = database.createObjectStore(STORES.EXPENSES, { keyPath: 'id' });
                    expenseStore.createIndex('date', 'date', { unique: false });
                    expenseStore.createIndex('category', 'category', { unique: false });
                }

                if (!database.objectStoreNames.contains(STORES.CATEGORIES)) {
                    const categoryStore = database.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
                    categoryStore.createIndex('type', 'type', { unique: false });
                }

                if (!database.objectStoreNames.contains(STORES.BUDGET)) {
                    database.createObjectStore(STORES.BUDGET, { keyPath: 'id' });
                }

                if (!database.objectStoreNames.contains(STORES.GOALS)) {
                    database.createObjectStore(STORES.GOALS, { keyPath: 'id' });
                }

                if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
                    database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Save data to store
     */
    async function save(storeName, data) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(data);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to LocalStorage
            const key = `${storeName}_${data.id}`;
            localStorage.setItem(key, JSON.stringify(data));
            return data.id;
        }
    }

    /**
     * Get data by ID
     */
    async function get(storeName, id) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to LocalStorage
            const key = `${storeName}_${id}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
    }

    /**
     * Get all data from store
     */
    async function getAll(storeName) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to LocalStorage
            const items = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(storeName + '_')) {
                    items.push(JSON.parse(localStorage.getItem(key)));
                }
            }
            return items;
        }
    }

    /**
     * Delete data by ID
     */
    async function remove(storeName, id) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to LocalStorage
            const key = `${storeName}_${id}`;
            localStorage.removeItem(key);
            return true;
        }
    }

    /**
     * Clear all data from store
     */
    async function clear(storeName) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to LocalStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(storeName + '_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        }
    }

    /**
     * Query data by index
     */
    async function queryByIndex(storeName, indexName, value) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const index = store.index(indexName);
                const request = index.getAll(value);

                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to LocalStorage
            const all = await getAll(storeName);
            return all.filter(item => item[indexName] === value);
        }
    }

    /**
     * Export all data
     */
    async function exportData() {
        const data = {};
        for (const storeName of Object.values(STORES)) {
            data[storeName] = await getAll(storeName);
        }
        return data;
    }

    /**
     * Import data
     */
    async function importData(data) {
        for (const [storeName, items] of Object.entries(data)) {
            if (STORES[storeName.toUpperCase()]) {
                await clear(storeName);
                for (const item of items) {
                    await save(storeName, item);
                }
            }
        }
    }

    /**
     * Backup data to file
     */
    async function backup() {
        const data = await exportData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `nepal-accounting-backup-${timestamp}.json`;
        Helpers.exportToJSON(data, filename);
    }

    /**
     * Restore data from file
     */
    function restore() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    await importData(data);
                    Helpers.showToast('Data restored successfully');
                    location.reload();
                } catch (error) {
                    console.error('Restore error:', error);
                    Helpers.showToast('Error restoring data');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

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
