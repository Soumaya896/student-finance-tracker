function searchRecords(records, query, caseSensitive = false) {
    if (!query.trim()) {
        return { results: records, error: ""};
    }

    let pattern;

    try {
        pattern = new RegExp(query, caseSensitive ? "g" : "gi");
    } catch {
        return {
            results: [],
            error: "Invalid search pattern. Check your regular expression."
        };
    }

    const results = records.filter(record => {
        const text = [
            record.title,
            record.description,
            record.category,
            record.date,
            record.type,
            record.amount
        ].join(" ");

        pattern.lastIndex = 0;
        return pattern.test(text);
    });

    return { results, error: ""};

}

function highlightText(text, query, caseSensitive = false) {
    const value = String(text);

    if (!query.trim()) return value;

    try {
        const pattern = new RegExp(
            query,
            caseSensitive ? "g" : "gi"
        );

        return value.replace(pattern, match => `<mark>${match}</mark>`);
    } catch {
        return value;
    }
}

export { searchRecords, highlightText };