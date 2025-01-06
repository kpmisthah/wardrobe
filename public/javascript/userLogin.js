function emailValidateChecking(email){
  const error1 = document.getElementById('error1');
  console.log(error1+"the error1")
  const emailPattern =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if(email == ""){
    error1.style.display = "block"
    const loader = document.getElementById('loader'); // Reference the loader element
    error1.innerHTML = "please enter a valid email"
  }else if(!emailPattern.test(email)){
    error1.style.display = "block"
    error1.innerHTML = "Invalid Email"
  
    }else{
    error1.style.display = "none"
    error1.innerHTML = ''
  }
}

function passwordValidateChecking(password){
    const error2 = document.getElementById('error2')
    console.log("the error2 is "+error2)
     const alpha = /^[a-zA-Z]+$/
     const digit = /^\d+$/;
  
     if(password.length<8){
      error2.style.display = "block";
      error2.innerHTML = "should contain atleast 8 characters"
     }else if(!alpha.test(password) && !digit.test(password)){
      error2.style.display = "block"
      error2.innerHTML = "password only contain alphabets and digits"
     }else{
      error2.style.display = "none",
      error2.innerHTML = ""
     }
}

function userLogin(event){    
    //form validation
    const loader = document.getElementById('loader'); // Reference the loader element
    loader.style.display = 'block'; // Show loader
    const email = form[0].value
    const password = form[1].value

    const error1 = document.getElementById('error1');
    const error2 = document.getElementById('error2');

    emailValidateChecking(email)
    passwordValidateChecking(password);

    if(error1.innerHTML || error2.innerHTML){
      loader.style.display = 'none'; // Hide loader if validation fails
      return; // Stop further executio
    }
  setTimeout(() => {
        loader.style.display = 'none'; // Hide loader when processing is complete
        console.log('Form submitted successfully');
        alert('Login successful!'); // Simulate successful login
    }, 2000); // Simulate a delay for demonstration
    console.log('asdfasdf')

}