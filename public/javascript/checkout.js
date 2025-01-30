

document.addEventListener("DOMContentLoaded", () => {
  const addressCards = document.querySelectorAll(".address-card");
  const selectedAddressIdInput = document.getElementById("selected-address-id");

  addressCards.forEach((card) => {
    card.addEventListener("click", () => {
      // Remove 'selected' class from all address cards
      addressCards.forEach((card) => card.classList.remove("selected"));

      // Add 'selected' class to the clicked address card
      card.classList.add("selected");

      // Set the selected address ID in the hidden input
      const addressId = card.getAttribute("data-id");
      selectedAddressIdInput.value = addressId;
    });
  });
});

//coupon logic
async function applyCoupon(event) {
  event.preventDefault();
  const couponCode =
    document.getElementById("coupon-code-input").value.trim() || null;
  if (!couponCode) {
    swal("Error", "Please enter a coupon code", "error");
    return;
  }

  try {
    const response = await fetch("/apply-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponCode }),
    });
    const result = await response.json();
    if (response.ok) {
      document.getElementById("discount-row").style.display = "flex";
      document.getElementById(
        "discount-amount"
      ).textContent = `₹${result.discount}`;
      document.getElementById(
        "final-amount"
      ).textContent = `₹${result.finalAmount}`;

      document.getElementById("applied-coupon-info").style.display = "block";
      document.getElementById("applied-coupon-code").textContent = couponCode;
      document.getElementById("coupon-code-input").disabled = true;
      swal("Success", result.message, "success");
    
    } else {
      swal("Error", result.message, "error");
    }
  } catch (error) {
    console.log("The error is " + error);
  }
}

async function removeCoupon() {

  try {
    const response = await fetch("/remove-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const result = await response.json();
      document.getElementById("discount-row").style.display = "none";
      document.getElementById("discount-amount").textContent = "₹0";
      document.getElementById("final-amount").textContent =
      document.getElementById("subtotal").textContent;

      document.getElementById("applied-coupon-info").style.display = "none";
      document.getElementById("applied-coupon-code").textContent = "";

      document.getElementById("apply-coupon-btn").style.display = "block";
      document.getElementById("remove-coupon-btn").style.display = "none";

      const couponInput = document.getElementById("coupon-code-input");
      couponInput.disabled = false;
      couponInput.value = "";

      swal("Success", "Coupon removed successfully", "success");
    }
  } catch (error) {
    console.error("Error removing coupon:", error);
    swal("Success", result.message, "SUCCESS");
  }
}

async function placeOrder(event) {
  event.preventDefault();
  const form = document.getElementById("payment-form");
  const payment = form["paymentMethod"].value.trim(); 
  const addressId = form["addressId"].value.trim(); 
  const subtotal = document
    .getElementById("subtotal")
    .textContent.replace("₹", "")
    .trim(); 
const finalAmount = document.getElementById('final-amount') .textContent.replace("₹", "").trim()
  if (!addressId) {
    swal("Error", "Please select a delivery address", "error");
    return;
  }

  if (!payment) {
    swal("Error", "Please select a payment method", "error");
    return;
  }

  try {
    if (payment === "razorpay") {
      const response = await fetch("/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, addressId, payment }),
      });

      if (response.ok) {
        const {orderId, razorpayKey, amount } = await response.json();
        const userName = document.getElementById("user-name").value;
        const userEmail = document.getElementById("user-email").value;
        const userContact = document.getElementById("user-contact").value;

        const pendingOrder = await fetch("/create-pending-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addressId,
            amount: finalAmount||subtotal,
            razorpayOrderId: orderId
          }),
        });
        const pendingOrderData = await pendingOrder.json();
        console.log("pending orderdata",pendingOrderData);
        
        if (!pendingOrder.ok || !pendingOrderData.success) {
          swal("Error", pendingOrderData.message || "Failed to create order", "error");
          return;
        }

        const { mongoOrderId } = pendingOrderData

        const options = {
          key: razorpayKey,
          amount: amount * 100,
          currency: "INR",
          name: "wadrob",
          description: "Order Payment",
          // image: "/path-to-logo.png",
          order_id: orderId,
          handler: async function (response) {
            const confirmOrder = await fetch("/confirm-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mongoOrderId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                addressId,
                amount: subtotal,
              }),
            });

            if (confirmOrder.ok) {
              const result = await confirmOrder.json();
              swal("Success", "Order placed successfully!", "success").then(
                () => {
                  window.location.href = result.redirectUrl;
                }
              );
            } else {
              swal(
                "Error",
                "Failed to sae the order. Please try again.",
                "error"
              );
            }
          },
          prefill: {
            name: userName,
            email: userEmail,
            contact: userContact,
          },
          theme: { color: "#3399cc" },
        };

        const rzp = new Razorpay(options);
        rzp.open();

        rzp.on("payment.failed",async function (response) {
        // Update order status to "Pending" on payment failure
        const updateResponse = await fetch("/update-order-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              orderId: mongoOrderId, 
            status: "Pending",
          }),
        });

        if (!updateResponse.ok) {
          console.error("Failed to update order status");
        }
        swal("Error", "Payment failed. Please try again.", "error");
        setTimeout(()=>{
          window.location.href = '/orders'
        },2000)
      });
    }
    } else if (payment === "COD") {
      try {
        const response = await fetch('/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payment,  addressId }),
        });
    
        const result = await response.json();
    
        if (response.ok) {
            swal("Success", "Order placed successfully!", "success").then(() => {
                window.location.href = result.redirectUrl;
            });
        } else if (result.message === 'Cash on Delivery is not allowed for orders above Rs 1000.') {
            swal("Error", "Cash on Delivery is not allowed for orders above Rs 1000. Please select another payment method.", "error");
        } else {
            swal("Error", result.message || "Failed to place order. Please try again.", "error");
        }
    } catch (error) {
        swal("Error", "Something went wrong. Please try again later.", "error");
        console.error("Error placing order:", error);
    }
    
    } else if (payment == "Wallet") {
      const response = await fetch("/place-order/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment, addressId }),
      });
      if (response.ok) {
        console.log("The response is"+ response)
        const result = await response.json();
        swal("Success", "Order placed successfully!", "success").then(() => {
          window.location.href = result.redirectUrl;
        });
      } else {
        console.log("The response is"+ response)
        swal("Error", "Failed to place order.Insufficient blance in wallet", "error");
      }
    } else {
      swal("Error", "Unsupported payment method", "error");
    }
  } catch (error) {
    console.log("The error is " + error);
  }
}
