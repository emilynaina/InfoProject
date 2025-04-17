document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authWrapper = document.querySelector('.wrapper');
    const btnLoginPopup = document.querySelector('.btnLogin-popup');
    const iconClose = document.querySelector('.icon-close');

    // Authentication System
    const USERS_KEY = 'jobBoardUsers';
    const CURRENT_USER_KEY = 'currentUser';

    // Initialize Users if not in localStorage
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify({
            bob: {
                password: 'bobpass',
                email: 'bob@example.com',
                favorites: []
            }
        }));
    }

    // Form Validation
    const showError = (form, message) => {
        const errorDiv = form.querySelector('.form-error') || createErrorElement();
        errorDiv.textContent = message;
        form.prepend(errorDiv);
    };

    const createErrorElement = () => {
        const div = document.createElement('div');
        div.className = 'form-error';
        return div;
    };

    // Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();
        const users = JSON.parse(localStorage.getItem(USERS_KEY));

        loginForm.querySelector('.form-error')?.remove();

        if (!username || !password) {
            return showError(loginForm, 'Please fill in all fields');
        }

        const user = users[username];

        if (!user || user.password !== password) {
            return showError(loginForm, 'Invalid username or password');
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
            username,
            email: user.email,
            favorites: user.favorites
        }));

        window.location.href = 'dashboard.html';
    });

    // Registration Handler
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = registerForm.username.value.trim();
        const email = registerForm.email.value.trim();
        const password = registerForm.password.value.trim();
        const users = JSON.parse(localStorage.getItem(USERS_KEY));

        registerForm.querySelector('.form-error')?.remove();

        if (!username || !email || !password) {
            return showError(registerForm, 'All fields are required');
        }

        if (users[username]) {
            return showError(registerForm, 'Username already exists');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return showError(registerForm, 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character');
        }

        users[username] = { password, email, favorites: [] };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
            username,
            email,
            favorites: []
        }));

        window.location.href = 'dashboard.html';
    });
// UI Interactions
btnLoginPopup.addEventListener('click', () => {
    // Open the modal and show the login form
    authWrapper.classList.add('active-popup');
    document.body.classList.add('auth-active'); // Show overlay
    showLoginForm();  // Show login form initially
});

iconClose.addEventListener('click', () => {
    // Close the modal
    authWrapper.classList.remove('active-popup');
    document.body.classList.remove('auth-active'); // Hide overlay
});

// Switch Forms
document.querySelectorAll('.login-register a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (link.classList.contains('register-link')) {
            showRegisterForm(); // Switch to register form
        } else if (link.classList.contains('login-link')) {
            showLoginForm(); // Switch back to login form
        }
    });
});

// Show Login Form
function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

// Show Register Form
function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}