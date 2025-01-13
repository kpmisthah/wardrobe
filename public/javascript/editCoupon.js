async function validateEditCouponForm(event) {
  event.preventDefault();

  clearErrorMessages();

  const code = document.getElementById("code").value.trim();
  const discountValue = parseFloat(
    document.getElementById("discountValue").value
  );
  const minOrderValue = parseFloat(
    document.getElementById("minOrderValue").value
  );
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const status = document.getElementById("status").value;
  const discountType = document.getElementById("discountType").value;
  const couponId = document.getElementById("couponId").value;

  let isValid = true;

  const couponCodeRegex = /^[A-Z0-9]{6,10}$/;
  if (!couponCodeRegex.test(code)) {
    document.getElementById("codeError").textContent =
      "Coupon code must be between 6 to 10 characters long and contain only uppercase letters and numbers.";
    isValid = false;
  }

  if (isNaN(discountValue) || discountValue <= 0) {
    document.getElementById("discountValueError").textContent =
      "Discount value must be a positive number.";
    isValid = false;
  }

  if (!minOrderValue || minOrderValue <= 0) {
    document.getElementById("minOrderValueError").textContent =
      "Minimum order value must be a positive number.";
    isValid = false;
  }

  if (new Date(startDate) > new Date(endDate)) {
    document.getElementById("endDateError").textContent =
      "End date must be later than start date.";
    isValid = false;
  }

  if (!status) {
    document.getElementById("statusError").textContent =
      "Please select the status.";
    isValid = false;
  }

  if (isValid) {
    try {
      const couponData = {
        code,
        discountType,
        discountValue,
        minPurchase: minOrderValue,
        startDate,
        endDate,
        isActive: status === "true",
      };
      const response = await fetch(`/admin/editCoupon/${couponId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      });

      const result = await response.json();

      if (response.ok) {
        await swal("Success", "Coupon updated successfully!", "success");
        window.location.href = "/admin/coupon";
      } else {
        await swal("Error", result.message || "Error updating coupon", "error");
      }
      return true;
    } catch (error) {
      console.error("Error:", error);
      await swal("Error", "Error updating coupon", "error");
    }
  } else {
    return false;
  }
}

// Clear all error messages
function clearErrorMessages() {
  const errorElements = document.querySelectorAll('.text-danger');
  errorElements.forEach(element => {
    element.textContent = '';  
  });
}
