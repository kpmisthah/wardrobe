const statusSelects = document.querySelectorAll(".statusSelect"); // Select all statusSelect elements

statusSelects.forEach((statusSelect) => {
  statusSelect.addEventListener("change", async (event) => {
    const selectEl = event.target;
    const selectedStatus = selectEl.value;
    const orderId = selectEl.dataset.orderId;

    // Store the previous value so we can revert if cancelled
    const previousStatus = selectEl.dataset.previousStatus || selectedStatus;

    const confirmation = await Swal.fire({
      title: "Change Order Status?",
      text: `Set status to "${selectedStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, keep it",
    });

    if (!confirmation.isConfirmed) {
      // Revert the dropdown to its previous value
      selectEl.value = previousStatus;
      return;
    }

    // Update the stored previous value
    selectEl.dataset.previousStatus = selectedStatus;

    try {
      const response = await fetch("/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, orderId }),
      });
      if (response.ok) {
        Swal.fire({ title: "Updated!", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Error", "Failed to update status.", "error");
        selectEl.value = previousStatus;
      }
    } catch (error) {
      Swal.fire("Error", "An unexpected error occurred.", "error");
      selectEl.value = previousStatus;
      console.log("The error" + error);
    }
  });

  // Initialise previousStatus from the current selected value on page load
  statusSelect.dataset.previousStatus = statusSelect.value;
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
        title: "Are you sure?",
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
