function emailValidateChecking(email){
    alert(email)
  const emailval = email
  const emailPattern =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if(emailval == ""){
    error1.style.display = "block"
    error1.innerHTML = "please enter a valid email"
  }else if(!emailPattern.test(emailval)){
    error1.style.display = "block"
    error1.innerHTML = "Invalid Email"
  }else if(!emailval.includes(".com")){
    error1.style.display = "block"
    error1.style.display = 'Enter valid Email'
    }else{
    error2.style.display = "none"
    error2.innerHTML = ''
  }
}

function passwordValidateChecking(password){
    const passVal = password
     const alpha = /^[a-zA-Z]+$/
     const digit = /^\d+$/;
  
     if(passVal.length<8){
      error2.style.display = "block";
      error2.innerHTML = "should contain atleast 8 characters"
     }else if(!alpha.test(passVal) && !digit.test(passVal)){
      error2.style.display = "block"
      error2.innerHTML = "password only contain alphabets and digits"
     }else{
      error2.style.display = "none",
      error2.innerHTML = ""
     }
}

function userLogin(event){
    event.preventDefault()
    
    const form = document.getElementById('loginform')
    //form validation
    const email = form[0].value
    const password = form[1].value

    emailValidateChecking(email)

    console.log('asdfasdf')

}