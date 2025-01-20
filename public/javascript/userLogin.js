
function emailValidateChecking(email) {
  const error1 = document.getElementById('error1');
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  
  if (email == "") {
    error1.style.display = "block";
    error1.innerHTML = "please enter a valid email";
    return false;
  } else if (!emailPattern.test(email)) {
    error1.style.display = "block";
    error1.innerHTML = "Invalid Email";
    return false;
  } else {
    error1.style.display = "none";
    error1.innerHTML = '';
    return true;
  }
}

function passwordValidateChecking(password) {
  const error2 = document.getElementById('error2');
  const alpha = /^[a-zA-Z]+$/;
  const digit = /^\d+$/;
  
  if (password.length < 8) {
    error2.style.display = "block";
    error2.innerHTML = "should contain atleast 8 characters";
    return false;
  } else if (!alpha.test(password) && !digit.test(password)) {
    error2.style.display = "block";
    error2.innerHTML = "password only contain alphabets and digits";
    return false;
  } else {
    error2.style.display = "none";
    error2.innerHTML = "";
    return true;
  }
}

async function userLogin(event) {
  event.preventDefault();

  const loader = document.getElementById('loader');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const mainError = document.getElementById('mainError');

  // Reset any previous error messages
  mainError.style.display = 'none';
  mainError.innerHTML = '';

  // Validate inputs
  const isEmailValid = emailValidateChecking(email);
  const isPasswordValid = passwordValidateChecking(password);

  if (!isEmailValid || !isPasswordValid) {
    return;
  }

  loader.style.display = 'flex';

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = '/'; 
    } else {
      mainError.style.display = 'block';
      mainError.innerHTML = data.message;
    }
  } catch (error) {
    mainError.style.display = 'block';
    mainError.innerHTML = 'An error occurred. Please try again.';
  } finally {
    loader.style.display = 'none';
  }
}