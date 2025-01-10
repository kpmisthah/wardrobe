
async function cancel(orderId,productId) {
    try {
        // Add confirmation dialog
        const confirmDelete = confirm('Are you sure you want to cancel this item?');
        
        if (!confirmDelete) {
            return;
        }

        const response = await fetch('/order-cancel', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId,productId
            })
        });
     
        if (response.ok) {
            window.location.reload()
        }else{
            console.log("error")
        }
    } catch (error) {
        console.error("Error removing item:", error);
        alert('Failed to remove item. Something went wrong');
    }
}
// window.history.replaceState(null, null, '/emptyOrder');

async function returnOrder(productId){
    try {
        const response = await fetch('/return-order',{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({productId})
        })
        if(response.ok){
            alert("Do you want to return this product")
        }
    } catch (error) {
        console.log("The error is "+error)
    }
}