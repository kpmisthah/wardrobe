async function deleteAddress(addressId,e){
    try {
        e.preventDefault()
        swal({
            title: "Are you sure?",
            text: "You didnt able to retrieve this data.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, Delete it!",
            cancelButtonText: "No, cancel please!",
            closeOnConfirm: false,
            closeOnCancel: false
          },
          async function (isConfirm) {
            if(isConfirm){
            const response = await fetch(`/delete/${addressId}`,{
                method:"DELETE",
            })
            if(response.ok){
                swal("Deleted!", "Your address has been deleted.", "success");
               location.reload()
            }else{
                const error = await response.json()
                swal("Failed!", "Could not delete the address.", "error");
            }
          }else{
            swal("Cancelled", "Your address is safe.", "error");
          }
        }
        )


    } catch (error) {
        console.log("The error deleting address",error)
    }
}