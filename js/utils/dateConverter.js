/**
 * Nepali Date Converter (BS <-> AD)
 * Bikram Sambat (BS) to Anno Domini (AD) conversion and vice versa
 */

const NepaliDateConverter = (() => {
    // BS year data: [total days in year, [days in each month]]
    const bsYearData = {
        2070: [365, [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]],
        2071: [365, [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30]],
        2072: [365, [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31]],
        2073: [366, [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31]],
        2074: [365, [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30]],
        2075: [365, [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30]],
        2076: [365, [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30]],
        2077: [365, [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]],
        2078: [365, [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30]],
        2079: [365, [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31]],
        2080: [366, [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31]],
        2081: [365, [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30]],
        2082: [365, [31, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31]],
        2083: [365, [31, 32, 31, 32, 31, 31, 30, 29, 29, 30, 30, 30]],
        2084: [365, [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]],
        2085: [365, [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30]],
        2086: [365, [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31]],
        2087: [366, [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31]],
        2088: [365, [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30]],
        2089: [365, [31, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31]],
        2090: [365, [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30]],
    };

    const bsMonthNames = [
        'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
        'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];

    const adMonthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Reference date: BS 2070/01/01 = AD 2013/04/14
    const referenceBS = { year: 2070, month: 1, day: 1 };
    const referenceAD = { year: 2013, month: 4, day: 14 };

    /**
     * Convert AD date to BS date
     */
    function adToBs(adYear, adMonth, adDay) {
        const adDate = new Date(adYear, adMonth - 1, adDay);
        const refDate = new Date(referenceAD.year, referenceAD.month - 1, referenceAD.day);
        
        let daysDiff = Math.floor((adDate - refDate) / (1000 * 60 * 60 * 24));
        
        let bsYear = referenceBS.year;
        let bsMonth = referenceBS.month;
        let bsDay = referenceBS.day;

        if (daysDiff >= 0) {
            // Forward calculation
            while (daysDiff > 0) {
                const daysInMonth = bsYearData[bsYear] ? bsYearData[bsYear][1][bsMonth - 1] : 30;
                const remainingDaysInMonth = daysInMonth - bsDay + 1;

                if (daysDiff >= remainingDaysInMonth) {
                    daysDiff -= remainingDaysInMonth;
                    bsDay = 1;
                    bsMonth++;
                    if (bsMonth > 12) {
                        bsMonth = 1;
                        bsYear++;
                    }
                } else {
                    bsDay += daysDiff;
                    daysDiff = 0;
                }
            }
        } else {
            // Backward calculation
            daysDiff = Math.abs(daysDiff);
            while (daysDiff > 0) {
                if (daysDiff >= bsDay) {
                    daysDiff -= bsDay;
                    bsMonth--;
                    if (bsMonth < 1) {
                        bsMonth = 12;
                        bsYear--;
                    }
                    bsDay = bsYearData[bsYear] ? bsYearData[bsYear][1][bsMonth - 1] : 30;
                } else {
                    bsDay -= daysDiff;
                    daysDiff = 0;
                }
            }
        }

        return { year: bsYear, month: bsMonth, day: bsDay };
    }

    /**
     * Convert BS date to AD date
     */
    function bsToAd(bsYear, bsMonth, bsDay) {
        let totalDays = 0;
        
        // Calculate days from reference BS to target BS
        if (bsYear >= referenceBS.year) {
            // Forward calculation
            for (let year = referenceBS.year; year < bsYear; year++) {
                totalDays += bsYearData[year] ? bsYearData[year][0] : 365;
            }
            for (let month = referenceBS.month; month < bsMonth; month++) {
                totalDays += bsYearData[bsYear] ? bsYearData[bsYear][1][month - 1] : 30;
            }
            totalDays += bsDay - referenceBS.day;
        } else {
            // Backward calculation
            for (let year = bsYear; year < referenceBS.year; year++) {
                totalDays -= bsYearData[year] ? bsYearData[year][0] : 365;
            }
            for (let month = bsMonth; month < referenceBS.month; month++) {
                totalDays -= bsYearData[bsYear] ? bsYearData[bsYear][1][month - 1] : 30;
            }
            totalDays += bsDay - referenceBS.day;
        }

        const refDate = new Date(referenceAD.year, referenceAD.month - 1, referenceAD.day);
        const resultDate = new Date(refDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

        return {
            year: resultDate.getFullYear(),
            month: resultDate.getMonth() + 1,
            day: resultDate.getDate()
        };
    }

    /**
     * Get current BS date
     */
    function getCurrentBsDate() {
        const now = new Date();
        return adToBs(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    /**
     * Get fiscal year from BS date
     */
    function getFiscalYear(bsYear, bsMonth) {
        // Fiscal year starts from Shrawan (month 4)
        if (bsMonth >= 4) {
            return `${bsYear}/${String(bsYear + 1).slice(-2)}`;
        } else {
            return `${bsYear - 1}/${String(bsYear).slice(-2)}`;
        }
    }

    /**
     * Format BS date as string
     */
    function formatBsDate(bsYear, bsMonth, bsDay, format = 'YYYY/MM/DD') {
        const paddedMonth = String(bsMonth).padStart(2, '0');
        const paddedDay = String(bsDay).padStart(2, '0');
        
        return format
            .replace('YYYY', bsYear)
            .replace('MM', paddedMonth)
            .replace('DD', paddedDay)
            .replace('MONTH', bsMonthNames[bsMonth - 1]);
    }

    /**
     * Format AD date as string
     */
    function formatAdDate(adYear, adMonth, adDay, format = 'YYYY-MM-DD') {
        const paddedMonth = String(adMonth).padStart(2, '0');
        const paddedDay = String(adDay).padStart(2, '0');
        
        return format
            .replace('YYYY', adYear)
            .replace('MM', paddedMonth)
            .replace('DD', paddedDay)
            .replace('MONTH', adMonthNames[adMonth - 1]);
    }

    /**
     * Parse BS date string (YYYY/MM/DD or YYYY-MM-DD)
     */
    function parseBsDate(dateString) {
        const parts = dateString.split(/[/-]/);
        return {
            year: parseInt(parts[0]),
            month: parseInt(parts[1]),
            day: parseInt(parts[2])
        };
    }

    /**
     * Validate BS date
     */
    function isValidBsDate(bsYear, bsMonth, bsDay) {
        if (!bsYearData[bsYear]) return false;
        if (bsMonth < 1 || bsMonth > 12) return false;
        const daysInMonth = bsYearData[bsYear][1][bsMonth - 1];
        if (bsDay < 1 || bsDay > daysInMonth) return false;
        return true;
    }

    /**
     * Get days in BS month
     */
    function getDaysInBsMonth(bsYear, bsMonth) {
        if (!bsYearData[bsYear]) return 30;
        return bsYearData[bsYear][1][bsMonth - 1];
    }

    return {
        adToBs,
        bsToAd,
        getCurrentBsDate,
        getFiscalYear,
        formatBsDate,
        formatAdDate,
        parseBsDate,
        isValidBsDate,
        getDaysInBsMonth,
        bsMonthNames,
        adMonthNames
    };
})();
