
async function addToCart(productId,name,price,stock,size) {
    if(!size || size == 'Choose an option'){
        Swal.fire({
            icon: 'warning',
            title: 'Size Required',
            text: 'Please select a size',
        });
        return
    }

    const cartItems = {productId,name,price,stock,size}
    try {
        const response =await fetch('/add-to-cart',{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(cartItems)
        })
        const responseData = await response.json()
        if(response.ok){
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'Item has been added to your cart successfully!',
                showConfirmButton: true,
                confirmButtonColor: '#3085d6',
            });
        }else if (responseData.message == `Not enough stock.`){
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Stock',
                text: `Not enough stock left. Only ${responseData.stockLeft} items available.`,
            });
        }else if(responseData.message == `Cannot add more than 10 units per person.`){
            Swal.fire({
                icon:'error',
                title:`Not Permitted`,
                text:`Only add 10 units for a product`
            })
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Failed to Add',
                text: 'Failed to add the item to your cart. Please try again.',
            });
        }
    } catch (error) {
        console.log("Error on adding item to cart: " + error);
        Swal.fire({
            icon: 'error',
            title: 'Unexpected Error',
            text: 'An error occurred while adding the item to your cart. Please try again later.',
        });
    }
}