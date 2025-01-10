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
  const couponCode = document.getElementById("coupon-code-input").value.trim()||null;
  if (!couponCode) {
    alert("Please enter a coupon code");
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
      alert(result.message);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.log("The error is " + error);
  }
}

async function removeCoupon(couponid) {
  const couponCode = document.getElementById("coupon-code-input").value.trim()||null;
  try {
    const response = await fetch('/remove-coupon', {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body:JSON.stringify({couponCode})
    });

    if (response.ok) {
      const result = await response.json();
      // document.getElementById('discount-row').style.display = 'none';
      // document.getElementById('discount-amount').textContent = '₹0';
      // document.getElementById('final-amount').textContent = document.getElementById('subtotal').textContent;

      // document.getElementById('applied-coupon-info').style.display = 'none';
      // document.getElementById('applied-coupon-code').textContent = '';

      // document.getElementById('apply-coupon-btn').style.display = 'block';
      // document.getElementById('remove-coupon-btn').style.display = 'none';

      // const couponInput = document.getElementById('coupon-code-input');
      // couponInput.disabled = false;
      // couponInput.value = '';

      // currentCoupon = null;

      alert("Coupon removed successfully");
    }
  } catch (error) {
    console.error("Error removing coupon:", error);
    alert("Failed to remove coupon");
  }
}

async function placeOrder(event) {
  event.preventDefault();
  const form = document.getElementById("payment-form");
  const payment = form["paymentMethod"].value.trim(); // Selected payment method
  const addressId = form["addressId"].value.trim(); // Selected address ID
  const subtotal = document
    .getElementById("subtotal")
    .textContent.replace("₹", "")
    .trim(); // Order subtotal

  if (!addressId) {
    alert("Please select a delivery address");
    return;
  }

  if (!payment) {
    alert("Please select a payment method");
    return;
  }

  try {
    if (payment === "razorpay") {
      // Request backend to create Razorpay order
      const response = await fetch("/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: subtotal, addressId, payment }),
      });

      if (response.ok) {
        const { orderId, razorpayKey, amount } = await response.json(); // Get order details from backend
        const userName = document.getElementById("user-name").value;
        const userEmail = document.getElementById("user-email").value;
        const userContact = document.getElementById("user-contact").value;
        console.log("User Contact:", userContact); // Add this line to debug
        const options = {
          key: razorpayKey, // Razorpay API key
          amount: amount * 100, // Amount in paise
          currency: "INR",
          name: "wadrob",
          description: "Order Payment",
          image: "/path-to-logo.png", // Optional logo
          order_id: orderId, // Razorpay order ID
          handler: async function (response) {
            // Payment successful
            // Send payment details to backend
            const saveResponse = await fetch("/save-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                addressId,
                amount: subtotal,
              }),
            });

            if (saveResponse.ok) {
              const result = await saveResponse.json();
              alert("Order placed successfully!");
              window.location.href = result.redirectUrl;
            } else {
              alert("Failed to save the order. Please try again.");
            }
          },
          prefill: {
            name: userName, // Prefill customer details
            email: userEmail,
            contact: userContact,
          },
          theme: { color: "#3399cc" },
        };

        const rzp = new Razorpay(options);
        rzp.open();

        rzp.on("payment.failed", function (response) {
          alert("Payment failed. Please try again.");
          console.error(response.error);
        });
      }
    } else if (payment === "COD") {
      // Handle Cash on Delivery
      const response = await fetch("/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment, addressId }),
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = result.redirectUrl;
      } else {
        alert("Failed to place order. Please try again.");
      }
    } else {
      alert("Unsupported payment method");
    }
  } catch (error) {
    console.log("The error is " + error);
  }
}
