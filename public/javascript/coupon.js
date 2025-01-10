async function validateCouponForm(event) {
    event.preventDefault(); 

    // Clear previous error messages
    clearErrorMessages();

    const code = document.getElementById('code').value.trim();
    const discountValue = parseFloat(document.getElementById('discountValue').value);
    const minOrderValue = parseFloat(document.getElementById('minOrderValue').value);
    const maxDiscount = parseFloat(document.getElementById('maxDiscount').value); 
    const usageLimit = parseInt(document.getElementById('usageLimit').value); 
    console.log("MININIM"+minOrderValue)
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const status = document.getElementById('status').value;
    const discountType = document.getElementById('discountType').value

    let isValid = true;

    const couponCodeRegex = /^[A-Z0-9]{6,10}$/;
    if (!couponCodeRegex.test(code)) {
        document.getElementById('codeError').textContent = "Coupon code must be between 6 to 10 characters long and contain only uppercase letters and numbers.";
        isValid = false;
    }

    if (isNaN(discountValue) || discountValue <= 0) {
        document.getElementById('discountValueError').textContent = "Discount value must be a positive number.";
        isValid = false;
    }

    if (!minOrderValue || minOrderValue <= 0) {
        document.getElementById('minOrderValueError').textContent = "Minimum order value must be a positive number.";
        isValid = false;
    }
    if (!maxDiscount || maxDiscount <= 0) {
        document.getElementById('maxDiscountError').textContent = "Max discount value must be a positive number.";
        isValid = false;
    }

    if (new Date(startDate) > new Date(endDate)) {
        document.getElementById('endDateError').textContent = "End date must be later than start date.";
        isValid = false;
    }

    if (!status) {
        document.getElementById('statusError').textContent = "Please select the status.";
        isValid = false;
    }
    if (!discountType) {
        document.getElementById('discountTypeError').textContent = "Please select a discount type.";
        isValid = false;
    }


    // Submit form if all validations pass
    if (isValid) {
            
    try {
        const couponData = {
            code,
            discountType, 
            discountValue,
            minPurchase: minOrderValue, 
            startDate,
            endDate,
            maxDiscount,
            isActive: status === 'true' 
        };
        
        const response = await fetch('/admin/coupon',{
            method:"POST",
            headers:{'Content-Type':"application/json"},
            body:JSON.stringify(couponData)
        })
        let result = await response.json()
        if(response.ok){
            console.log(result)
            window.location.href = '/admin/coupon'; 
        }else{
            console.error(result.message || 'Something went wrong')
        }
        return true
    } catch (error) {
        console.log("The error is"+error)
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


