async function addCart(productId, productName, productSize, productPrice) {
    try {
        const response = await fetch('/add-cart', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, productName, productSize, productPrice })
        });

        const result = await response.json(); // Await the result properly
        console.log("The result is", result);

        if (result.message === "product is already in cart") {
            Swal.fire({
                icon: 'warning',
                title: 'Already in Cart',
                text: 'This product is already in your cart!',
                showConfirmButton: true,
                confirmButtonColor: '#3085d6',
            });
        } else if (result.message === 'Product is added to cart successfully') {
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'The product has been added to your cart successfully!',
                showConfirmButton: true,
                confirmButtonColor: '#3085d6',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong. Please try again later!',
                showConfirmButton: true,
                confirmButtonColor: '#d33',
            });
        }
    } catch (error) {
        console.error("Error while adding to cart:", error);
        Swal.fire({
            icon: 'error',
            title: 'Unexpected Error',
            text: 'An error occurred while processing your request. Please try again.',
            showConfirmButton: true,
            confirmButtonColor: '#d33',
        });
    }
}

async function removeCart(productId) {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            const response = await fetch(`/remove-wishlist/${productId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error('Failed to delete the item');
            }

            const data = await response.json();
            await Swal.fire({
                title: 'Deleted!',
                text: 'The item has been removed from your wishlist.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            window.location.reload();
        }
    } catch (error) {
        console.error('The error is', error);

    }
}
