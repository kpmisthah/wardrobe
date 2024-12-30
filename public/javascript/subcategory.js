
//form validation
const name = document.getElementById('subcategoryName')
const description = document.getElementById('subcategoryDescription')
const error1 = document.getElementById('error1')
const error2 = document.getElementById('error2')
const loadCategory = document.getElementById('loadCategory')

function nameChecking(){
    const nameVal = name.value
    const namePattern = /^[a-zA-Z\s'-]+$/;
    if(nameVal.trim() == ""){
        error1.style.display = "block"
        error1.innerHTML = "please enter a valid name"
    }else if(!namePattern.test(nameVal)){
        error1.style.display = "block"
        error1.innerHTML="name can only contain alphabets"
    
    }else{
        error1.style.display = 'none'
        error1.innerHTML = ''
    }
}

function descriptionChecking(){
    const descriptionVal = description.value
    if(descriptionVal.trim()==""){
        error2.style.display = "block"
        error2.innerHTML = "please enter a description"
    }else{
        error2.style.display ="none"
        error2.innerHTML = ''
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadCategory.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        nameChecking();  
        descriptionChecking(); 
        
     
        if (error1.innerHTML || error2.innerHTML) {
            return;  
        }
        
        // Get form values
        const name = document.getElementById('subcategoryName').value;
        const description = document.getElementById('subcategoryDescription').value;  // Get the value of description
        
        try {
            // Make the fetch request using async/await
            const response = await fetch('/admin/addsubcategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })  // Send both name and description as JSON
            });
          
            // Check if response is not OK and throw an error
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error);  // Handle the error if the response is not OK
            }
            
            // If successful, parse the response data
            const data = await response.json();
            
            // Handle the successful response, e.g., show a success message
            console.log('Category added:', data);
            window.location.reload();
        } catch (err) {
            // Handle errors in the fetch request
            if(err.message == 'subcategory is already exist'){
                Swal.fire("Error", "OOPS", "Category already exist");
                console.error("error")
            }else{
                Swal.fire("Error", "OOPS","An error occur while adding category");
            }
            
        }
    });
});
