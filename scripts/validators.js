const patterns = {
    title: /^\S(?:.*\S)?$/,
    description: /^\S(?:[\s\S]*\S)?$/,
    amount: /^(?=.*[1-9])\d+(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\s+\1\b/i
};

function validateField(field, value) {
    const text = String(value ?? "");
    const trimmed = text.trim();

    if (["title", "description", "amount", "date", "category"].includes(field) && !trimmed) {
        return "This field is required.";
    }

    if (field === "title" && (!patterns.title.test(text) || text.length > 80)) {
        return "Enter a title without extra spaces at the beginning or end (maximum 80 characters).";
    }

    if (field === "description" && (!patterns.description.test(text) || text.length > 250)) {
        return "Enter a description without extra spaces at the beginning or end (maximum 250 characters).";
    }

    if (field === "amount" && (!patterns.amount.test(text) || Number(text) <= 0)) {
        return "Enter a positive amount with up to two decimal places.";
    }

    if (field === "date") {
        if (!patterns.date.test(text)) {
            return "Enter a valid date in YYYY-MM-DD format.";
        }

        const parsed = new Date(`${text}T00:00:00Z`);

        if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
            return "Enter a real calendar date.";
        }
    }

    if (field === "category" && (!patterns.category.test(text) || text.length > 50)) {
        return "Use letters, spaces or hyphens (maximum 50 characters).";
    }

    if (field === "description" && patterns.duplicateWords.test(text)) {
        return "Avoid repeating the same word twice in a row.";
    }

    return "";
}

function validateRecord(record) {
    const errors = {};
    
    if (!["income", "expense"].includes(record.type)) {
        errors.type = "Type must be income or expense.";
    }
    
    for (const field of ["title", "description", "amount", "date", "category"]) {
        const error = validateField(field, record[field]);

        if (error) {
            errors[field] = error;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

export { patterns, validateField, validateRecord };