const statusSelects = document.querySelectorAll(".statusSelect"); // Select all statusSelect elements

statusSelects.forEach((statusSelect) => {
  statusSelect.addEventListener("change", async (event) => {
    const selectedStatus = event.target.value;
    const orderId = event.target.dataset.orderId;
    console.log("The selected status is: " + selectedStatus);
    try {
      const response = await fetch("/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          orderId,
        }),
      });
    } catch (error) {
      console.log("The error" + error);
    }
  });
});

async function handleReturn(orderId, productId, action) {
  try {
    const response = await fetch("/admin/handleReturn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, productId, action }),
    });
    if (response.ok) {
      Swal.fire({
        title: "Are you going to approve?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload(); 
        }
      });
    }
  } catch (error) {
    console.log("The error is" + error);
  }
}
async function cancelOrder(orderId, productId) {
  try {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (confirmation.isConfirmed) {
      const response = await fetch("/admin/cancelorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          productId,
        }),
      });

      if (response.ok) {
        await Swal.fire({
          title: "Canceled!",
          text: "The order has been canceled successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
        location.reload();
      } else {
        await Swal.fire({
          title: "Error",
          text: "Failed to cancel the order. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      await Swal.fire({
        title: "Cancelled",
        text: "Your order is safe and has not been canceled.",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    await Swal.fire({
      title: "Error",
      text: "An unexpected error occurred.",
      icon: "error",
      confirmButtonText: "OK",
    });
    console.error("Error:", error);
  }
}
