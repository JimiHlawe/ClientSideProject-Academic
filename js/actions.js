// Importing the StorageHandler class for managing localStorage and user data
import StorageHandler from './classes/StorageHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // DOM Element References
    // ============================================

    const loadButton = document.getElementById('load-transactions'); // Button to load transactions
    const fileInput = document.getElementById('csv-file'); // File input for CSV
    const actionsTableBody = document.querySelector('#actions-table tbody'); // Table body to display transactions
    const backToDashboardBtn = document.getElementById('back-to-dashboard'); // Button to navigate back to the dashboard

    // ============================================
    // User and Card Status Check
    // ============================================

    const currentUser = StorageHandler.getCurrentUser();
    if (currentUser && currentUser.cardStatus === 'locked') {
        alert('Your card is locked. Please contact support for assistance.');
        window.location.href = 'dashboard.html'; // Redirect to the dashboard if the card is locked
        return;
    }

    // Display existing transactions if available
    if (currentUser && currentUser.transactions) {
        populateActionsTable(currentUser.transactions); // Populate the table with existing transactions
    }

    // Constants for required columns in the CSV file
    const REQUIRED_COLUMNS = ['Date', 'Business Name', 'Category', 'Amount'];

    // ============================================
    // Event Listeners
    // ============================================

    backToDashboardBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html'; // Navigate to the dashboard
    });

    loadButton.addEventListener('click', () => {
        const file = fileInput.files[0]; // Get the selected file
        if (!file) {
            showError('Please choose CSV file'); // Show error if no file is selected
            return;
        }

        if (!file.name.endsWith('.csv')) {
            showError('Please choose CSV file'); // Validate file type
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const csvData = event.target.result; // Read file content
                const transactions = parseCSV(csvData); // Parse CSV into transaction objects
                saveUserTransactions(transactions); // Save transactions to the current user
                populateActionsTable(transactions); // Update the table with new transactions
                alert('All transactions are loaded and saved successfully!');
            } catch (error) {
                showError(error.message); // Handle parsing or saving errors
            }
        };

        reader.onerror = function () {
            showError('Error reading file.'); // Handle file read errors
        };

        reader.readAsText(file, 'UTF-8'); // Read the file as text
    });

    // ============================================
    // Validation Functions
    // ============================================

    function validateCSVStructure(headers) {
        const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }
        return true;
    }

    function isValidDate(dateString) {
        const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/; // Regex for MM/DD/YYYY
        return regex.test(dateString);
    }

    // ============================================
    // CSV Parsing and Processing Functions
    // ============================================

    function parseCSV(csvData) {
        try {
            const lines = csvData.split('\n').filter(line => line.trim() !== ''); // Split lines and remove empty ones
            if (lines.length === 0) {
                throw new Error('Empty CSV file.');
            }

            const headers = lines[0].split(',').map(header => header.trim()); // Get headers from the first line
            validateCSVStructure(headers); // Validate the structure of the file

            const transactions = lines.slice(1).map((line, index) => {
                const values = line.split(','); // Split the line into columns
                if (values.length !== headers.length) {
                    throw new Error(`Invalid data in line ${index + 2}: expected ${headers.length} values but got ${values.length}`);
                }

                const transaction = {};
                headers.forEach((header, i) => {
                    let value = values[i]?.trim() || ''; // Trim values and set default

                    if (header === 'Amount') {
                        value = value.replace('₪', ''); // Remove currency symbol
                        if (isNaN(parseFloat(value))) {
                            throw new Error(`Invalid amount in line ${index + 2}: ${value}`);
                        }
                    } else if (header === 'Date') {
                        if (!isValidDate(value)) {
                            throw new Error(`Invalid date in line ${index + 2}: ${value}`);
                        }
                    }

                    transaction[header] = value; // Assign value to the respective header
                });
                return transaction;
            });

            return transactions;
        } catch (error) {
            throw new Error(`Error parsing CSV: ${error.message}`);
        }
    }

    // ============================================
    // Table Management Functions
    // ============================================

    function populateActionsTable(data) {
        actionsTableBody.innerHTML = ''; // Clear existing table data

        data.forEach(action => {
            const row = document.createElement('tr');

            // Create cells for each column and populate them
            const dateCell = document.createElement('td');
            dateCell.textContent = action.Date || '-';
            row.appendChild(dateCell);

            const businessNameCell = document.createElement('td');
            businessNameCell.textContent = action['Business Name'] || '-';
            row.appendChild(businessNameCell);

            const categoryCell = document.createElement('td');
            categoryCell.textContent = action.Category || '-';
            row.appendChild(categoryCell);

            const amountCell = document.createElement('td');
            amountCell.textContent = action.Amount || '-';
            row.appendChild(amountCell);

            actionsTableBody.appendChild(row); // Append the row to the table
        });
    }

    // ============================================
    // Data Saving Functions
    // ============================================

    function saveUserTransactions(newTransactions) {
        try {
            if (!currentUser) {
                throw new Error('No user logged in.');
            }

            currentUser.transactions = currentUser.transactions || []; // Initialize transactions if not present
            currentUser.transactions.push(...newTransactions); // Add new transactions

            const users = StorageHandler.getUsersList(); // Get the list of users
            const userIndex = users.findIndex(u => u.email === currentUser.email);

            if (userIndex === -1) {
                throw new Error('User not found in the system.');
            }

            users[userIndex] = currentUser; // Update the user data
            localStorage.setItem(StorageHandler.USERS_KEY, JSON.stringify(users)); // Save updated data to localStorage
            return true;
        } catch (error) {
            console.error('Error saving transactions:', error);
            throw error;
        }
    }

    // ============================================
    // Error Handling Functions
    // ============================================

    function showError(message) {
        alert(message); // Show an alert with the error message
    }
});
