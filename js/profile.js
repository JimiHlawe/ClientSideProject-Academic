// Importing dependencies
import StorageHandler from './classes/StorageHandler.js';
import CreditCard from './classes/CreditCard.js';
import User from './classes/User.js';

// Class to handle profile updates
class ProfileManager {
    // Handles profile update submission
    static handleUpdateProfile(e) {
        e.preventDefault();

        try {
            // Collect input values from the form
            const form = e.target;
            const email = form['update-email'].value.trim();
            const password = form['update-password'].value.trim();
            const cardNumber = form['update-card-number'].value.replace(/\s/g, '');
            const cardExpiry = form['update-card-expiry'].value.trim();
            const cardStatus = form['card-status-update'].value;
            const billingDay = form['billing-day'].value.trim();

            // Ensure a user is logged in
            const currentUser = StorageHandler.getCurrentUser();
            if (!currentUser) {
                alert('User not logged in.');
                return;
            }

            // Retrieve all users and locate the current user
            const users = StorageHandler.getUsersList();
            const userIndex = users.findIndex(user => user.email === currentUser.email);

            if (userIndex === -1) {
                alert('User not found.');
                return;
            }

            // Update the user's email if changed and valid
            if (email && email !== currentUser.email) {
                if (!User.validateEmail(email)) {
                    alert('Invalid email format.');
                    return;
                }
                if (StorageHandler.findUserByEmail(email)) {
                    alert('This email is already registered.');
                    return;
                }
                currentUser.email = email;
            }

            // Update the user's password if provided and valid
            if (password) {
                if (!User.validatePassword(password)) {
                    alert('Password must include uppercase, lowercase, number, and one special character.');
                    return;
                }
                currentUser.password = password;
            }


            // Update credit card if either number or expiry is provided
            if (cardNumber || cardExpiry) {
                // Get current credit card details or create new ones
                const currentCardNumber = cardNumber || (currentUser.creditCard ? currentUser.creditCard.number : '');
                const currentExpiry = cardExpiry || (currentUser.creditCard ? currentUser.creditCard.expiryDate : '');

                // Validate card number if provided
                if (cardNumber && !CreditCard.validateNumber(cardNumber)) {
                    alert('Invalid credit card number.');
                    return;
                }

                // Validate expiry if provided
                if (cardExpiry && !CreditCard.validateExpiryDate(cardExpiry)) {
                    alert('Invalid card expiry date.');
                    return;
                }

                // Create new CreditCard instance with updated details
                currentUser.creditCard = new CreditCard(currentCardNumber, currentExpiry);
            }

            // Update billing day if valid
            if (billingDay) {
                if (!User.validateBillingDay(billingDay)) {
                    alert('Invalid billing day. Please choose a day between 1 and 28.');
                    return;
                }
                currentUser.billingDate = parseInt(billingDay, 10);
            }

            // Update card status if provided
            if (cardStatus) {
                currentUser.cardStatus = cardStatus;
            }

            // Save changes to localStorage
            users[userIndex] = currentUser;
            localStorage.setItem(StorageHandler.USERS_KEY, JSON.stringify(users));

            // Update the current user if the email was changed
            if (email && email !== currentUser.email) {
                StorageHandler.setCurrentUser(email);
            }

            alert('Profile updated successfully!');
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    }

    // Initializes profile-related event listeners
    static initialize() {
        // Listen for profile update form submission
        const updateProfileForm = document.getElementById('update-profile-form');
        if (updateProfileForm) {
            updateProfileForm.addEventListener('submit', ProfileManager.handleUpdateProfile);
        }

        // Format card expiry as the user types
        document.getElementById('update-card-expiry').addEventListener('input', (e) => {
            e.target.value = CreditCard.formatExpiry(e.target.value);
        });

        // Format card number as the user types
        document.getElementById('update-card-number').addEventListener('input', (e) => {
            e.target.value = CreditCard.formatCardNumber(e.target.value);
        });

        // Add event listener for "Back to Dashboard" button
        const backToDashboardBtn = document.getElementById('back-to-dashboard');
        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }
    }
}

// Initialize the ProfileManager when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    ProfileManager.initialize();
});
