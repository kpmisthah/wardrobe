
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function passwordValidateChecking(password) {
    const error1 = document.getElementById('error1')
    console.log("the error2 is " + error1)

    if (password.length < 8) {
        error1.style.display = "block";
        error1.innerHTML = "should contain atleast 8 characters"
    } else {
        error1.style.display = "none",
            error1.innerHTML = ""
    }
}

async function updateProfile(event) {
    event.preventDefault()

    const loader = document.getElementById('loader');

    // Get values safely
    const oldPassword = document.getElementById('oldPassword').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const emailInput = document.querySelector('input[name="email"]');
    const email = emailInput ? emailInput.value : '';

    const error0 = document.getElementById('error0');
    if (!oldPassword) {
        error0.style.display = "block";
        error0.innerHTML = "Please enter your old password";
        return;
    } else {
        error0.style.display = "none";
        error0.innerHTML = "";
    }

    loader.style.display = 'flex';

    passwordValidateChecking(password);

    // Confirm Password Validation
    const error2 = document.getElementById('error2');
    if (password !== confirmPassword) {
        error2.style.display = "block";
        error2.innerHTML = "Passwords do not match";
        loader.style.display = 'none';
        return;
    } else {
        error2.style.display = "none";
        error2.innerHTML = "";
    }

    const error1 = document.getElementById('error1');
    if (error1.innerHTML && error1.style.display !== 'none') {
        loader.style.display = 'none';
        return
    }

    try {
        const response = await fetch('/update-profile', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, oldPassword, newPassword: password }),
        });
        loader.style.display = 'none';
        if (response.ok) {
            const result = await response.json();
            await Swal.fire({
                title: 'Success!',
                text: result.message,
                icon: 'success',
                confirmButtonText: 'OK',
            });
            // Clear input fields instead of reloading
            document.getElementById('oldPassword').value = '';
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            const error = await response.json();
            if (error.message && error.message.toLowerCase().includes('old password')) {
                const error0 = document.getElementById('error0');
                error0.style.display = "block";
                error0.innerHTML = error.message;
            } else {
                await Swal.fire({
                    title: 'Error!',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        }
    } catch (error) {
        loader.style.display = 'none';
        console.log("Error:", error);
        await Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
    }
}
