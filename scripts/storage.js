const KEY ="studentFinanceTracker";
const SETTINGS_KEY = "studentFinanceSettings";

const defaults = {
    currency: "RWF",
    usdRate: 1400,
    eurRate: 1600,
    budgetLimit: 100000
};

function loadRecords(){
    try {
        const data = JSON.parse(localStorage.getItem(KEY) || "[]");
        return Array.isArray(data) ? data.filter(validRecord) : [];
    } catch {
        return [];
    }
}

function validRecord(r) {
    return r && typeof r.id === "string" && r.id.trim() &&
        typeof r.title === "string" && r.title.trim() &&
        typeof r.description === "string" && r.description.trim() &&
        r.amount !== "" && r.amount !== null &&
        Number.isFinite(Number(r.amount)) && Number(r.amount) > 0 &&
        typeof r.date === "string" &&
        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(r.date) &&
        !Number.isNaN(Date.parse(r.date)) &&
        new Date(`${r.date}T00:00:00Z`).toISOString().slice(0, 10) === r.date &&
        typeof r.category === "string" && r.category.trim() &&
        ["income", "expense"].includes(r.type) &&
        typeof r.createdAt === "string" &&
        typeof r.updatedAt === "string";
}

function saveRecords(records) {
    if (!Array.isArray(records) || !records.every(validRecord) ||
    new Set(records.map(r => r.id)).size !== records.length) {
        return false;
    }

    try {
        localStorage.setItem(KEY, JSON.stringify(records));
        return true;
    } catch {
        return false;
    }
}

function loadSettings() {
    try {
        const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
        const positive = (v, d) =>
            v !== null && v !== "" && Number.isFinite(Number(v)) &&
            Number(v) > 0 ? Number(v) : d;
        const nonNegative = (v, d) =>
            v !== null && v !== "" && Number.isFinite(Number(v)) &&
            Number(v) >= 0 ? Number(v) : d;

        return {
            currency: ["RWF", "USD", "EUR"].includes(s.currency)
                ? s.currency : defaults.currency,
            usdRate: positive(s.usdRate, defaults.usdRate),
            eurRate: positive(s.eurRate, defaults.eurRate),
            budgetLimit: nonNegative(s.budgetLimit, defaults.budgetLimit)
        };
    } catch {
        return { ...defaults};
    }
}

function saveSettings(settings) {
    if (!settings || typeof settings !== "object") return false;

    try {
        const current = loadSettings();
        const currency = ["RWF", "USD", "EUR"].includes(settings.currency)
            ? settings.currency : current.currency;

        const number = (v, old, min) =>
            v !== null && v !== "" && Number.isFinite(Number(v)) &&
            Number(v) >= min ? Number(v) : old;

        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
            currency,
            usdRate:number(settings.usdRate, current.usdRate, 0.01),
            eurRate: number(settings.eurRate, current.eurRate, 0.01),
            budgetLimit: number(settings.budgetLimit, current.budgetLimit, 0)
        }));
        return true;
    } catch {
        return false;
    }
}

function validateImportedRecords(data) {
    if (!Array.isArray(data) || !data.every(validRecord)) {
        return {
            valid: false,
            records: [],
            error: "Invalid JSON data or transaction format."
        };
    }

    if (new Set(data.map(r => r.id)).size !== data.length) {
        return {
            valid: false,
            records: [],
          
            error: "Transaction IDs must be unique."
        };
    }

    return {
        valid:true,
        records: data.map(r => ({ ...r, amount: Number(r.amount) })),
        error: ""
    };
}

function exportRecords(records) {
    const result = validateImportedRecords(records);
    if (!result.valid) return false;

    try {
        const blob = new Blob([JSON.stringify(result.records, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "student-finance-backup.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
    } catch {
        return false;
    }
}

function importRecords(data) {
    const result = validateImportedRecords(data);
    if (!result.valid) return result;

    return saveRecords(result.records)
        ? result
        : {
            valid: false,
            records: [],
            error: "Could not save imported records."
        };
}

export {
    loadRecords,
    saveRecords,
    loadSettings,
    saveSettings,
    exportRecords,
    importRecords,
    validateImportedRecords
};