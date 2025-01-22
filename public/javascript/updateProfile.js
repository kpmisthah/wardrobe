
  
  function passwordValidateChecking(password){
    const error1 = document.getElementById('error1')
    console.log("the error2 is "+error1)
     const alpha = /^[a-zA-Z]+$/
     const digit = /^\d+$/;
  
     if(password.length<8){
      error1.style.display = "block";
      error1.innerHTML = "should contain atleast 8 characters"
     }else if(!alpha.test(password) && !digit.test(password)){
      error1.style.display = "block"
      error1.innerHTML = "password only contain alphabets and digits"
     }else{
      error1.style.display = "none",
      error1.innerHTML = ""
     }
    }

async function updateProfile(event){
    event.preventDefault()

    const loader = document.getElementById('loader');
    loader.style.display = 'flex'; 

    const form = document.getElementById('updateProfile')
    const password = form[0].value
    const email = form[1].value
    passwordValidateChecking(password);
    const error1 = document.getElementById('error1');
    if(error1.innerHTML){
        loader.style.display = 'none'; 
        return
    }

   
    try {
        const response = await fetch('/update-profile', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
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
            window.location.href = '/otp'; 
        } else {
            const error = await response.json();
            await Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    } catch (error) {
        console.log("Error:", error);
        await Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
    } 
}
