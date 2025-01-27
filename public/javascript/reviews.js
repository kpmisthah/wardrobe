// async function handleReviewSubmit(event) {
//     event.preventDefault(); 

//     // Get the form element
//     const form = document.getElementById('review-form');
//     const rating = form['rating'].value; 
//     const review = form['review'].value; 
//     const productId = document.getElementById('product_id').value



//     if (!rating || !review) {
//         alert('All fields are required. Please complete the form.');
//         return;
//     }
//     form.reset()
//     try {
//         console.log("hello");
        
//         const response = await fetch('/submit-review',{
//             method:'POST',
//             headers:{'Content-Type':'application/json'},
//             body:JSON.stringify({productId,rating,review})
//         })
        
//         if(response.ok){
          
//            alert("The review addedd successfully")
//         }
//     } catch (error) {
//         console.log("The error is"+error)
//     }
// }
