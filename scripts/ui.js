import { highlightText } from "./search.js";

// Render and filter transaction records table
function renderRecords(records, query = "", caseSensitive = false, formatMoney) {
    const list = document.getElementById("records-list");
    list.replaceChildren();

    records.forEach(record => {
        const row = document.createElement("tr");

        [
            record.date,
            record.title,
            record.category,
            record.type,
            formatMoney(record.amount)
        ].forEach(value => {
            const cell = document.createElement("td");
            const text = String(value);
            const parts = query.trim()
                ? text.split(new RegExp(`(${query})`, caseSensitive ? "g" : "gi"))
                : [text];

            parts.forEach(part => {
                const matches = query.trim() &&
                    new RegExp(`^(?:${query})$`, caseSensitive ? "" : "i").test(part);

                if (matches) {
                    const mark = document.createElement("mark");
                    mark.textContent = part;
                    cell.appendChild(mark);
                } else {
                    cell.appendChild(document.createTextNode(part));
                }
            });

            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = record.id;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = record.id;

        actions.append(editButton, deleteButton);
        row.appendChild(actions);
        list.appendChild(row);
    });

    document.getElementById("records-status").textContent =
        `${records.length} transaction(s) displayed.`;

}

function renderDashboard(records, budgetLimit, formatMoney) {
    const expenses = records.filter(record => record.type === "expense");
    const total = expenses.reduce(
        (sum, record) => sum + Number(record.amount), 0
    );

    const categories = {};

    expenses.forEach(record => {
        categories[record.category] =
            (categories[record.category] || 0) + Number(record.amount);
    });

    const topCategory = Object.keys(categories).sort(
        (a, b) => categories[b] - categories[a]
    )[0] || "None";

    document.getElementById("total-records").textContent = records.length;
    document.getElementById("total-spending").textContent =
        formatMoney(total);
    document.getElementById("top-category").textContent = topCategory;

    const status = document.getElementById("budget-status");

    if (total > budgetLimit) {
        status.textContent =
            `Budget exceeded by ${formatMoney(total - budgetLimit)}.`;
        status.setAttribute("aria-live", "assertive");
    } else {
        status.textContent =
            `${formatMoney(budgetLimit - total)} remaining in your budget.`;
        status.setAttribute("aria-live", "polite");    
    }
    const chart = document.getElementById("spending-trend");
    chart.replaceChildren();

    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        days.push(day);
    }

    const dailyTotals = days.map(day => {
        const dateString = [
            day.getFullYear(),
            String(day.getMonth() + 1).padStart(2, "0"),
            String(day.getDate()).padStart(2, "0")
        ].join("-");

        return expenses
            .filter(record => record.date === dateString)
            .reduce((sum, record) => sum + Number(record.amount), 0);
    });

    const maxTotal = Math.max(...dailyTotals, 1);

    dailyTotals.forEach((amount, index) => {
        const column = document.createElement("div");
        column.style.flex = "1";
        column.style.minWidth = "0";
        column.style.display = "flex";
        column.style.flexDirection = "column";
        column.style.alignItems = "center";
        column.style.justifyContent = "flex-end";
        column.style.height = "100%";
        column.style.gap = "8px";

        const bar = document.createElement("div");
        const height = amount === 0
            ? 4
            : Math.max(4, amount / maxTotal * 100);

        bar.style.height = `${height}%`;
        bar.style.width = "100%";
        bar.style.maxWidth = "48px";
        bar.style.background = "var(--primary)";
        bar.style.borderRadius = "5px 5px 0 0";
        bar.title = `${days[index].toLocaleDateString()}: RWF ${amount.toLocaleString()}`;
        bar.setAttribute("role", "img");
        bar.setAttribute(
            "aria-label",
            `${days[index].toLocaleDateString()}: RWF ${amount.toLocaleString()} in expenses`
        );

        const label = document.createElement("span");
        label.textContent = days[index].toLocaleDateString("en", {
            weekday: "short"
        });
        label.style.fontSize = "12px";
        label.style.color = "var(--muted)";

        const amountLabel = document.createElement("span");
        amountLabel.textContent = amount === 0
            ? "0"
            : amount.toLocaleString();
            amountLabel.style.fontSize = "11px";
            amountLabel.style.textAlign = "center";
            amountLabel.style.overflowWrap = "anywhere";

            column.append(bar, amountLabel, label);
            chart.appendChild(column);
    });
}

export { renderRecords, renderDashboard };