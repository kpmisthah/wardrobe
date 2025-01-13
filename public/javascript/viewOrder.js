async function cancel(orderId, productId) {
    try {
        // Replace confirm with Swal
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to cancel this item?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        });

        if (!result.isConfirmed) {
            return;
        }

        const response = await fetch('/order-cancel', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId, productId
            })
        });

        if (response.ok) {
            await Swal.fire({
                title: 'Cancelled!',
                text: 'The item has been cancelled successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            window.location.reload();
        } else {
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to cancel the item.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    } catch (error) {
        console.error("Error removing item:", error);
        await Swal.fire({
            title: 'Error!',
            text: 'Failed to remove item. Something went wrong',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }
}

async function returnOrder(productId) {
    try {
        // First show confirmation dialog
        const result = await Swal.fire({
            title: 'Return Product',
            text: 'Do you want to return this product?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, return it!',
            cancelButtonText: 'No, keep it'
        });

        if (!result.isConfirmed) {
            return;
        }

        const response = await fetch('/return-order', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            await Swal.fire({
                title: 'Success!',
                text: 'Return request submitted successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            window.location.reload();
        } else {
            throw new Error('Failed to process return request');
        }
    } catch (error) {
        console.log("The error is " + error);
        await Swal.fire({
            title: 'Error!',
            text: 'Failed to process return request',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }
}