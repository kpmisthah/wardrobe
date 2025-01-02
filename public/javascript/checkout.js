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
async function placeOrder(event){
    event.preventDefault(); 
    const form = document.getElementById('payment-form')
    const payment = form['paymentMethod'].value.trim()
    const addressId = form['addressId'].value.trim()
    try {
        const response = await fetch('/place-order',{
            method:"POST",
            headers:{"Content-Type":'application/json'},
            body:JSON.stringify({payment,addressId})
        })
        if(response.ok){
             window.location.href = '/order-success'
        }
    } catch (error) {
        console.log("the error is "+error)
    }
}