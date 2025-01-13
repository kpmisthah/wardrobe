async function deleteCoupon(couponId) {
    // Show confirmation prompt before proceeding with delete
    const willDelete = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this coupon?",
        icon: "warning",
        showCancelButton: true,  
        confirmButtonText: "Delete",  
        cancelButtonText: "Cancel",  
        dangerMode: true,
    });

    if (willDelete.isConfirmed) {
        try {
            const response = await fetch(`/admin/deleteCoupon/${couponId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire("Success", data.message, "success");
                window.location.reload(); 
            } else {
                Swal.fire("Error", data.message || "Failed to delete coupon", "error");
            }
        } catch (error) {
            console.log("Error deleting coupon:", error);
            Swal.fire("Error", "An error occurred while deleting the coupon.", "error");
        }
    } else {
        Swal.fire("Cancelled", "The coupon was not deleted.", "info");
    }
}
