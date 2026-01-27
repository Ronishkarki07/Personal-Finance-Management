     /**
     * Convert file to base64 string
     */
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
/**
 * Helper Utilities for Nepal Accounting System
 */

const Helpers = (() => {
    /**
     * Format currency in NPR
     */
    function formatCurrency(amount, showSymbol = true) {
        const formatted = parseFloat(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return showSymbol ? `Rs. ${formatted}` : formatted;
    }

    /**
     * Parse currency string to number
     */
    function parseCurrency(currencyString) {
        if (typeof currencyString === 'number') return currencyString;
        return parseFloat(currencyString.replace(/[^0-9.-]+/g, '')) || 0;
    }

    /**
     * Generate unique ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Generate voucher number
     */
    function generateVoucherNumber(type, fiscalYear, sequence) {
        const typePrefix = {
            'JV': 'JV',
            'PV': 'PV',
            'RV': 'RV',
            'CV': 'CV',
            'SI': 'SI',
            'PI': 'PI'
        };
        const fy = fiscalYear.replace('/', '-');
        return `${typePrefix[type]}-${fy}-${String(sequence).padStart(4, '0')}`;
    }

    /**
     * Validate PAN number (Nepal)
     */
    function validatePAN(pan) {
        // Nepal PAN format: 9 digits
        const panRegex = /^\d{9}$/;
        return panRegex.test(pan);
    }

    /**
     * Validate VAT number (Nepal)
     */
    function validateVAT(vat) {
        // Nepal VAT format: 9 or 10 digits
        const vatRegex = /^\d{9,10}$/;
        return vatRegex.test(vat);
    }

    /**
     * Calculate VAT amount
     */
    function calculateVAT(amount, vatRate = 13) {
        return (amount * vatRate) / 100;
    }

    /**
     * Calculate amount with VAT
     */
    function addVAT(amount, vatRate = 13) {
        return amount + calculateVAT(amount, vatRate);
    }

    /**
     * Calculate amount without VAT
     */
    function removeVAT(totalAmount, vatRate = 13) {
        return totalAmount / (1 + vatRate / 100);
    }

    /**
     * Show toast notification
     */
    function showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    /**
     * Show modal
     */
    function showModal(title, content) {
        const modal = document.getElementById('modalContainer');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
    }

    /**
     * Hide modal
     */
    function hideModal() {
        const modal = document.getElementById('modalContainer');
        modal.classList.remove('active');
    }

    /**
     * Confirm dialog
     */
    function confirm(message, callback) {
        const content = `
            <p style="margin-bottom: 1.5rem; font-size: 1.125rem;">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="Helpers.hideModal()">Cancel</button>
                <button class="btn btn-danger" id="confirmBtn">Confirm</button>
            </div>
        `;

        showModal('Confirmation', content);

        setTimeout(() => {
            document.getElementById('confirmBtn').addEventListener('click', () => {
                hideModal();
                callback();
            });
        }, 100);
    }

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Deep clone object
     */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Sort array of objects
     */
    function sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    /**
     * Filter array of objects
     */
    function filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                return String(item[key]).toLowerCase().includes(String(filters[key]).toLowerCase());
            });
        });
    }

    /**
     * Export to CSV
     */
    function exportToCSV(data, filename) {
        if (!data || !data.length) {
            showToast('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(','))
        ].join('\n');

        downloadFile(csv, filename, 'text/csv');
    }

    /**
     * Export to JSON
     */
    function exportToJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, filename, 'application/json');
    }

    /**
     * Download file
     */
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('File downloaded successfully');
    }

    /**
     * Print content
     */
    function printContent(content, title = 'Print') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        padding: 20px;
                        color: #000;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background: #f0f0f0;
                        font-weight: bold;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .header p {
                        margin: 5px 0;
                    }
                    @media print {
                        @page {
                            size: A4;
                            margin: 15mm;
                        }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    /**
     * Validate email
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone (Nepal)
     */
    function validatePhone(phone) {
        // Nepal phone: 10 digits starting with 9
        const phoneRegex = /^9\d{9}$/;
        return phoneRegex.test(phone.replace(/\s|-/g, ''));
    }

    /**
     * Format phone number
     */
    function formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }

    /**
     * Truncate text
     */
    function truncate(text, length = 50) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    /**
     * Capitalize first letter
     */
    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    /**
     * Get account type color
     */
    function getAccountTypeColor(type) {
        const colors = {
            'Asset': '#4facfe',
            'Liability': '#f5576c',
            'Equity': '#764ba2',
            'Income': '#43e97b',
            'Expense': '#feca57'
        };
        return colors[type] || '#718096';
    }

    /**
     * Get voucher type color
     */
    function getVoucherTypeColor(type) {
        const colors = {
            'JV': '#667eea',
            'PV': '#f5576c',
            'RV': '#43e97b',
            'CV': '#4facfe',
            'SI': '#38f9d7',
            'PI': '#f093fb'
        };
        return colors[type] || '#718096';
    }

    return {
        formatCurrency,
        parseCurrency,
        generateId,
        generateVoucherNumber,
        validatePAN,
        validateVAT,
        calculateVAT,
        addVAT,
        removeVAT,
        showToast,
        showModal,
        hideModal,
        confirm,
        debounce,
        deepClone,
        sortBy,
        filterBy,
        exportToCSV,
        exportToJSON,
        downloadFile,
        printContent,
        validateEmail,
        validatePhone,
        formatPhone,
        truncate,
        capitalize,
        getAccountTypeColor,
        getVoucherTypeColor,
        fileToBase64
    };
})();
