// Importing the StorageHandler class for managing localStorage and user data
import StorageHandler from './classes/StorageHandler.js';

let monthlyComparisonChart; // Variable to store the monthly comparison chart instance
let categoryDistributionChart; // Variable to store the category distribution chart instance

// ============================================
// Utility Functions
// ============================================

// Function to create a list of months from January 2024 to the current month
function generateMonthsList() {
    const months = [{ value: 'all', label: 'ALL MONTHS' }]; // Default option for all months
    const startDate = new Date(2024, 0); // Start date: January 2024
    const currentDate = new Date(); // Today's date

    let currentMonth = new Date(startDate);

    // Loop through months from start date to the current date
    while (currentMonth <= currentDate) {
        months.push({
            value: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`, // Format YYYY-MM
            label: `${currentMonth.toLocaleString('en', { month: 'long' })} ${currentMonth.getFullYear()}` // Format Month Year
        });

        currentMonth.setMonth(currentMonth.getMonth() + 1); // Increment month
    }

    return months;
}

// Function to populate the month selector dropdown
function populateMonthSelector() {
    const monthSelector = document.getElementById('month-selector'); // Get the dropdown element
    const months = generateMonthsList(); // Generate the list of months

    monthSelector.innerHTML = ''; // Clear existing options
    months.forEach(month => {
        const option = document.createElement('option'); // Create a new option element
        option.value = month.value; // Set the value
        option.textContent = month.label; // Set the displayed text
        monthSelector.appendChild(option); // Add the option to the dropdown
    });

    // Set default to "ALL MONTHS"
    monthSelector.value = 'all';
}

// ============================================
// Page Rendering Functions
// ============================================

// Function to display the table, charts, and summaries
function renderPage(transactions) {
    displayTransactions(transactions); // Display transactions in the table
    displayCategorySummary(transactions); // Show category summary
    displayCharts(transactions); // Render charts
}

// Function to display transactions in the table
function displayTransactions(transactions) {
    const chargesTable = document.querySelector('#charges-table tbody'); // Get the table body
    chargesTable.innerHTML = ''; // Clear the existing rows

    if (!transactions.length) {
        chargesTable.innerHTML = '<tr><td colspan="4">No transactions for this period</td></tr>'; // Show a message if no transactions
        return;
    }

    transactions.forEach(transaction => {
        const row = document.createElement('tr'); // Create a new row
        row.innerHTML = `
            <td>${new Date(transaction.Date).toLocaleDateString('en-US')}</td>
            <td>${transaction["Business Name"]}</td>
            <td>${transaction.Category}</td>
            <td>₪${parseFloat(transaction.Amount).toFixed(2)}</td>
        `; // Populate the row with transaction details
        chargesTable.appendChild(row); // Add the row to the table
    });
}

// ============================================
// Chart Display Functions
// ============================================

// Function to display charts
function displayCharts(transactions) {
    const monthlyComparisonCanvas = document.getElementById('monthly-comparison').getContext('2d'); // Get canvas for monthly comparison
    const categoryDistributionCanvas = document.getElementById('category-distribution').getContext('2d'); // Get canvas for category distribution

    // Calculate expenses by month and category
    const monthlySpending = calculateMonthlySpending(transactions);
    const categorySpending = calculateCategorySpending(transactions);

    // Destroy existing charts to avoid duplication
    if (monthlyComparisonChart) monthlyComparisonChart.destroy();
    if (categoryDistributionChart) categoryDistributionChart.destroy();

    // Monthly comparison chart
    monthlyComparisonChart = new Chart(monthlyComparisonCanvas, {
        type: 'bar', // Bar chart
        data: {
            labels: Object.keys(monthlySpending), // Months as labels
            datasets: [{
                label: 'Monthly Expenses (₪)', // Dataset label
                data: Object.values(monthlySpending), // Expenses data
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar colors
                borderColor: 'rgba(75, 192, 192, 1)', // Bar borders
                borderWidth: 1, // Bar border width
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            scales: {
                x: { title: { display: true, text: 'Month' } }, // X-axis label
                y: { title: { display: true, text: 'Amount (₪)' } } // Y-axis label
            }
        }
    });

    // Category distribution chart
    categoryDistributionChart = new Chart(categoryDistributionCanvas, {
        type: 'pie', // Pie chart
        data: {
            labels: Object.keys(categorySpending), // Categories as labels
            datasets: [{
                data: Object.values(categorySpending), // Spending per category
                backgroundColor: [ // Colors for each category
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            plugins: {
                legend: { position: 'right' }, // Legend position
                tooltip: { // Custom tooltips
                    callbacks: {
                        label: (context) => {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0); // Calculate total
                            const value = context.raw; // Current value
                            const percentage = ((value / total) * 100).toFixed(2); // Calculate percentage
                            return `${context.label}: ₪${value.toFixed(2)} (${percentage}%)`; // Tooltip text
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// Summary Display Functions
// ============================================

// Function to display category summaries and total expenses
function displayCategorySummary(transactions) {
    const totalExpensesElement = document.getElementById('total-expenses'); // Total expenses element
    const categoryList = document.querySelector('.category-list'); // Category list element
    const categorySpending = calculateCategorySpending(transactions); // Spending per category

    categoryList.innerHTML = ''; // Clear existing categories
    let totalExpenses = 0;

    // Loop through each category and amount
    Object.entries(categorySpending).forEach(([category, amount]) => {
        totalExpenses += amount; // Add to total expenses
        const listItem = document.createElement('li'); // Create list item
        listItem.innerHTML = `<span>${category}</span>: ₪${amount.toFixed(2)}`; // Set category and amount
        categoryList.appendChild(listItem); // Add to the category list
    });

    totalExpensesElement.textContent = `Total Expenses: ₪${totalExpenses.toFixed(2)}`; // Update total expenses
}

// ============================================
// Calculation Functions
// ============================================

// Calculate expenses by month
function calculateMonthlySpending(transactions) {
    return transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.Date).toLocaleString('en', { month: 'short', year: 'numeric' }); // Format month and year
        acc[month] = (acc[month] || 0) + parseFloat(transaction.Amount); // Add transaction amount
        return acc;
    }, {});
}

// Calculate expenses by category
function calculateCategorySpending(transactions) {
    return transactions.reduce((acc, transaction) => {
        acc[transaction.Category] = (acc[transaction.Category] || 0) + parseFloat(transaction.Amount); // Add transaction amount by category
        return acc;
    }, {});
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    populateMonthSelector(); // Populate the month selector dropdown

    const currentUser = StorageHandler.getCurrentUser(); // Get the current user from localStorage
    const transactions = currentUser ? currentUser.transactions || [] : []; // Retrieve transactions or default to an empty array

    renderPage(transactions); // Render the page with the transactions

    // Get the select element
    const monthSelector = document.getElementById('month-selector');

    // Function to filter transactions by month
    function filterByMonth(transactions, selectedMonth) {
        // If "all" is selected - return all transactions
        if (selectedMonth === 'all') {
            return transactions;
        }
        // Otherwise filter by selected month
        return transactions.filter(function (transaction) {
            // Create date from transaction
            const transactionDate = new Date(transaction.Date);
            // Create string of year and month
            const transactionMonth = transactionDate.getFullYear() + '-' +
                String(transactionDate.getMonth() + 1).padStart(2, '0');

            // Return only transactions from requested month
            return transactionMonth === selectedMonth;
        });
    }

    // Listen for changes in month selection
    monthSelector.addEventListener('change', function (event) {
        // Get selected month
        const selectedMonth = event.target.value;

        // Filter the transactions
        const filteredTransactions = filterByMonth(transactions, selectedMonth);

        // Render page with results
        renderPage(filteredTransactions);
    });

    // Event listener for the "Back to Dashboard" button
    const backButton = document.getElementById('back-to-dashboard');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'dashboard.html'; // Navigate to the dashboard
        });
    }
});
