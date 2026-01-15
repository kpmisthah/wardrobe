const name = document.getElementById("username");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("cPassword");
const error1 = document.getElementById("error1");
const error2 = document.getElementById("error2");
const error3 = document.getElementById("error3");
const error4 = document.getElementById("error4");
const error5 = document.getElementById("error5");
const loadSignup = document.getElementById("loadSignup");
const loader = document.getElementById("loader");

function nameValidateChecking() {
  const nameVal = name.value;
  const namePattern = /^[a-zA-Z\s'-]+$/;

  if (nameVal.trim() === "") {
    error1.style.display = "block";
    error1.innerHTML = "please enter a valid name";
    return false;
  } else if (!namePattern.test(nameVal)) {
    error1.style.display = "block";
    error1.innerHTML = "Name can only contain alphabets and spaces";
    return false;
  } else {
    error1.style.display = "none";
    error1.innerHTML = "";
    return true;
  }
}

function emailValidateChecking() {
  const emailval = email.value;
  const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (emailval === "") {
    error2.style.display = "block";
    error2.innerHTML = "please enter a valid email";
    return false;
  } else if (!emailPattern.test(emailval)) {
    error2.style.display = "block";
    error2.innerHTML = "Invalid Email";
    return false;
  } else if (!emailval.includes(".com")) {
    error2.style.display = "block";
    error2.innerHTML = "Enter valid Email";
    return false;
  } else {
    error2.style.display = "none";
    error2.innerHTML = "";
    return true;
  }
}

function phoneValidateChecking() {
  const phoneVal = mobile.value;

  if (phoneVal === "") {
    error3.style.display = "block";
    error3.innerHTML = "Enter a valid phone number";
    return false;
  } else if (phoneVal.length !== 10) {
    error3.style.display = "block";
    error3.innerHTML = "Enter 10 digits";
    return false;
  } else {
    error3.style.display = "none";
    error3.innerHTML = "";
    return true;
  }
}


function passwordValidateChecking() {
  const passVal = password.value;
  const cPassVal = confirmPassword.value;
  const alpha = /[a-zA-Z]/;
  const digit = /\d/;

  if (passVal.length < 8) {
    error4.style.display = "block";
    error4.innerHTML = "should contain atleast 8 characters";
    return false;
  } else if (!alpha.test(passVal) || !digit.test(passVal)) {
    error4.style.display = "block";
    error4.innerHTML = "password must contain alphabets and digits";
    return false;
  } else {
    error4.style.display = "none";
    error4.innerHTML = "";
  }

  if (passVal !== cPassVal) {
    error5.style.display = "block";
    error5.innerHTML = "password do not match";
    return false;
  } else {
    error5.style.display = "none";
    error5.innerHTML = "";
    return true;
  }

  return true;
}

async function handleSignup(event) {
  event.preventDefault();

  const isNameValid = nameValidateChecking();
  const isEmailValid = emailValidateChecking();
  const isPhoneValid = phoneValidateChecking();
  const isPasswordValid = passwordValidateChecking();

  if (
    !isNameValid ||
    !isEmailValid ||
    !isPhoneValid ||
    !isPasswordValid
  ) {
    return;
  }

  loader.style.display = "flex";

  try {
    const formData = {
      name: name.value,
      email: email.value,
      phone: mobile.value,
      password: password.value,
      cPassword: confirmPassword.value,
    };

    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok && data.redirectUrl) {
      sessionStorage.setItem("verificationEmail", data.email);
      window.location.href = data.redirectUrl;
    } else {
      if (data.message) {
        if (data.message.toLowerCase().includes("email") || data.message.toLowerCase().includes("exists")) {
          error2.style.display = "block";
          error2.innerHTML = data.message;
        } else if (data.message.toLowerCase().includes("password")) {
          error5.style.display = "block";
          error5.innerHTML = data.message;
        } else {
          alert(data.message); // Fallback for other errors
        }
      }
    }
  } catch (error) {
    console.error("An error occurred during signup:", error);
  } finally {
    loader.style.display = "none";
  }
}

document.querySelectorAll('.password-icon').forEach(icon => {
  icon.addEventListener('click', function () {
    const input = this.previousElementSibling;
    const iconElement = this.querySelector('i');

    if (input.type === 'password') {
      input.type = 'text';
      iconElement.classList.remove('fa-eye');
      iconElement.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      iconElement.classList.remove('fa-eye-slash');
      iconElement.classList.add('fa-eye');
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  loader.style.display = "none";
  loadSignup.addEventListener("submit", handleSignup);
});

