// Import required classes for managing users, credit cards, and localStorage
import CreditCard from './classes/CreditCard.js';
import User from './classes/User.js';
import StorageHandler from './classes/StorageHandler.js';

// ============================================
// Event Listener for DOMContentLoaded
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the storage system (e.g., localStorage setup)
    StorageHandler.initialize();

    // ============================================
    // Background Image Setup
    // ============================================

    //Unused function because the Ruppin Server restriction

    //changeBackground();
    //function changeBackground() {
    //    let background = document.querySelector(".page-image");
    //    if (background) {
    //        background.style.backgroundImage = 'url("https://picsum.photos/2560/1440")';
    //    }
    //

    // Function to set a random background image
    function setRandomBackgroundImage() {
        // Array of available background images
        const images = [
            '../images/1.jpg',
            '../images/2.jpg',
            '../images/3.png',
            '../images/4.jpg',
            '../images/5.jpg',
            '../images/6.jpg'
        ];

        // Select a random image index
        const randomIndex = Math.floor(Math.random() * images.length);
        const background = document.querySelector(".page-image"); // Select the element to set the background

        // Check if the element exists before applying the background
        if (background) {
            background.style.backgroundImage = `url("${images[randomIndex]}")`;
        } else {
            console.error('Element with class "page-image" not found.');
        }
    }

    setRandomBackgroundImage(); // Call the function to apply a random background image

    // ============================================
    // Registration Form Setup
    // ============================================

    if (document.getElementById('register-form')) {
        document.getElementById('register-form').addEventListener('submit', submitForm); // Handle form submission

        // Format the card expiry input dynamically
        document.getElementById('card-expiry').addEventListener('input', (e) => {
            e.target.value = CreditCard.formatExpiry(e.target.value);
        });

        // Format the card number input dynamically
        document.getElementById('card-number').addEventListener('input', (e) => {
            e.target.value = CreditCard.formatCardNumber(e.target.value);
        });
    }

    // ============================================
    // Login Form Setup
    // ============================================

    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', handleLogin); // Handle login submission
    }

    // ============================================
    // Mobile Menu Setup
    // ============================================

    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    document.body.appendChild(mobileMenu);

    // Add click event for the hamburger menu button
    document.querySelector('.icon').addEventListener('click', () => {
        const navbar = document.getElementById('navbar');
        if (!mobileMenu.contains(navbar)) {
            mobileMenu.appendChild(navbar);
            navbar.style.display = 'block'; // Show the navbar inside the mobile menu
        }
        mobileMenu.classList.toggle('show'); // Toggle menu visibility
    });
});

// ============================================
// Registration Form Submission
// ============================================

// Handle the submission of the registration form
function submitForm(e) {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
        // Gather all input values from the registration form
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const birthdate = document.getElementById('birthdate').value;
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;

        // Validate the email format
        if (!User.validateEmail(email)) {
            alert('Invalid email format.');
            return;
        }

        // Validate the password strength
        if (!User.validatePassword(password)) {
            alert('Password must include uppercase, lowercase, number, and one special character.');
            return;
        }

        // Check if the user is at least 16 years old
        if (!User.isAtLeast16(birthdate)) {
            alert('You must be at least 16 years old to register.');
            return;
        }

        // Validate the credit card number format
        if (!CreditCard.validateNumber(cardNumber)) {
            alert('Invalid credit card number.');
            return;
        }

        // Validate the credit card expiry date
        if (!CreditCard.validateExpiryDate(cardExpiry)) {
            alert('Invalid expiry date.');
            return;
        }

        // Check if the email is already registered in the system
        if (StorageHandler.findUserByEmail(email)) {
            alert('This email is already registered.');
            return;
        }

        // Create a new credit card and user object
        const creditCard = new CreditCard(cardNumber, cardExpiry);
        const user = new User(
            email,
            password,
            birthdate,
            creditCard,
            1, // Default billing day
            [], // Empty transaction list
            'active' // Default account status
        );

        // Add the new user to the system
        StorageHandler.addUser(user);
        alert('Registration successful!');
        window.location.href = 'login.html'; // Redirect to login page
    } catch (error) {
        console.error('Registration error:', error); // Log any errors for debugging
        alert('An error occurred during registration. Please try again.');
    }
}

// ============================================
// Login Form Submission
// ============================================

// Handle the submission of the login form
function handleLogin(e) {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
        // Gather login form inputs
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Find the user by their email
        const user = StorageHandler.findUserByEmail(email);
        if (user && user.password === password) {
            StorageHandler.setCurrentUser(email); // Set the logged-in user
            alert('Login successful!');
            window.location.href = 'dashboard.html'; // Redirect to the dashboard
        } else {
            alert('Invalid email or password.'); // Show an error if login fails
        }
    } catch (error) {
        alert('An error occurred during login. Please try again.'); // Handle unexpected errors
    }
}
