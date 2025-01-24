async function canceled(orderId) {
  const confirmation = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to cancel this order?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, cancel it!",
    cancelButtonText: "No, keep it",
  });

  if (confirmation.isConfirmed) {
    try {
      const response = await fetch("/order/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: "Canceled!",
          text: "Order canceled successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        const cancelButton = document.querySelector(
          `[data-order-id="${orderId}"] .btn-danger`
        );
        if (cancelButton) {
          cancelButton.innerText = "Cancelled";
          cancelButton.disabled = true;
          cancelButton.classList.remove("btn-danger");
          cancelButton.classList.add("btn-secondary");
        }
      } else {
        await Swal.fire({
          title: "Error!",
          text: data.message || "Failed to cancel order.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        title: "Oops!",
        text: "An error occurred while canceling the order.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  }
}
async function retryPayment(paymentMethod, amount, originalOrderId) {
  try {
    const response = await fetch(`/retry-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod, amount, originalOrderId }),
    });

    if (response.ok) {
      const { razorpayOrderId, razorpayKey, amount } =
        await response.json();
      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: "INR",
        name: "wadrob",
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
                amount: amount,
              }),
            });
            if (saveResponse.ok) {
              const result = await saveResponse.json();
              // await swal(
              //   "Success",
              //   "Payment completed successfully!",
              //   "success"
              // );
              window.location.href =
                result.redirectUrl || "/order-confirmation";
            }
          } catch (error) {
            console.error("Error saving payment:", error);
            swal(
              "Error",
              "Failed to complete payment. Please contact support.",
              "error"
            );
          }
        },
        prefill: {
          name: "user",
          email: "email",
          contact: "contact",
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed without completion");
          },
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
      // window.location.reload()
      rzp.on("payment.failed", function (response) {
        swal("Error", "Payment failed. Please try again.", "error");
      });
    }
  } catch (error) {
    console.error("Error initiating retry payment:", error);
    swal(
      "Error",
      "Failed to initiate payment. Please try again.",
      "error"
    );
  }
}
function confirmReturn(orderId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to return this order!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, return it!",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `/orders`;
    }
  });
}
