async function deleteCoupon(couponId) {
    try {
        const response = await fetch(`/admin/deleteCoupon/${couponId}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (response.ok) {
            swal("Success", data.message, "success"); 
            window.location.href = '/admin/coupon';
        } else {
            swal("Error", data.message || "Failed to delete coupon", "error");
        }
    } catch (error) {
        console.log("Error deleting coupon:", error);
        swal("Error", "An error occurred while deleting the coupon.", "error");
    }
}
