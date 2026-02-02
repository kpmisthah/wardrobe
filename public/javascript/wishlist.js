async function addCart(productId, productName, productSize, productPrice, btnElement) {
    try {
        const response = await fetch('/add-to-cart', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId,
                name: productName,
                size: productSize,
                price: productPrice,
                stock: 1 // Default quantity to add
            })
        });

        const result = await response.json();
        console.log("The result is", result);

        // Normalize checks
        const msg = result.message.toLowerCase();

        if (msg.includes("already in cart")) {
            Swal.fire({
                icon: 'warning',
                title: 'Already in Cart',
                text: 'This product is already in your cart!',
                showConfirmButton: true,
                confirmButtonColor: '#3085d6',
            });
        } else if (msg.includes("added to the cart successfully") || msg.includes("product is added to cart successfully")) {

            // Update cart count using global handler or event
            if (result.cartCount !== undefined) {
                if (typeof window.dispatchCartUpdate === 'function') {
                    window.dispatchCartUpdate(result.cartCount);
                } else {
                    const event = new CustomEvent('cartUpdated', { detail: { count: result.cartCount } });
                    document.dispatchEvent(event);
                }
            }

            await Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'The product has been added to your cart successfully!',
                showConfirmButton: false,
                timer: 1500
            });

            // Remove the item from the Wishlist DOM without reloading
            if (btnElement) {
                const card = btnElement.closest('.product-card');
                if (card) {
                    // Create a fade-out effect for better UX
                    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.9)";

                    setTimeout(() => {
                        card.remove();
                        // Update item count header
                        const countEl = document.querySelector('.page-header .text-muted');
                        if (countEl) {
                            const text = countEl.innerText.trim();
                            const match = text.match(/(\d+)/);
                            if (match) {
                                const currentCount = parseInt(match[1]);
                                const newCount = Math.max(0, currentCount - 1);
                                countEl.innerText = `${newCount} Items`;

                                // If empty, reload to show empty state (optional)
                                if (newCount === 0) {
                                    window.location.reload();
                                }
                            }
                        }
                    }, 500);
                } else {
                    // Fallback if card selection failed logic
                    window.location.reload();
                }
            } else {
                // Fallback if button element passed is null/undefined
                window.location.reload();
            }

        } else if (msg.includes("not enough stock")) {
            Swal.fire({
                icon: 'error',
                title: 'Out of Stock',
                text: result.message || 'Product is out of stock.',
                showConfirmButton: true,
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'Something went wrong. Please try again later!',
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
