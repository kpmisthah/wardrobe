// function emailValidateChecking(email){
//   const error1 = document.getElementById('error1');
//   console.log(error1+"the error1")
//   const emailPattern =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//   if(email == ""){
//     error1.style.display = "block"
//     const loader = document.getElementById('loader'); // Reference the loader element
//     error1.innerHTML = "please enter a valid email"
//   }else if(!emailPattern.test(email)){
//     error1.style.display = "block"
//     error1.innerHTML = "Invalid Email"
  
//     }else{
//     error1.style.display = "none"
//     error1.innerHTML = ''
//   }
// }

// function passwordValidateChecking(password){
//     const error2 = document.getElementById('error2')
//     console.log("the error2 is "+error2)
//      const alpha = /^[a-zA-Z]+$/
//      const digit = /^\d+$/;
  
//      if(password.length<8){
//       error2.style.display = "block";
//       error2.innerHTML = "should contain atleast 8 characters"
//      }else if(!alpha.test(password) && !digit.test(password)){
//       error2.style.display = "block"
//       error2.innerHTML = "password only contain alphabets and digits"
//      }else{
//       error2.style.display = "none",
//       error2.innerHTML = ""
//      }
// }

// function userLogin(event) {
//   event.preventDefault(); // Prevent form from submitting normally

//   const loader = document.getElementById('loader'); // Reference the loader element
//   loader.style.display = 'flex'; // Show loader

//   const email = document.getElementById('email').value; // Get email input value
//   const password = document.getElementById('password').value; // Get password input value

//   const error1 = document.getElementById('error1');
//   const error2 = document.getElementById('error2');

//   // Validate email and password
//   emailValidateChecking(email);
//   passwordValidateChecking(password);

//   // If there are errors, hide loader and return
//   if (error1.innerHTML || error2.innerHTML) {
//       loader.style.display = 'none'; // Hide loader if validation fails
//       return; // Stop further execution
//   }

//   // Simulate API call or form submission
//   setTimeout(() => {
//       loader.style.display = 'none'; 
//       document.getElementById('loginform').submit(); // Submit the form
//   }, 2000); 
// }
// userLogin.js
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