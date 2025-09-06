// The CreditCard class handles credit card validation, formatting, and operations
export default class CreditCard {
    // Constructor to initialize a credit card with its number and expiry date
    constructor(number, expiryDate) {
        this.number = number; // The full credit card number
        this.expiryDate = expiryDate; // The expiry date in MM/YY format
    }

    // ============================================
    // Validation Functions
    // ============================================

    // Validate if a credit card number contains exactly 16 digits
    static validateNumber(number) {
        const digitsOnly = number.replace(/\D/g, ''); // Remove all non-digit characters
        return digitsOnly.length === 16; // Check if the resulting string has 16 digits
    }

    // Validate the expiry date in MM/YY format and ensure it's a future date
    static validateExpiryDate(expiryDate) {
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            return false; // Check if the format matches MM/YY
        }
        const [month, year] = expiryDate.split('/'); // Split into month and year
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1); // Create a Date object
        const today = new Date(); // Current date
        return expiry > today; // Check if the expiry date is in the future
    }

    // ============================================
    // Formatting Functions
    // ============================================

    // Format the credit card number to include spaces every 4 digits (e.g., 1234 5678 9012 3456)
    static formatCardNumber(number) {
        let cardNumber = number.replace(/\D/g, ''); // Remove all non-digit characters
        return cardNumber.replace(/(.{4})(?=.)/g, '$1 '); // Insert a space after every 4 digits
    }

    // Format the expiry date to MM/YY while typing
    static formatExpiry(number) {
        let expiry = number.replace(/\D/g, ''); // Remove all non-digit characters
        if (expiry.length > 4) {
            expiry = expiry.slice(0, 4); // Limit to 4 digits
        }
        if (expiry.length > 2) {
            expiry = expiry.slice(0, 2) + '/' + expiry.slice(2); // Add a slash after the first 2 digits
        }
        return expiry;
    }

    // ============================================
    // Helper Functions
    // ============================================

    // Get the last 4 digits of the credit card number
    getLastFourDigits() {
        return this.number.slice(-4); // Extract the last 4 characters of the number
    }
}
