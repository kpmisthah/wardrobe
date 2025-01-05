function emailValidateChecking(email){
    const error1 = document.getElementById('error1');
    console.log(error1+"the error1")
    const emailPattern =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(email == ""){
      error1.style.display = "block"
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

async function updateProfile(event){
    event.preventDefault()
    const form = document.getElementById('updateProfile')
    const email = form[0].value
    const password = form[1].value
    emailValidateChecking(email)
    passwordValidateChecking(password);
    if(error1.innerHTML || error2.innerHTML){
        return
    }

    try {
        const response = await fetch('/update-profile',{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email,password})
        })
        if (response.ok) {
            const result = await response.json();
            alert(result.message); // Inform user that OTP is sent
            window.location.href = '/otp'; // Redirect to OTP verification page
        }
    } catch (error) {
        console.log("The error is "+error)
    }

}