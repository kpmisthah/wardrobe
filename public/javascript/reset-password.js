document.getElementById('resetPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    let isValid = true;

    // Reset error messages
    newPasswordError.textContent = '';
    confirmPasswordError.textContent = '';

    // Password validation
    if (password.length < 8) {
        newPasswordError.textContent = 'Password must be at least 8 characters long.';
        isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match.';
        isValid = false;
    }

    // If form is not valid, stop here
    if (!isValid) {
        return;
    }

    try {
        const response = await fetch('/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            // Success, redirect or show message
            window.location.href = '/login'; // Redirect to login page
        } else {
            // Handle error response from server
            alert(data.message || 'Something went wrong. Please try again.');
        }
    } catch (error) {
        // Handle network or other errors
        console.error('Error during password reset:', error);
        alert('An error occurred while resetting the password.');
    }
});
