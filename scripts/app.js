import { loadSettings,saveSettings, exportRecords, importRecords } from "./storage.js";
import { getRecords, addRecord, updateRecord, deleteRecord, replaceRecords } from "./state.js";
import { validateField } from "./validators.js";
import { searchRecords } from "./search.js";
import { renderRecords,  renderDashboard } from "./ui.js";
const form = document.getElementById("record-form");
const searchInput = document.getElementById("search-input");
const caseSensitive = document.getElementById("case-sensitive");
const sortBy = document.getElementById("sort-by");

let settings = loadSettings();
let editingId = "";

function formatMoney(amount) {
    const currency = settings.currency;
    let converted = Number(amount);

    if (currency === "USD") {
        converted = converted / Number(settings.usdRate);
    } else if (currency === "EUR") {
        converted = converted / Number(settings.eurRate);
    }

    return `${currency} ${converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}
function displayRecords(){
    const query = searchRecords(
        getRecords(),
        searchInput.value,
        caseSensitive.checked
    );

    document.getElementById("search-error").textContent = query.error;

    const records = query.results.sort((a, b) => {
        switch (sortBy.value) {
            case "date-asc":
                return a.date.localeCompare(b.date);
            case "title-asc":
                return a.title.localeCompare(b.title);
            case "title-desc":
                return b.title.localeCompare(a.title);
            case "amount-asc":
                return Number(a.amount) - Number(b.amount);
            case "amount-desc":
                return Number(b.amount) - Number(a.amount);
            default:
                return b.date.localeCompare(a.date);
        }
    });

    renderRecords(
        records,
        searchInput.value,
        caseSensitive.checked,
        formatMoney
    );
    renderDashboard(getRecords(), settings.budgetLimit, formatMoney);
}

function showError(field, message) {
    document.getElementById(`${field}-error`).textContent = message;
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const data = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        amount: document.getElementById("amount").value,
        date: document.getElementById("date").value,
        category: document.getElementById("category").value
    };

    let valid = true;

    for (const field of Object.keys(data)) {
        const error = validateField(field, data[field]);
        showError(field, error);

        if (error) valid = false;
    }

    if (!valid) return;

    const now = new Date().toISOString();
    const record = {
        ...data,
        amount: Number(data.amount),
        type: document.getElementById("transaction-type").value,
        id: editingId || (
            crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
        ),
        createdAt: editingId
            ? getRecords().find(r => r.id === editingId).createdAt
            : now,
        updatedAt: now
    };

    const success = editingId
        ? updateRecord(editingId, record)
        : addRecord(record);

    if (!success) {
        document.getElementById("form-status").textContent =
            "Could not save. Please try again.";
        return;
    }

    form.reset();
    editingId = "";
    document.getElementById("record-id").value = "";
    document.getElementById("form-title").textContent = "Add a Transaction";
    document.getElementById("save-record").textContent = "Save Transaction";
    document.getElementById("cancel-edit").hidden = true;
    document.getElementById("form-status").textContent = "Transaction saved.";

    displayRecords();
});

document.getElementById("records-list").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const record = getRecords().find(r => r.id === button.dataset.id);
    if (!record) return;

    if (button.dataset.action === "edit") {
        editingId = record.id;

    for (const field of ["title", "description", "amount", "date", "category"]) {
        document.getElementById(field).value = record[field];
    }

    document.getElementById("transaction-type").value = record.type;
    document.getElementById("form-title").textContent = "Edit Transaction";
    document.getElementById("save-record").textContent = "Update Transaction";
    document.getElementById("cancel-edit").hidden = false;
    document.getElementById("add-record").scrollIntoView();
    document.getElementById("title").focus();
    }

    if (button.dataset.action === "delete" &&
        confirm("Delete this transaction?")) {
            if (deleteRecord(record.id)) displayRecords();
        }
});

document.getElementById("cancel-edit").addEventListener("click", () => {
    editingId = "";
    form.reset();
    document.getElementById("form-title").textContent = "Add a Transaction";
    document.getElementById("save-record").textContent = "Save Transaction";
    document.getElementById("cancel-edit").hidden = true;
});

searchInput.addEventListener("input", displayRecords);
caseSensitive.addEventListener("change", displayRecords);
sortBy.addEventListener("change", displayRecords);

document.getElementById("save-settings").addEventListener("click", () => {
    const next = {
        currency: document.getElementById("currency").value,
        usdRate: document.getElementById("usd-rate").value,
        eurRate: document.getElementById("eur-rate").value,
        budgetLimit: document.getElementById("budget-limit").value
    };

    if (saveSettings(next)) {
        settings = loadSettings();
        document.getElementById("settings-status").textContent = "Settings saved.";
        displayRecords();
    } else {
        document.getElementById("settings-status").textContent =
            "Could not save settings.";
    }
});

document.getElementById("export-data").addEventListener("click", () => {
    document.getElementById("settings-status").textContent =
        exportRecords(getRecords())
            ? "Backup exported."
            : "Could not export the backup.";
});

document.getElementById("import-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const data = JSON.parse(await file.text());
        const result = importRecords(data);

        if (result.valid) {
            replaceRecords(result.records);
            document.getElementById("import-status").textContent =
                "Backup imported successfully.";
            displayRecords();
        } else {
            document.getElementById("import-status").textContent = result.error;
        }
    } catch {
        document.getElementById("import-status").textContent =
            "The file is not valid JSON.";
    }

    event.target.value = "";
});

document.getElementById("currency").value = settings.currency;
document.getElementById("usd-rate").value = settings.usdRate;
document.getElementById("eur-rate").value = settings.eurRate;
document.getElementById("budget-limit").value = settings.budgetLimit;
document.getElementById("date").value =
    new Date().toISOString().slice(0, 10);

displayRecords();