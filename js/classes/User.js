// Exporting the User class to manage user-related functionalities
export default class User {
    // Constructor to initialize a new User instance
    constructor(email, password, birthdate, creditCard, billingDate, transactions = [], cardStatus) {
        this.email = email; // User's email
        this.password = password; // User's password
        this.birthdate = birthdate; // User's date of birth
        this.creditCard = creditCard; // User's credit card details (object)
        this.billingDate = billingDate; // User's billing date (1-28)
        this.transactions = transactions; // Array of user's transactions (default: empty array)
        this.cardStatus = cardStatus; // Status of the user's card (e.g., 'active', 'locked')
    }

    // ============================================
    // Validation Functions
    // ============================================

    // Validate the format of an email address
    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email regex
        return regex.test(email); // Returns true if the email is valid
    }

    // Validate the format of a password
    static validatePassword(password) {
        const hasUpperCase = /[A-Z]/.test(password); // Check if it has at least one uppercase letter
        const hasLowerCase = /[a-z]/.test(password); // Check if it has at least one lowercase letter
        const hasNumber = /\d/.test(password); // Check if it has at least one number
        const specialChars = password.match(/[^A-Za-z0-9]/g) || []; // Count special characters
        return password.length >= 8 && // Password must be at least 8 characters long
            hasUpperCase &&
            hasLowerCase &&
            hasNumber &&
            specialChars.length === 1; // Must contain exactly one special character
    }

    // Validate the billing day (should be between 1 and 28)
    static validateBillingDay(billingDay) {
        const day = parseInt(billingDay, 10); // Convert the input to an integer
        return day >= 1 && day <= 28; // Billing day must be within the range
    }

    // Check if the user is at least 16 years old
    static isAtLeast16(birthdate) {
        const today = new Date(); // Get the current date
        const birthDate = new Date(birthdate); // Convert the input string to a Date object
        let age = today.getFullYear() - birthDate.getFullYear(); // Calculate the initial age
        const monthDiff = today.getMonth() - birthDate.getMonth(); // Calculate the month difference
        const dayDiff = today.getDate() - birthDate.getDate(); // Calculate the day difference

        // Adjust the age if the birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age >= 16; // Return true if the user is 16 or older
    }
}
