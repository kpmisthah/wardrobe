document.addEventListener('DOMContentLoaded', () => {
    const addressCards = document.querySelectorAll('.address-card');
    const selectedAddressIdInput = document.getElementById('selected-address-id');

    addressCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove 'selected' class from all address cards
            addressCards.forEach(card => card.classList.remove('selected'));
            
            // Add 'selected' class to the clicked address card
            card.classList.add('selected');
            
            // Set the selected address ID in the hidden input
            const addressId = card.getAttribute('data-id');
            selectedAddressIdInput.value = addressId;
        });
    });
});


//coupon logic
async function applyCoupon(event){
    event.preventDefault()
    const couponCode = document.getElementById('coupon-code-input').value.trim()
    if (!couponCode) {
        alert("Please enter a coupon code");
        return;
    }
   
    try {
        const response = await fetch('/apply-coupon',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({couponCode})
        })
        const result = await response.json()
        if(response.ok){
            document.getElementById('discount-row').style.display = 'flex';
            document.getElementById('discount-amount').textContent = `₹${result.discount}`;
            document.getElementById('final-amount').textContent = `₹${result.finalAmount}`;

            document.getElementById('applied-coupon-info').style.display = 'block';
            document.getElementById('applied-coupon-code').textContent = couponCode;
            document.getElementById('coupon-code-input').disabled = true;
            alert(result.message);
        }else{
            alert(result.message);
        }
    } catch (error) {
        console.log("The error is "+error);
        
    }
}


async function removeCoupon(couponid) {
    try {
        const response = await fetch(`/remove-coupon/${couponid}`, {
            method: 'delete',
            headers: {'Content-Type': 'application/json'}
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


async function placeOrder(event){
    event.preventDefault(); 
    const form = document.getElementById('payment-form')
    const payment = form['paymentMethod'].value.trim()
    const addressId = form['addressId'].value.trim()
    let couponCode = document.getElementById('coupon-code-input').value
    if (!addressId) {
        alert("Please select a delivery address");
        return;
    }

    if (!payment) {
        alert("Please select a payment method");
        return;
    }

    try {
        const response = await fetch('/place-order',{
            method:"POST",
            headers:{"Content-Type":'application/json'},
            body:JSON.stringify({payment,addressId,couponCode})
        })
        if(response.ok){
            const result =await response.json()
                window.location.href = result.redirectUrl;  
        }
    } catch (error) {
        console.log("the error is "+error)
    }
}
