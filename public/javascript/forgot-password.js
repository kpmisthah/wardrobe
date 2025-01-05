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
async function forgotPassword(event){
    event.preventDefault()
    const form = document.getElementById('forgotPassword')
    const email = form[0].value
    emailValidateChecking(email)
    const error1 = document.getElementById('error1');
    if (error1.innerHTML) {
        return;
    }

    try {
        const response = await fetch('/forgot-password',{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email})
        })
        if(response.ok){
            window.location.href = '/otp-page'
        }
    } catch (error) {
        console.error("Error:", error);
        const error1 = document.getElementById('error1');
        error1.style.display = "block";
        error1.innerHTML = "An error occurred. Please try again.";
    }
}