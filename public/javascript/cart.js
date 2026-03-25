
async function addToCart(productId, name, price, stock, size) {
    if (!size || size == 'Choose an option') {
        Swal.fire({
            icon: 'warning',
            title: 'Size Required',
            text: 'Please select a size',
        });
        return
    }

    const cartItems = { productId, name, price, stock, size }
    try {
        const response = await fetch('/add-to-cart', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItems)
        })
        const responseData = await response.json();
        console.log("Add to cart response:", responseData);
        if (response.ok) {
            const updatedCart = await fetch('/cart/count');
            const { count } = await updatedCart.json();

            window.dispatchCartUpdate(count);
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'Item has been added to your cart successfully!',
                showConfirmButton: true,
                confirmButtonText: 'Continue Shopping',
                showCancelButton: true,
                cancelButtonText: 'Go to Cart',
                cancelButtonColor: '#3085d6',
                confirmButtonColor: '#28a745',
                reverseButtons: true
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = '/cart';
                }
            });
        } else {
            // Handle error responses (400, 403, 404, 500, etc.)
            Swal.fire({
                icon: 'error',
                title: responseData.message && (responseData.message.toLowerCase().includes('stock') || responseData.message.toLowerCase().includes('unavailable')) ? 'Stock Issue' : 'Failed to Add',
                text: responseData.message || 'Failed to add the item to your cart. Please try again.',
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
