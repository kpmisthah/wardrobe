async function cancel(orderId, productId) {
    try {
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

            // Dynamically update the cancel button
            const cancelButton = document.getElementById(`cancel-button-${productId}`);
            if (cancelButton) {
                cancelButton.innerText = 'Cancelled';
                cancelButton.disabled = true;
                cancelButton.classList.remove('btn-cancel');
                cancelButton.classList.add('badge', 'bg-danger');
            }
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

            // Dynamically update the return button
            const returnButton = document.querySelector(`button[onclick="returnOrder('${productId}')"]`);
            if (returnButton) {
                const container = returnButton.parentElement;
                container.innerHTML = `<span class="badge bg-warning text-dark px-3 py-2">Return Processing</span>`;
            }
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
document.getElementById('downloadInvoices').addEventListener('click', () => {
    const orderId = document.querySelector('input[name="orderId"]').value;
    window.location.href = `/orderdetails/download/pdf/${orderId}`;
});

async function retryPayment(paymentMethod, amount, originalOrderId) {
    try {
        const response = await fetch(`/retry-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentMethod, amount, originalOrderId }),
        });

        if (response.ok) {
            const { razorpayOrderId, razorpayKey, amount: orderAmount } = await response.json();
            const options = {
                key: razorpayKey,
                amount: orderAmount * 100,
                currency: "INR",
                name: "Luxe Store",
                description: "Order Payment Retry",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        const saveResponse = await fetch("/complete-retry-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                paymentId: response.razorpay_payment_id,
                                razorpayOrderId: razorpayOrderId,
                                signature: response.razorpay_signature,
                                originalOrderId: originalOrderId,
                                amount: orderAmount,
                            }),
                        });
                        if (saveResponse.ok) {
                            const result = await saveResponse.json();
                            Swal.fire({
                                title: "Success",
                                text: "Payment completed successfully!",
                                icon: "success"
                            }).then(() => {
                                window.location.href = result.redirectUrl || "/order-confirmation";
                            });
                        }
                    } catch (error) {
                        console.error("Error saving payment:", error);
                        Swal.fire("Error", "Failed to complete payment. Please contact support.", "error");
                    }
                },
                prefill: {
                    name: "User",
                },
                theme: { color: "#1a1a1a" },
                modal: {
                    ondismiss: function () {
                        console.log("Payment modal closed");
                    },
                },
            };
            const rzp = new Razorpay(options);
            rzp.on("payment.failed", function (response) {
                Swal.fire("Error", "Payment failed. Please try again.", "error");
            });
            rzp.open();
        }
    } catch (error) {
        console.error("Error initiating retry payment:", error);
        Swal.fire("Error", "Failed to initiate payment. Please try again.", "error");
    }
}
