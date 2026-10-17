# Student Finance Tracker

A responsive web application for students to record income and expenses, manage budgets and track spending.

## Features

- Add, edit and delete transactions.
- Search transactions using regular expressions.
- Toggle case-sensitive searching.
- Sort transactions by date, title or amount.
- Highlight matching search results.
- Validate transaction fields.
- Save records and settings using localStorage.
- Import and export transaction data as JSON.
- View spending summaries and a seven-day spending chart.
- Set a budget limit and view remaining or exceeded amounts.
- Display amounts in RWF, USD or EUR using manually entered exchange rates.
- Responsive layout for desktop, tablet and mobile screens.

## Technologies

- HTML5
- CSS3
- JavaScript ES modules
- Browser localStorage
- JSON

## Project Structure

- `index.html` - main application page
- `styles/styles.css` - responsive styling
- `scripts/app.js` - application event handling
- `scripts/state.js` - transaction state management
- `scripts/storage.js` - localStorage and JSON import/export
- `scripts/validators.js` - input validation
- `scripts/search.js` - regular-expression search and highlighting
- `scripts/ui.js` - dashboard, transaction list and chart rendering
- `seed.json` - sample transaction records
- `tests.html` - basic validation tests

## How to Run

1. Open the project folder in VS Code.
2. Start a local server from the terminal:

   `python -m http.server 8000`

3. Open `http://localhost:8000` in your browser.
4. To run the validation tests, open `http://localhost:8000/tests.html`.

Keep the terminal open while using the application.

## Regular Expression Catalog

| Pattern | Purpose |
|---|---|
| `^\S(?:.*\S)?$` | Checks that a title has no leading or trailing whitespace. |
| `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | Checks the date format and basic month/day ranges. |
| `\b(\w+)\s+\1\b` | Detects a repeated word next to itself using a capture group and back-reference. |
| `^(?=.*[1-9])\d+(\.\d{1,2})?$` | Uses a lookahead to require at least one non-zero digit in a positive numeric amount. |
| `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Allows category names made of words separated by spaces or hyphens. |

Search expressions are compiled dynamically. Invalid expressions should be reported instead of crashing the application.

## Keyboard Accessibility

- Use `Tab` to move between interactive controls.
- Use `Shift + Tab` to move backwards.
- Use `Enter` or `Space` to activate focused buttons and controls when supported.
- Use the visible focus indicators to identify the current control.
- Use the skip link, if available, to move directly to the main content.

## Accessibility Notes

- Semantic HTML landmarks and headings organize the page.
- Form fields have associated labels.
- Keyboard focus indicators support navigation.
- Status messages use live regions where appropriate.
- The transaction table is placed in a horizontally scrollable wrapper for small screens.
- Reduced-motion preferences should be respected.

## Testing Checklist

- [x] Valid transaction passes validation.
- [x] Invalid amount is rejected.
- [x] Invalid transaction type is rejected.
- [x] Empty title is rejected.
- [ ] Add, edit and delete transactions.
- [ ] Search and sorting.
- [ ] JSON import and export.
- [ ] Budget tracking and currency conversion.
- [ ] Responsive layout at different screen sizes.

## Notes

Exchange rates are manually configurable and are not automatically updated. Sample transactions in `seed.json` are provided for demonstration; loading them into the application depends on the app's implementation.