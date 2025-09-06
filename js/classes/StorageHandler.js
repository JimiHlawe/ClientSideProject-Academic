import User from './User.js';
import CreditCard from './CreditCard.js';

// StorageHandler: Handles all interactions with localStorage for user data management
export default class StorageHandler {
    static USERS_KEY = 'listOfUsers'; // Key for storing the list of users in localStorage
    static CURRENT_USER_KEY = 'current_user'; // Key for storing the current user's email in localStorage

    // ============================================
    // Initialize the localStorage keys if they don't exist
    // ============================================
    static initialize() {
        try {
            if (!localStorage.getItem(this.USERS_KEY)) {
                localStorage.setItem(this.USERS_KEY, JSON.stringify([])); // Create an empty list for users
            }
        } catch (error) {
            console.error('LocalStorage is not available:', error); // Handle localStorage errors
            alert('Your browser does not support local storage. The app may not work correctly.'); // Notify the user
        }
    }

    // ============================================
    // Get the list of users from localStorage
    // ============================================
    static getUsersList() {
        try {
            return JSON.parse(localStorage.getItem(this.USERS_KEY)) || []; // Parse and return the users list
        } catch (error) {
            console.error('Error getting users list:', error); // Log error if parsing fails
            return []; // Return an empty list as fallback
        }
    }

    // ============================================
    // Add a new user to the list in localStorage
    // ============================================
    static addUser(user) {
        try {
            const users = this.getUsersList(); // Retrieve the current list of users
            users.push(user); // Add the new user to the list
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users)); // Save the updated list back to localStorage
        } catch (error) {
            console.error('Error adding user:', error); // Log any error that occurs
            throw new Error('Failed to save user data'); // Throw a user-friendly error
        }
    }

    // ============================================
    // Check if the current user is logged in
    // Redirect to login page if no user is logged in
    // ============================================
    static checkCurrentUser() {
        const currentUser = StorageHandler.getCurrentUser(); // Get the current user
        if (!currentUser) {
            window.location.href = 'login.html'; // Redirect to login page if no user is found
            return null; // Return null as fallback
        }
        return currentUser; // Return the current user
    }

    // ============================================
    // Find a user in the list by their email address
    // ============================================
    static findUserByEmail(email) {
        const users = this.getUsersList(); // Retrieve the list of users
        let userData = null;

        // Loop through the users to find the one with the matching email
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                userData = users[i];
                break; // Stop looping once the user is found
            }
        }

        if (!userData) {
            return null; // Return null if no user is found
        }

        // Reconstruct the User and CreditCard objects from the stored data
        const creditCard = new CreditCard(
            userData.creditCard.number,
            userData.creditCard.expiryDate
        );
        return new User(
            userData.email,
            userData.password,
            userData.birthdate,
            creditCard,
            userData.billingDate,
            userData.transactions || [], // Default to an empty array if transactions are undefined
            userData.cardStatus
        );
    }

    // ============================================
    // Get the currently logged-in user
    // ============================================
    static getCurrentUser() {
        try {
            const email = localStorage.getItem(this.CURRENT_USER_KEY); // Get the email of the current user
            if (!email) return null; // Return null if no email is found
            return this.findUserByEmail(email); // Find and return the user by email
        } catch (error) {
            console.error('Error getting current user:', error); // Log any error that occurs
            return null; // Return null as fallback
        }
    }

    // ============================================
    // Set the currently logged-in user by their email
    // ============================================
    static setCurrentUser(email) {
        try {
            localStorage.setItem(this.CURRENT_USER_KEY, email); // Save the email of the current user
        } catch (error) {
            console.error('Error setting current user:', error); // Log any error that occurs
            throw new Error('Failed to set current user'); // Throw a user-friendly error
        }
    }

    // ============================================
    // Log out the current user and clear session data
    // ============================================
    static logout() {
        localStorage.removeItem('authToken'); // Example: Remove authentication token (if used)
        localStorage.removeItem(this.CURRENT_USER_KEY); // Clear the current user's email
        sessionStorage.clear(); // Clear all session storage data
        console.log("User logged out successfully."); // Log the logout action
    }
}
