// Importing StorageHandler to manage localStorage and user data
import StorageHandler from './classes/StorageHandler.js';

// ============================================
// Event Listener for DOMContentLoaded
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard JS loaded");

    // Check if a user is logged in; if not, redirect to the login page
    const currentUser = StorageHandler.checkCurrentUser();
    if (!currentUser) {
        console.warn("No current user found. Redirecting to login.");
        window.location.href = 'login.html'; // Redirect to login page
        return;
    }

    // Initialize the dashboard with the current user's data
    initializeDashboard(currentUser);

    // Update the date and time display every minute
    setInterval(showDateTime, 60000);
});

// ============================================
// Dashboard Initialization Functions
// ============================================

// Function to initialize the dashboard
function initializeDashboard(currentUser) {
    displayUserEmail(currentUser); // Display the user's email
    showDateTime(); // Show the current date and time
    displayCardDetails(currentUser); // Display credit card details
    showTransactionSummary(currentUser); // Show a summary of transactions
    displayBillingDate(currentUser); // Display the billing date
    setupEventListeners(); // Set up event listeners for buttons

    // Check if the user's card is locked and show a warning
    if (currentUser.cardStatus === 'locked') {
        alert('Your card is locked. Please contact support for assistance.');
    }
}

// ============================================
// Display Functions
// ============================================

// Display the user's email in the UI
function displayUserEmail(currentUser) {
    const usernameElement = document.getElementById('user-email'); // Get the email display element
    if (usernameElement && currentUser.email) {
        usernameElement.textContent = currentUser.email; // Update the element with the email
        console.log("User email displayed.");
    } else {
        console.warn('User email element or user email not found.');
    }
}

// Display the current date and time in the UI
function showDateTime() {
    const dateTimeElement = document.getElementById('current-datetime'); // Get the date-time element
    if (dateTimeElement) {
        const now = new Date(); // Get the current date and time
        dateTimeElement.textContent = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        console.log("Date and time updated.");
    }
}

// Display the credit card details in the UI
function displayCardDetails(currentUser) {
    const lastDigitsElement = document.getElementById('card-last-digits'); // Last 4 digits display
    const expiryElement = document.getElementById('card-expiry'); // Expiry date display
    const cardStatusElement = document.getElementById('card-locked'); // Card status display

    if (lastDigitsElement && expiryElement && currentUser && currentUser.creditCard) {
        // Update the UI with the last 4 digits and expiry date
        lastDigitsElement.textContent = currentUser.creditCard.getLastFourDigits();
        expiryElement.textContent = currentUser.creditCard.expiryDate;
        console.log("Card details displayed.");

        // Show or hide the "locked" status based on card status
        if (currentUser.cardStatus === 'locked') {
            cardStatusElement.style.display = 'block'; // Show "locked" indicator
            cardStatusElement.classList.add('animate-stamp'); // Add animation
            console.log("Card is locked.");
        } else {
            cardStatusElement.style.display = 'none'; // Hide "locked" indicator
            console.log("Card is active.");
        }
    }
}

// Display the user's billing date in the UI
function displayBillingDate(currentUser) {
    const billingDateElement = document.getElementById('current-bill-date'); // Billing date element
    if (billingDateElement && currentUser.billingDate) {
        billingDateElement.textContent = `The current billing date is ${currentUser.billingDate}`;
        console.log("Billing date displayed.");
    } else {
        console.warn('Billing date element or user billing date not found.');
    }
}

// Show a summary of the user's transactions (current and previous month)
function showTransactionSummary(currentUser) {
    const billingDate = currentUser.billingDate;
    const transactions = currentUser.transactions;
    if (!Array.isArray(transactions)) {
        console.warn('No transactions found');
        return;
    }

    const lastMonthAmount = document.getElementById('last-month-charge'); // Last month's total display
    const currentAmount = document.getElementById('upcoming-charge'); // Current month's total display
    if (!lastMonthAmount || !currentAmount) {
        console.warn('Transaction summary elements not found');
        return;
    }

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), billingDate); // Start of this month
    const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, billingDate); // Start of last month

    // Calculate last month's total
    const lastMonthTotal = transactions
        .filter(t => {
            const date = new Date(t.Date);
            if (isNaN(date)) {
                return false;
            }
            return date >= firstOfLastMonth && date < firstOfMonth;
        })
        .reduce((sum, t) => {
            const amount = parseTransactionAmount(t.Amount);
            if (isNaN(amount)) {
                return sum;
            }
            return sum + amount;
        }, 0);

    // Calculate current month's total
    const currentMonthTotal = transactions
        .filter(t => {
            const date = new Date(t.Date);
            if (isNaN(date)) {
                return false;
            }
            return date >= firstOfMonth;
        })
        .reduce((sum, t) => {
            const amount = parseTransactionAmount(t.Amount);
            return sum + amount;
        }, 0);

    // Update the UI with the totals
    lastMonthAmount.textContent = formatCurrency(lastMonthTotal);
    currentAmount.textContent = formatCurrency(currentMonthTotal);
}

// ============================================
// Utility Functions
// ============================================

// Format amounts to the ILS currency format
function formatCurrency(amount) {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Parse and clean the transaction amount
function parseTransactionAmount(rawAmount) {
    if (!rawAmount) {
        console.warn('Amount is missing or undefined');
        return NaN;
    }

    const cleanedAmount = rawAmount.toString().replace(/[^\d.-]/g, ''); // Remove non-numeric characters
    const parsedAmount = parseFloat(cleanedAmount);

    if (isNaN(parsedAmount)) {
        console.warn(`Invalid cleaned amount: ${cleanedAmount}`);
    }

    return parsedAmount;
}

// ============================================
// Event Listeners Setup
// ============================================

// Set up event listeners for UI elements
function setupEventListeners() {
    console.log("Setting up event listeners");

    // Listener for the credit card image (navigates to the charges page)
    const creditCardImage = document.getElementById('credit-card-image');
    if (creditCardImage) {
        creditCardImage.addEventListener('click', () => {
            console.log("Credit card image clicked");
            window.location.href = 'charges.html';
        });
    } else {
        console.warn("Credit card image element not found.");
    }

    // Listener for the logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Logout button clicked");
            StorageHandler.logout(); // Log out the user
            window.location.href = 'login.html'; // Redirect to login page
        });
    } else {
        console.error("Logout button not found");
    }

    // Listener for the "Actions" button
    const actionsButton = document.getElementById('go-to-actions');
    if (actionsButton) {
        actionsButton.addEventListener('click', () => {
            console.log("Actions button clicked");
            window.location.href = 'actions.html'; // Redirect to the actions page
        });
    } else {
        console.error("Actions button not found");
    }
}
