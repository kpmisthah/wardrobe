async function deleteCoupon(couponId) {
    try {
        const response = await fetch(`/admin/deleteCoupon/${couponId}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message); 
            window.location.href = '/admin/coupon'
        } else {
            alert(data.message || "Failed to delete coupon");
        }
    } catch (error) {
        console.log("Error deleting coupon:", error);
        alert("An error occurred while deleting the coupon.");
    }
}
