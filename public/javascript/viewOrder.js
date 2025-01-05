
async function remove(productId) {
    try {
        // Add confirmation dialog
        const confirmDelete = confirm('Are you sure you want to remove this item?');
        
        if (!confirmDelete) {
            return;
        }

        const response = await fetch('/order-cancel', {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId
            })
        });
     
        if (response.ok) {
            const result = await response.json();

            if (result.redirect) {
                alert('Product deleted successfully');
                window.location.href = result.redirect;
            } else {
                console.log('Delete successful:', result);
                alert('Product deleted successfully');
                location.reload();
            }
        } else {
            console.error('Server returned error status:', response.status);
            alert("Something went wrong while deleting the product");
        }
    } catch (error) {
        console.error("Error removing item:", error);
        alert('Failed to remove item. Something went wrong');
    }
}
window.history.replaceState(null, null, '/emptyOrder');

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