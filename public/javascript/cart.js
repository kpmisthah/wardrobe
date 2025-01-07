
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
async function likeProduct(productId, size, quantity) {
    if (!size || size === 'Choose an option') {
        Swal.fire({
            icon: 'warning',
            title: 'Size Required',
            text: 'Please select a size',
        });
        return;
    }
    try {
        const response = await fetch('/add-to-wishlist', {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ productId, size, quantity })
        });
        const result = await response.json();

        if (result.message === "product addedd to wishlist") {
            Swal.fire({
                icon: 'success',
                title: 'Added to Wishlist!',
                text: 'Product added successfully.',
                timer: 2000,
                showConfirmButton: false
            });
        } else if (result.message === 'product is already exist') {
            Swal.fire({
                icon: 'info',
                title: 'Already Exists',
                text: 'This product is already in your wishlist.',
                timer: 2000,
                showConfirmButton: false
            });
        } else if (result.message === "Only one quantity of a product can be added to the wishlist") {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached',
                text: 'Only one quantity of a product can be added to the wishlist.',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.log("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong. Please try again later.',
        });
    }
}
